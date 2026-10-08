import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Announcement } from './entities/announcement.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Announcement])],
  exports: [TypeOrmModule],
})
export class AnnouncementsModule {}
