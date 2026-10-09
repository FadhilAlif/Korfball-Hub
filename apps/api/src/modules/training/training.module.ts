import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrainingSession } from './entities/training-session.entity.js';
import { TrainingActivity } from './entities/training-activity.entity.js';
import { TrainingAttendance } from './entities/training-attendance.entity.js';
import { AthleteAvailability } from './entities/athlete-availability.entity.js';
import { Athlete } from '../athletes/entities/athlete.entity.js';
import { TrainingService } from './training.service.js';
import { TrainingController } from './training.controller.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TrainingSession,
      TrainingActivity,
      TrainingAttendance,
      AthleteAvailability,
      Athlete,
    ]),
  ],
  controllers: [TrainingController],
  providers: [TrainingService],
  exports: [TypeOrmModule, TrainingService],
})
export class TrainingModule {}
