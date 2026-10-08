import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrainingSession } from './entities/training-session.entity.js';
import { TrainingActivity } from './entities/training-activity.entity.js';
import { TrainingAttendance } from './entities/training-attendance.entity.js';
import { AthleteAvailability } from './entities/athlete-availability.entity.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TrainingSession,
      TrainingActivity,
      TrainingAttendance,
      AthleteAvailability,
    ]),
  ],
  exports: [TypeOrmModule],
})
export class TrainingModule {}
