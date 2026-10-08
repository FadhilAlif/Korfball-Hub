import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
  CreateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
  type Relation,
} from 'typeorm';
import { Athlete } from '../../athletes/entities/athlete.entity.js';
import { ActivityType, AvailabilityStatus } from '../../../common/enums/index.js';

@Entity('athlete_availabilities')
@Index(['activity_type', 'activity_id', 'athlete_id'], { unique: true })
export class AthleteAvailability {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: ActivityType,
  })
  activity_type: ActivityType;

  @Index()
  @Column({ type: 'uuid' })
  activity_id: string;

  @Index()
  @Column({ type: 'uuid' })
  athlete_id: string;

  @ManyToOne(() => Athlete, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'athlete_id' })
  athlete: Relation<Athlete>;

  @Column({
    type: 'enum',
    enum: AvailabilityStatus,
    default: AvailabilityStatus.AVAILABLE,
  })
  status: AvailabilityStatus;

  @Column({ type: 'varchar', length: 250, nullable: true })
  reason: string | null;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;
}
