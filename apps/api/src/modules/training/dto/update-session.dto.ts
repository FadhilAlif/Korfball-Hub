import { PartialType } from '@nestjs/swagger';
import { CreateTrainingSessionDto } from './create-session.dto.js';

export class UpdateTrainingSessionDto extends PartialType(CreateTrainingSessionDto) {}
