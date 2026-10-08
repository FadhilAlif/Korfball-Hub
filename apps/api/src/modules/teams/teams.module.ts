import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Team } from './entities/team.entity.js';
import { Season } from './entities/season.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Team, Season])],
  exports: [TypeOrmModule],
})
export class TeamsModule {}
