import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('surprise_visits')
export class SurpriseVisitEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ name: 'user_id', type: 'bigint', unsigned: true })
  userId: number;

  @Column({
    name: 'company_id',
    type: 'bigint',
    unsigned: true,
    nullable: true,
  })
  companyId: number | null;

  @Column({ type: 'varchar', length: 100 })
  question: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  answer: string | null;

  @Column({ name: 'time_duration_in_minutes', type: 'varchar', length: 100 })
  timeDurationInMinutes: string;

  @Column({ name: 'submitted_at', type: 'datetime', nullable: true })
  submittedAt: Date | null;

  @Column({ type: 'double', default: 0 })
  latitude: number;

  @Column({ type: 'double', default: 0 })
  longitude: number;

  @Column({ name: 'job_radius', type: 'varchar', length: 100, nullable: true })
  jobRadius: string | null;

  @Column({ name: 'job_latitude', type: 'double', default: 0 })
  jobLatitude: number;

  @Column({ name: 'job_longitude', type: 'double', default: 0 })
  jobLongitude: number;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
}
