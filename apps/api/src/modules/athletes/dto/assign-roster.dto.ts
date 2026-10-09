import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

export class AssignRosterDto {
  @ApiProperty({ example: 'uuid', description: 'ID UUID Atlet' })
  @IsNotEmpty()
  @IsUUID()
  athlete_id: string;

  @ApiProperty({ example: 'uuid', description: 'ID UUID Musim kompetisi' })
  @IsNotEmpty()
  @IsUUID()
  season_id: string;

  @ApiProperty({ example: 7, description: 'Nomor punggung musim berjalan (unik di roster musim ini)' })
  @IsNotEmpty()
  @IsInt()
  @Min(0)
  @Max(99)
  jersey_number: number;

  @ApiPropertyOptional({ example: false, default: false, description: 'Jadikan kapten tim (Otomatis menggantikan kapten sebelumnya jika true)' })
  @IsOptional()
  @IsBoolean()
  is_captain?: boolean;

  @ApiPropertyOptional({ example: 'ACTIVE', default: 'ACTIVE', description: 'Status keikutsertaan roster' })
  @IsOptional()
  @IsString()
  status?: string;
}
