import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
  OneToMany,
  type Relation,
} from 'typeorm';
import { Team } from '../../teams/entities/team.entity.js';
import { Season } from '../../teams/entities/season.entity.js';
import { MatchStatus, MatchResult, MatchVenueType } from '../../../common/enums/index.js';
import { MatchSquad } from './match-squad.entity.js';
import { MatchEvent } from './match-event.entity.js';

@Entity('matches')
export class Match {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  team_id: string;

  @ManyToOne(() => Team, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'team_id' })
  team: Relation<Team>;

  @Index()
  @Column({ type: 'uuid' })
  season_id: string;

  @ManyToOne(() => Season, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'season_id' })
  season: Relation<Season>;

  @Column({ type: 'varchar', length: 120 })
  opponent: string;

  @Column({ type: 'varchar', length: 120, nullable: true })
  competition: string | null;

  @Column({ type: 'date' })
  match_date: string;

  @Column({ type: 'varchar', length: 10 })
  start_time: string; // HH:mm

  @Column({ type: 'varchar', length: 200 })
  venue: string;

  @Column({
    type: 'enum',
    enum: MatchVenueType,
    default: MatchVenueType.HOME,
  })
  home_away: MatchVenueType;

  @Column({ type: 'int', nullable: true })
  team_score: number | null;

  @Column({ type: 'int', nullable: true })
  opponent_score: number | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({
    type: 'enum',
    enum: MatchStatus,
    default: MatchStatus.SCHEDULED,
  })
  status: MatchStatus;

  @Column({
    type: 'enum',
    enum: MatchResult,
    nullable: true,
  })
  result: MatchResult | null;

  @OneToMany(() => MatchSquad, (squad) => squad.match, { cascade: true })
  squad: Relation<MatchSquad>[];

  @OneToMany(() => MatchEvent, (evt) => evt.match, { cascade: true })
  events: Relation<MatchEvent>[];

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;
}
