import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  type Relation,
} from 'typeorm';
import { TrainingSession } from './training-session.entity.js';

@Entity('training_activities')
export class TrainingActivity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  training_session_id: string;

  @ManyToOne(() => TrainingSession, (session) => session.activities, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'training_session_id' })
  training_session: Relation<TrainingSession>;

  @Column({ type: 'varchar', length: 100 })
  activity_name: string;

  @Column({ type: 'varchar', length: 50 })
  category: string;

  @Column({ type: 'int' })
  duration: number; // in minutes

  @Column({ type: 'text', nullable: true })
  objective: string | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ type: 'int' })
  sequence: number;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;
}
