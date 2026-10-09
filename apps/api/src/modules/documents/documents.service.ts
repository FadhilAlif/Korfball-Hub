import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Document } from './entities/document.entity.js';
import { Team } from '../teams/entities/team.entity.js';

@Injectable()
export class DocumentsService {
  private readonly s3Client: S3Client;
  private readonly bucketName: string;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
    @InjectRepository(Team)
    private readonly teamRepository: Repository<Team>,
  ) {
    const endpoint =
      this.configService.get<string>('AWS_ENDPOINT_URL_S3') ||
      'https://br-patient-night-b3kulzlo.storage.c-4.ap-southeast-1.aws.neon.tech';
    const accessKeyId =
      this.configService.get<string>('AWS_ACCESS_KEY_ID') ||
      'nak_live_7a5d9646d74f4e3fb9c3e2794110b5a0';
    const secretAccessKey =
      this.configService.get<string>('AWS_SECRET_ACCESS_KEY') ||
      'nsk_live_de32fec6ec988f9053f7e18eac1facf0ca4d028b24eaf0c5f527030d0a2c6fab';
    const region = this.configService.get<string>('AWS_REGION') || 'ap-southeast-1';

    this.bucketName =
      this.configService.get<string>('AWS_S3_BUCKET') || 'uploads';

    this.s3Client = new S3Client({
      endpoint,
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      forcePathStyle: true,
    });
  }

  /**
   * Upload file ke Neon Object Storage dan simpan record metadata ke database
   */
  async uploadDocument(
    userId: string,
    file: Express.Multer.File,
    customName?: string,
  ): Promise<Document & { view_url: string }> {
    if (!file) {
      throw new BadRequestException('File dokumen wajib diunggah.');
    }

    // Maksimal ukuran file: 10MB
    const MAX_FILE_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      throw new BadRequestException('Ukuran file maksimal adalah 10MB.');
    }

    // Dapatkan tim aktif
    const team = await this.teamRepository.findOne({ where: {} });
    const teamId = team?.id || '22e2edae-9063-41b0-914c-e74f794d6fce';

    // Buat S3 Object Key yang aman
    const sanitizedFileName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const key = `documents/${Date.now()}-${sanitizedFileName}`;

    try {
      // 1. Kirim object ke Neon S3 Storage
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucketName,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
        }),
      );
    } catch (err: any) {
      console.error('Gagal mengunggah file ke Neon S3 Storage:', err);
      throw new InternalServerErrorException(
        `Gagal mengunggah file ke Object Storage: ${err.message || 'Storage error'}`,
      );
    }

    // 2. Simpan entitas dokumen ke TypeORM
    const docName = customName?.trim() || file.originalname;
    const document = this.documentRepository.create({
      team_id: teamId,
      name: docName,
      file_path: key,
      mime_type: file.mimetype,
      file_size: file.size,
      uploaded_by: userId,
    });

    const savedDoc = await this.documentRepository.save(document);

    // 3. Buat presigned view URL (kedaluwarsa 1 jam)
    const viewUrl = await this.generatePresignedUrl(key);

    return {
      ...savedDoc,
      view_url: viewUrl,
    };
  }

  /**
   * Ambil daftar dokumen beserta presigned URL untuk setiap dokumen
   */
  async getDocuments(teamId?: string) {
    const qb = this.documentRepository
      .createQueryBuilder('doc')
      .leftJoinAndSelect('doc.team', 'team')
      .orderBy('doc.created_at', 'DESC');

    if (teamId) {
      qb.where('doc.team_id = :teamId', { teamId });
    }

    const items = await qb.getMany();

    // Hitung ringkasan storage
    const totalDocuments = items.length;
    const totalBytes = items.reduce((acc, curr) => acc + curr.file_size, 0);
    const formattedTotalSize =
      totalBytes > 1024 * 1024
        ? `${(totalBytes / (1024 * 1024)).toFixed(2)} MB`
        : `${(totalBytes / 1024).toFixed(1)} KB`;

    // Buat presigned URL untuk setiap file
    const enrichedItems = await Promise.all(
      items.map(async (doc) => {
        let view_url = '';
        try {
          view_url = await this.generatePresignedUrl(doc.file_path);
        } catch (e) {
          console.error(`Gagal membuat presigned URL untuk doc ${doc.id}:`, e);
        }
        return {
          ...doc,
          view_url,
        };
      }),
    );

    return {
      items: enrichedItems,
      summary: {
        totalDocuments,
        totalBytes,
        formattedTotalSize,
      },
    };
  }

  /**
   * Ambil presigned URL unduh untuk satu dokumen
   */
  async getDocumentPresignedUrl(id: string) {
    const doc = await this.documentRepository.findOne({ where: { id } });
    if (!doc) {
      throw new NotFoundException(`Dokumen dengan ID ${id} tidak ditemukan.`);
    }

    const url = await this.generatePresignedUrl(doc.file_path);
    return {
      url,
      expires_in: 3600,
      document: doc,
    };
  }

  /**
   * Hapus dokumen dari S3 dan database
   */
  async deleteDocument(id: string) {
    const doc = await this.documentRepository.findOne({ where: { id } });
    if (!doc) {
      throw new NotFoundException(`Dokumen dengan ID ${id} tidak ditemukan.`);
    }

    // 1. Hapus dari Neon S3
    try {
      await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: this.bucketName,
          Key: doc.file_path,
        }),
      );
    } catch (err) {
      console.warn(`Peringatan: Gagal menghapus file S3 ${doc.file_path}:`, err);
    }

    // 2. Hapus dari database
    await this.documentRepository.remove(doc);

    return {
      success: true,
      message: 'Dokumen berhasil dihapus dari sistem.',
    };
  }

  /**
   * Helper untuk membuat presigned GET URL
   */
  private async generatePresignedUrl(key: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });
    return getSignedUrl(this.s3Client, command, { expiresIn: 3600 });
  }
}
