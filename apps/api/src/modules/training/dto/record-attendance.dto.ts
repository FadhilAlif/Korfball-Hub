import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AttendanceStatus } from '../../../common/enums/index.js';

export class AttendanceRecordItemDto {
  @ApiProperty({ example: 'uuid', description: 'ID atlet' })
  @IsNotEmpty()
  @IsUUID()
  athlete_id: string;

  @ApiProperty({
    enum: AttendanceStatus,
    example: AttendanceStatus.PRESENT,
    description: 'Status kehadiran (PRESENT, LATE, EXCUSED, ABSENT)',
  })
  @IsNotEmpty()
  @IsEnum(AttendanceStatus)
  status: AttendanceStatus;

  @ApiPropertyOptional({
    example: 7,
    description: 'Beban latihan / RPE (Rate of Perceived Exertion skala 1-10). Opsional sesuai preferensi pelatih.',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  rpe?: number;

  @ApiPropertyOptional({
    example: 'Datang terlambat 10 menit karena hujan deras',
    description: 'Catatan kehadiran',
  })
  @IsOptional()
  @IsString()
  @MaxLength(250)
  notes?: string;
}

export class BulkRecordAttendanceDto {
  @ApiProperty({
    type: [AttendanceRecordItemDto],
    description: 'Daftar presensi atlet untuk sesi latihan',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttendanceRecordItemDto)
  attendances: AttendanceRecordItemDto[];
}
