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
import { SessionStatus } from '../../../common/enums/index.js';
import { TrainingActivity } from './training-activity.entity.js';
import { TrainingAttendance } from './training-attendance.entity.js';

@Entity('training_sessions')
export class TrainingSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  team_id: string;

  @ManyToOne(() => Team, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'team_id' })
  team: Relation<Team>;

  @Column({ type: 'uuid' })
  coach_id: string;

  @Column({ type: 'date' })
  session_date: string;

  @Column({ type: 'timestamp with time zone' })
  start_datetime: Date;

  @Column({ type: 'timestamp with time zone' })
  end_datetime: Date;

  @Column({ type: 'varchar', length: 200, nullable: true })
  venue: string | null;

  @Column({ type: 'text' })
  objective: string;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({
    type: 'enum',
    enum: SessionStatus,
    default: SessionStatus.SCHEDULED,
  })
  status: SessionStatus;

  @OneToMany(() => TrainingActivity, (act) => act.training_session, { cascade: true })
  activities: Relation<TrainingActivity>[];

  @OneToMany(() => TrainingAttendance, (att) => att.training_session)
  attendances: Relation<TrainingAttendance>[];

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;
}
