import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('location_logs')
export class LocationLogEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  full_address: string | null;

  @Column({ type: 'text', nullable: true })
  content: string | null;

  @Column({ type: 'text', nullable: true, comment: 'To store location error' })
  location_error_log: string | null;

  @Column({
    type: 'text',
    nullable: true,
    comment:
      'Stores user device details such as battery level, location, Wi-Fi device model, OS version, etc.',
  })
  user_device_values: string | null;

  @Column({
    type: 'enum',
    enum: [
      'check_in',
      'check_out',
      'note',
      'visit',
      'call',
      'device_activity',
      'others',
    ],
    default: 'others',
  })
  log_type: string;

  @Column({ type: 'bigint', unsigned: true, nullable: true })
  user_log_id: number;

  @Column({ type: 'bigint', unsigned: true, nullable: true })
  call_log_id: number;

  @Column({ type: 'bigint', unsigned: true, nullable: true })
  visit_log_id: number;

  @Column({ type: 'bigint', unsigned: true })
  user_id: number;

  @Column({ type: 'bigint', unsigned: true })
  company_id: number;

  @Column({ type: 'double', default: 0 })
  latitude: number;

  @Column({ type: 'double', default: 0 })
  longitude: number;

  @Column({ type: 'double', default: 0 })
  user_job_location_latitude: number;

  @Column({ type: 'double', default: 0 })
  user_job_location_longitude: number;

  @Column({ type: 'double', default: 0, comment: 'in KM' })
  user_job_location_radius: number;

  @CreateDateColumn({ type: 'timestamp', nullable: true })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp', nullable: true })
  updated_at: Date;
}
