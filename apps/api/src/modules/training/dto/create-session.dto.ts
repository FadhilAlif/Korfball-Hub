import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { SessionStatus } from '../../../common/enums/index.js';

export class CreateActivityDto {
  @ApiProperty({ example: 'Warmup & Dynamic Stretch', description: 'Nama aktivitas drill' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  activity_name: string;

  @ApiProperty({ example: 'WARMUP', description: 'Kategori (WARMUP, TECHNICAL, TACTICAL, CONDITIONING, COOLDOWN)' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  category: string;

  @ApiProperty({ example: 15, description: 'Durasi dalam menit' })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  duration: number;

  @ApiPropertyOptional({ example: 'Mempersiapkan mobilitas sendi & denyut nadi', description: 'Target objektif drill' })
  @IsOptional()
  @IsString()
  objective?: string;

  @ApiPropertyOptional({ example: 'Fokus pada peregangan hamstring & bahu', description: 'Catatan instruksi drill' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ example: 1, description: 'Urutan pelaksanaan drill' })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  sequence: number;
}

export class CreateTrainingSessionDto {
  @ApiProperty({ example: '2026-03-20', description: 'Tanggal sesi latihan (YYYY-MM-DD)' })
  @IsNotEmpty()
  @IsDateString()
  session_date: string;

  @ApiProperty({
    example: '2026-03-20T15:30:00.000Z',
    description: 'Waktu mulai latihan (ISO 8601 UTC)',
  })
  @IsNotEmpty()
  @IsDateString()
  start_datetime: string;

  @ApiProperty({
    example: '2026-03-20T17:30:00.000Z',
    description: 'Waktu selesai latihan (ISO 8601 UTC). Harus lebih besar dari start_datetime (BR-06)',
  })
  @IsNotEmpty()
  @IsDateString()
  end_datetime: string;

  @ApiPropertyOptional({
    example: 'GOR Sasana Krida Bantul',
    description: 'Lokasi / Venue lapangan latihan',
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  venue?: string;

  @ApiProperty({
    example: 'Penguasaan Transisi Cepat 2-Zona & Akurasi Long-Distance Korf Shot',
    description: 'Fokus taktis / Target objektif sesi latihan',
  })
  @IsNotEmpty()
  @IsString()
  objective: string;

  @ApiPropertyOptional({
    example: 'Harap membawa seragam latihan merah dan botol minum sendiri',
    description: 'Catatan khusus untuk para atlet / pelatih',
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    enum: SessionStatus,
    default: SessionStatus.SCHEDULED,
    description: 'Status sesi latihan',
  })
  @IsOptional()
  @IsEnum(SessionStatus)
  status?: SessionStatus;

  @ApiPropertyOptional({
    type: [CreateActivityDto],
    description: 'Daftar drill aktivitas terstruktur dalam sesi',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateActivityDto)
  activities?: CreateActivityDto[];
}
