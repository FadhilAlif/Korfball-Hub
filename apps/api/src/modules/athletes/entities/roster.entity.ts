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
import { Athlete } from './athlete.entity.js';
import { Team } from '../../teams/entities/team.entity.js';
import { Season } from '../../teams/entities/season.entity.js';

@Entity('rosters')
@Index(['team_id', 'season_id', 'jersey_number'], { unique: true })
export class Roster {
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

  @Index()
  @Column({ type: 'uuid' })
  athlete_id: string;

  @ManyToOne(() => Athlete, (athlete) => athlete.rosters, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'athlete_id' })
  athlete: Relation<Athlete>;

  @Column({ type: 'int' })
  jersey_number: number;

  @Column({ type: 'boolean', default: false })
  is_captain: boolean;

  @Column({ type: 'varchar', length: 20, default: 'ACTIVE' })
  status: string;

  @Column({ type: 'date', default: () => 'CURRENT_DATE' })
  effective_date: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;
}
