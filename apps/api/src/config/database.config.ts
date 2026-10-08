import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from '../modules/users/entities/user.entity.js';
import { Team } from '../modules/teams/entities/team.entity.js';
import { Season } from '../modules/teams/entities/season.entity.js';
import { Athlete } from '../modules/athletes/entities/athlete.entity.js';
import { Roster } from '../modules/athletes/entities/roster.entity.js';
import { TrainingSession } from '../modules/training/entities/training-session.entity.js';
import { TrainingActivity } from '../modules/training/entities/training-activity.entity.js';
import { TrainingAttendance } from '../modules/training/entities/training-attendance.entity.js';
import { AthleteAvailability } from '../modules/training/entities/athlete-availability.entity.js';
import { Match } from '../modules/matches/entities/match.entity.js';
import { MatchSquad } from '../modules/matches/entities/match-squad.entity.js';
import { MatchEvent } from '../modules/matches/entities/match-event.entity.js';
import { Announcement } from '../modules/announcements/entities/announcement.entity.js';
import { Document } from '../modules/documents/entities/document.entity.js';
import { AuditLog } from '../modules/audit/entities/audit-log.entity.js';

export const allEntities = [
  User,
  Team,
  Season,
  Athlete,
  Roster,
  TrainingSession,
  TrainingActivity,
  TrainingAttendance,
  AthleteAvailability,
  Match,
  MatchSquad,
  MatchEvent,
  Announcement,
  Document,
  AuditLog,
];

export const getDatabaseConfig = (): TypeOrmModuleOptions => {
  const databaseUrl = process.env.DATABASE_URL;

  return {
    type: 'postgres',
    url: databaseUrl,
    ssl: {
      rejectUnauthorized: false,
    },
    entities: allEntities,
    synchronize: process.env.NODE_ENV !== 'production', // true during development
    logging: process.env.NODE_ENV === 'development',
  };
};
