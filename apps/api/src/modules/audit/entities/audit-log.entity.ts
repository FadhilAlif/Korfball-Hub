import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  actor_user_id: string | null;

  @Column({ type: 'varchar', length: 50 })
  action: string; // CREATE, UPDATE, DELETE, PUBLISH, LOGIN, DISABLE_ACCOUNT

  @Index()
  @Column({ type: 'varchar', length: 50 })
  entity_type: string;

  @Index()
  @Column({ type: 'varchar', length: 100 })
  entity_id: string;

  @Column({ type: 'jsonb', nullable: true })
  before_json: Record<string, any> | null;

  @Column({ type: 'jsonb', nullable: true })
  after_json: Record<string, any> | null;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;
}
