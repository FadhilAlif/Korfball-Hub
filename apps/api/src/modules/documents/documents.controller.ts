import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Request,
  ParseUUIDPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { DocumentsService } from './documents.service.js';
import { NeonAuthGuard } from '../auth/guards/neon-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { UserRole } from '../../common/enums/index.js';

@ApiTags('Documents & Object Storage')
@ApiBearerAuth('JWT-auth')
@UseGuards(NeonAuthGuard, RolesGuard)
@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post('upload')
  @Roles(UserRole.MANAGER, UserRole.COACH)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: 'Upload dokumen tim / atlet ke Neon Object Storage (Maks 10MB)',
    description: 'Menyimpan file ke bucket S3 uploads dan mencatat metadata di database.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Berkas dokumen (PDF, gambar, sertifikat, dll)',
        },
        name: {
          type: 'string',
          description: 'Nama dokumen opsional (cth: Surat Izin Turnamen)',
        },
      },
      required: ['file'],
    },
  })
  @ApiResponse({ status: 201, description: 'Dokumen berhasil diunggah' })
  @ApiResponse({ status: 400, description: 'File tidak valid atau melebihi 10MB' })
  async uploadDocument(
    @Request() req: any,
    @UploadedFile() file: Express.Multer.File,
    @Body('name') customName?: string,
  ) {
    const userId = req.user?.id || 'd0000000-0000-0000-0000-000000000001';
    const document = await this.documentsService.uploadDocument(
      userId,
      file,
      customName,
    );

    return {
      success: true,
      message: 'Dokumen berhasil diunggah ke Object Storage',
      data: document,
    };
  }

  @Get()
  @ApiOperation({
    summary: 'Ambil daftar dokumen tim beserta presigned URL unduh/preview',
  })
  @ApiResponse({ status: 200, description: 'Daftar dokumen berhasil diambil' })
  async getDocuments() {
    const result = await this.documentsService.getDocuments();
    return {
      success: true,
      message: 'Daftar dokumen berhasil diambil',
      data: result.items,
      meta: result.summary,
    };
  }

  @Get(':id/url')
  @ApiOperation({
    summary: 'Dapatkan presigned URL baru untuk dokumen privat (kedaluwarsa 1 jam)',
  })
  @ApiParam({ name: 'id', description: 'ID Dokumen UUID' })
  @ApiResponse({ status: 200, description: 'Presigned URL berhasil dibuat' })
  @ApiResponse({ status: 404, description: 'Dokumen tidak ditemukan' })
  async getDocumentPresignedUrl(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.documentsService.getDocumentPresignedUrl(id);
    return {
      success: true,
      message: 'Presigned URL berhasil dibuat',
      data,
    };
  }

  @Delete(':id')
  @Roles(UserRole.MANAGER, UserRole.COACH)
  @ApiOperation({
    summary: 'Hapus dokumen dari Neon Object Storage dan database',
  })
  @ApiParam({ name: 'id', description: 'ID Dokumen UUID' })
  @ApiResponse({ status: 200, description: 'Dokumen berhasil dihapus' })
  @ApiResponse({ status: 404, description: 'Dokumen tidak ditemukan' })
  async deleteDocument(@Param('id', ParseUUIDPipe) id: string) {
    return this.documentsService.deleteDocument(id);
  }
}
