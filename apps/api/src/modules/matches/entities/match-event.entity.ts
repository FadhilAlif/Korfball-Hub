import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
  type Relation,
} from 'typeorm';
import { Match } from './match.entity.js';
import { Athlete } from '../../athletes/entities/athlete.entity.js';
import { MatchEventType } from '../../../common/enums/index.js';

@Entity('match_events')
export class MatchEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  match_id: string;

  @ManyToOne(() => Match, (match) => match.events, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'match_id' })
  match: Relation<Match>;

  @Index()
  @Column({ type: 'uuid' })
  athlete_id: string;

  @ManyToOne(() => Athlete, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'athlete_id' })
  athlete: Relation<Athlete>;

  @Column({
    type: 'enum',
    enum: MatchEventType,
    default: MatchEventType.GOAL,
  })
  event_type: MatchEventType;

  @Column({ type: 'int', nullable: true })
  event_time: number | null; // second or minute

  @Column({ type: 'varchar', length: 250, nullable: true })
  notes: string | null;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;
}
