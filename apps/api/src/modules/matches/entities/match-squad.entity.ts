import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
  type Relation,
} from 'typeorm';
import { Match } from './match.entity.js';
import { Athlete } from '../../athletes/entities/athlete.entity.js';
import { SquadStatus } from '../../../common/enums/index.js';

@Entity('match_squads')
@Index(['match_id', 'athlete_id'], { unique: true })
export class MatchSquad {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  match_id: string;

  @ManyToOne(() => Match, (match) => match.squad, { onDelete: 'CASCADE' })
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
    enum: SquadStatus,
    default: SquadStatus.STARTING,
  })
  squad_status: SquadStatus;

  @Column({ type: 'boolean', default: false })
  is_captain: boolean;

  @Column({ type: 'int', default: 0 })
  minutes_played: number;

  @Column({ type: 'int', default: 0 })
  assists: number;

  @Column({ type: 'int', default: 0 })
  cards: number;

  @Column({ type: 'varchar', length: 250, nullable: true })
  notes: string | null;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;
}
