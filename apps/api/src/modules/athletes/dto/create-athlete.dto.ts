import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  IsDateString,
  IsBoolean,
  IsUUID,
} from 'class-validator';
import { Gender, AthleteStatus } from '../../../common/enums/index.js';

export class CreateAthleteDto {
  @ApiPropertyOptional({
    example: 'KB-01',
    description: 'ID unik atlet per tim. Jika kosong, sistem otomatis men-generate (KB-XX)',
  })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  player_id?: string;

  @ApiProperty({ example: 'Andi Pratama', description: 'Nama lengkap atlet' })
  @IsNotEmpty({ message: 'Nama lengkap wajib diisi' })
  @IsString()
  @MaxLength(100)
  full_name: string;

  @ApiPropertyOptional({ example: 'Andi', description: 'Nama panggilan / display' })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  display_name?: string;

  @ApiProperty({ example: '2002-05-15', description: 'Tanggal lahir (YYYY-MM-DD)' })
  @IsNotEmpty({ message: 'Tanggal lahir wajib diisi' })
  @IsDateString({}, { message: 'Format tanggal lahir harus YYYY-MM-DD' })
  date_of_birth: string;

  @ApiProperty({ enum: Gender, example: Gender.MALE, description: 'Jenis kelamin (MALE / FEMALE)' })
  @IsNotEmpty({ message: 'Jenis kelamin wajib diisi' })
  @IsEnum(Gender, { message: 'Jenis kelamin harus MALE atau FEMALE' })
  gender: Gender;

  @ApiProperty({ example: 7, description: 'Nomor punggung dasar (0-99)' })
  @IsNotEmpty({ message: 'Nomor punggung wajib diisi' })
  @IsInt({ message: 'Nomor punggung harus bilangan bulat' })
  @Min(0, { message: 'Nomor punggung minimal 0' })
  @Max(99, { message: 'Nomor punggung maksimal 99' })
  jersey_number: number;

  @ApiPropertyOptional({ example: 'Attacker', description: 'Posisi atau spesialisasi taktis' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  position?: string;

  @ApiPropertyOptional({ example: '2026-01-10', description: 'Tanggal bergabung (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  join_date?: string;

  @ApiPropertyOptional({ enum: AthleteStatus, default: AthleteStatus.ACTIVE, description: 'Status ketersediaan atlet' })
  @IsOptional()
  @IsEnum(AthleteStatus)
  status?: AthleteStatus;

  @ApiPropertyOptional({ example: '081234567890', description: 'Nomor telepon/WA atlet' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @ApiPropertyOptional({ example: 'Bambang (Ayah)', description: 'Nama kontak darurat' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  emergency_contact?: string;

  @ApiPropertyOptional({ example: '081298765432', description: 'Nomor kontak darurat' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  emergency_phone?: string;

  @ApiPropertyOptional({ example: 'Riwayat cedera pergelangan kaki ringan', description: 'Catatan atletis atau medis' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ example: 'uuid', description: 'ID Musim aktif untuk otomatis masuk Roster' })
  @IsOptional()
  @IsUUID()
  season_id?: string;

  @ApiPropertyOptional({ example: false, default: false, description: 'Apakah atlet ini kapten tim di musim tersebut' })
  @IsOptional()
  @IsBoolean()
  is_captain?: boolean;
}
