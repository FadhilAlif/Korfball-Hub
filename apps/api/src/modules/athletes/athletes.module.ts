import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Athlete } from './entities/athlete.entity.js';
import { Roster } from './entities/roster.entity.js';
import { Team } from '../teams/entities/team.entity.js';
import { Season } from '../teams/entities/season.entity.js';
import { AthletesController } from './athletes.controller.js';
import { AthletesService } from './athletes.service.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Athlete, Roster, Team, Season]),
    AuthModule,
  ],
  controllers: [AthletesController],
  providers: [AthletesService],
  exports: [AthletesService, TypeOrmModule],
})
export class AthletesModule {}
