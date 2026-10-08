import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getDatabaseConfig } from './config/database.config.js';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { UsersModule } from './modules/users/users.module.js';
import { TeamsModule } from './modules/teams/teams.module.js';
import { AthletesModule } from './modules/athletes/athletes.module.js';
import { TrainingModule } from './modules/training/training.module.js';
import { MatchesModule } from './modules/matches/matches.module.js';
import { AnnouncementsModule } from './modules/announcements/announcements.module.js';
import { DocumentsModule } from './modules/documents/documents.module.js';
import { AuditModule } from './modules/audit/audit.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../../.env.local'],
    }),
    TypeOrmModule.forRootAsync({
      useFactory: () => getDatabaseConfig(),
    }),
    UsersModule,
    TeamsModule,
    AthletesModule,
    TrainingModule,
    MatchesModule,
    AnnouncementsModule,
    DocumentsModule,
    AuditModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
