import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Match } from './entities/match.entity.js';
import { MatchSquad } from './entities/match-squad.entity.js';
import { MatchEvent } from './entities/match-event.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Match, MatchSquad, MatchEvent])],
  exports: [TypeOrmModule],
})
export class MatchesModule {}
