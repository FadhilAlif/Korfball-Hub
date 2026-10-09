import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { Gender, AthleteStatus } from '../../../common/enums/index.js';

export class FilterAthleteDto {
  @ApiPropertyOptional({ example: 'Andi', description: 'Pencarian nama atau player_id' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: Gender, description: 'Filter jenis kelamin' })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiPropertyOptional({ enum: AthleteStatus, description: 'Filter status atlet' })
  @IsOptional()
  @IsEnum(AthleteStatus)
  status?: AthleteStatus;

  @ApiPropertyOptional({ example: 'uuid', description: 'Filter atlet pada musim kompetisi tertentu' })
  @IsOptional()
  @IsUUID()
  season_id?: string;

  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 10, default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;
}
