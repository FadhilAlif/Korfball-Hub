import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateSeasonDto {
  @ApiProperty({ example: '2026/2027', description: 'Nama musim kompetisi' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: '2026-01-01', description: 'Tanggal mulai musim (YYYY-MM-DD)' })
  @IsNotEmpty()
  @IsDateString()
  start_date: string;

  @ApiProperty({ example: '2026-12-31', description: 'Tanggal akhir musim (YYYY-MM-DD)' })
  @IsNotEmpty()
  @IsDateString()
  end_date: string;

  @ApiProperty({ example: true, required: false, default: false, description: 'Setel sebagai musim aktif' })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
