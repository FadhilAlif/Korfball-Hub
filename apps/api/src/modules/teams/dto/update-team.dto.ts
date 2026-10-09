import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateTeamDto {
  @ApiPropertyOptional({ example: 'Korfball Bantul', description: 'Nama klub/tim' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ example: 'Senior', description: 'Kategori usia / divisi' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  category?: string;

  @ApiPropertyOptional({ example: 'Bantul', description: 'Daerah / regional' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  region?: string;

  @ApiPropertyOptional({ example: 'GOR Dwi Windu Bantul', description: 'Home venue tim' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  home_venue?: string;

  @ApiPropertyOptional({ example: 'Tim resmi Korfball Kabupaten Bantul', description: 'Deskripsi tim' })
  @IsOptional()
  @IsString()
  description?: string;
}
