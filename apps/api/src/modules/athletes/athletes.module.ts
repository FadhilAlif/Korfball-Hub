import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Athlete } from './entities/athlete.entity.js';
import { Roster } from './entities/roster.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Athlete, Roster])],
  exports: [TypeOrmModule],
})
export class AthletesModule {}
