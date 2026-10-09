import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';
import { MatchVenueType, MatchStatus } from '../../../common/enums/index.js';

export class CreateMatchDto {
  @ApiProperty({ example: 'Korfball Sleman', description: 'Nama tim lawan' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(120)
  opponent: string;

  @ApiPropertyOptional({
    example: 'Porda DIY 2026 • Babak Semifinal',
    description: 'Nama kompetisi / turnamen',
  })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  competition?: string;

  @ApiProperty({ example: '2026-03-25', description: 'Tanggal pertandingan (YYYY-MM-DD)' })
  @IsNotEmpty()
  @IsDateString()
  match_date: string;

  @ApiProperty({ example: '16:00', description: 'Waktu kick-off / mulai pertandingan (HH:mm)' })
  @IsNotEmpty()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'Format waktu harus HH:mm (contoh: 15:30)' })
  start_time: string;

  @ApiProperty({
    example: 'GOR Sasana Krida Bantul',
    description: 'Lokasi / Venue pertandingan',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  venue: string;

  @ApiPropertyOptional({
    enum: MatchVenueType,
    default: MatchVenueType.HOME,
    description: 'Status venue (HOME / AWAY / NEUTRAL)',
  })
  @IsOptional()
  @IsEnum(MatchVenueType)
  home_away?: MatchVenueType;

  @ApiPropertyOptional({
    example: 'uuid',
    description: 'ID Musim kompetisi. Jika kosong, otomatis memakai musim aktif.',
  })
  @IsOptional()
  @IsUUID()
  season_id?: string;

  @ApiPropertyOptional({
    example: 'Pertandingan krusial perebutan tiket final Porda DIY',
    description: 'Catatan taktis atau info pertandingan',
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    enum: MatchStatus,
    default: MatchStatus.SCHEDULED,
    description: 'Status pertandingan',
  })
  @IsOptional()
  @IsEnum(MatchStatus)
  status?: MatchStatus;

  @ApiPropertyOptional({ example: 0, description: 'Skor Korfball Bantul' })
  @IsOptional()
  @IsInt()
  @Min(0)
  team_score?: number;

  @ApiPropertyOptional({ example: 0, description: 'Skor Lawan' })
  @IsOptional()
  @IsInt()
  @Min(0)
  opponent_score?: number;
}
