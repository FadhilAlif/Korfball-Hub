import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Match } from './entities/match.entity.js';
import { MatchSquad } from './entities/match-squad.entity.js';
import { MatchEvent } from './entities/match-event.entity.js';
import { Season } from '../teams/entities/season.entity.js';
import { Athlete } from '../athletes/entities/athlete.entity.js';
import { MatchesService } from './matches.service.js';
import { MatchesController } from './matches.controller.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Match,
      MatchSquad,
      MatchEvent,
      Season,
      Athlete,
    ]),
  ],
  controllers: [MatchesController],
  providers: [MatchesService],
  exports: [TypeOrmModule, MatchesService],
})
export class MatchesModule {}
