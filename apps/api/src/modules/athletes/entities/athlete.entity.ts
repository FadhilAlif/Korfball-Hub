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
import { Gender, AthleteStatus } from '../../../common/enums/index.js';
import { Roster } from './roster.entity.js';

@Entity('athletes')
@Index(['team_id', 'player_id'], { unique: true })
export class Athlete {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  team_id: string;

  @ManyToOne(() => Team, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'team_id' })
  team: Relation<Team>;

  @Column({ type: 'varchar', length: 30 })
  player_id: string;

  @Column({ type: 'varchar', length: 100 })
  full_name: string;

  @Column({ type: 'varchar', length: 80, nullable: true })
  display_name: string | null;

  @Column({ type: 'date' })
  date_of_birth: string;

  @Column({
    type: 'enum',
    enum: Gender,
  })
  gender: Gender;

  @Column({ type: 'int' })
  jersey_number: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  position: string | null;

  @Column({ type: 'date' })
  join_date: string;

  @Column({
    type: 'enum',
    enum: AthleteStatus,
    default: AthleteStatus.ACTIVE,
  })
  status: AthleteStatus;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  emergency_contact: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  emergency_phone: string | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @OneToMany(() => Roster, (roster) => roster.athlete)
  rosters: Relation<Roster>[];

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;
}
