import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { SquadStatus } from '../../../common/enums/index.js';

export class SquadMemberDto {
  @ApiProperty({ example: 'uuid', description: 'ID Atlet' })
  @IsNotEmpty()
  @IsUUID()
  athlete_id: string;

  @ApiProperty({
    enum: SquadStatus,
    example: SquadStatus.STARTING,
    description: 'Status posisi skuad (STARTING / SUBSTITUTE / UNAVAILABLE)',
  })
  @IsNotEmpty()
  @IsEnum(SquadStatus)
  squad_status: SquadStatus;

  @ApiPropertyOptional({ example: false, default: false, description: 'Apakah menjabat sebagai kapten di laga ini' })
  @IsOptional()
  @IsBoolean()
  is_captain?: boolean;

  @ApiPropertyOptional({ example: 'Penugasan kuadran zona 1 serang', description: 'Catatan peran' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class AssignMatchSquadDto {
  @ApiProperty({
    type: [SquadMemberDto],
    description: 'Daftar atlet yang ditugaskan ke skuad pertandingan (Starter & Cadangan)',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SquadMemberDto)
  squad: SquadMemberDto[];
}
