import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { MatchEventType } from '../../../common/enums/index.js';

export enum ShotType {
  RUNNING_IN = 'RUNNING_IN',
  DISTANCE = 'DISTANCE',
  FREE_THROW = 'FREE_THROW',
  PENALTY = 'PENALTY',
}

export class RecordMatchEventDto {
  @ApiProperty({ example: 'uuid', description: 'ID Atlet pencetak gol / penerima kartu' })
  @IsNotEmpty()
  @IsUUID()
  athlete_id: string;

  @ApiProperty({
    enum: MatchEventType,
    default: MatchEventType.GOAL,
    description: 'Tipe event pertandingan',
  })
  @IsNotEmpty()
  @IsEnum(MatchEventType)
  event_type: MatchEventType;

  @ApiProperty({ example: 14, description: 'Menit terjadinya event dalam pertandingan' })
  @IsNotEmpty()
  @IsInt()
  @Min(0)
  event_time: number;

  @ApiPropertyOptional({
    enum: ShotType,
    example: ShotType.DISTANCE,
    description: 'Tipe tembakan skor korfball (RUNNING_IN, DISTANCE, FREE_THROW, PENALTY)',
  })
  @IsOptional()
  @IsEnum(ShotType)
  shot_type?: ShotType;

  @ApiPropertyOptional({
    example: 'Tembakan akurat dari luar lingkaran kuadran serang',
    description: 'Catatan tambahan terkait event',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
