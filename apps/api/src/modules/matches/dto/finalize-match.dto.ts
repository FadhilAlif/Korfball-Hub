import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, Min } from 'class-validator';

export class FinalizeMatchDto {
  @ApiProperty({ example: 14, description: 'Skor akhir tim Korfball Bantul' })
  @IsNotEmpty()
  @IsInt()
  @Min(0)
  team_score: number;

  @ApiProperty({ example: 12, description: 'Skor akhir tim lawan' })
  @IsNotEmpty()
  @IsInt()
  @Min(0)
  opponent_score: number;
}
