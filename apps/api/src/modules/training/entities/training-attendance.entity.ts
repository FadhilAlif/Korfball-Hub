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
import { TrainingSession } from './training-session.entity.js';
import { Athlete } from '../../athletes/entities/athlete.entity.js';
import { AttendanceStatus } from '../../../common/enums/index.js';

@Entity('training_attendances')
@Index(['training_session_id', 'athlete_id'], { unique: true })
export class TrainingAttendance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  training_session_id: string;

  @ManyToOne(() => TrainingSession, (session) => session.attendances, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'training_session_id' })
  training_session: Relation<TrainingSession>;

  @Index()
  @Column({ type: 'uuid' })
  athlete_id: string;

  @ManyToOne(() => Athlete, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'athlete_id' })
  athlete: Relation<Athlete>;

  @Column({
    type: 'enum',
    enum: AttendanceStatus,
    default: AttendanceStatus.PRESENT,
  })
  status: AttendanceStatus;

  @Column({ type: 'int', nullable: true })
  rpe: number | null;

  @Column({ type: 'varchar', length: 250, nullable: true })
  notes: string | null;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;
}
