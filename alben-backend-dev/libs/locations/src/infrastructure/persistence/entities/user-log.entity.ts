import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * User Log ORM Entity
 *
 * Maps the 'user_logs' table in the database.
 * This entity captures the snapshot of a user's shift and location at the moment of check-in/out.
 */
@Entity('user_logs')
export class UserLogEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @Column()
  company_id: number;

  @Column({
    type: 'enum',
    enum: ['Check In', 'Check Out'],
    default: 'Check Out',
  })
  activity_status: string;

  @Column('double', { default: 0 })
  latitude: number;

  @Column('double', { default: 0 })
  longitude: number;

  @Column({ type: 'time', nullable: true })
  shift_start_time: string;

  @Column({ type: 'time', nullable: true })
  shift_end_time: string;

  @Column({ type: 'datetime', nullable: true })
  shift_start_datetime: string;

  @Column({ type: 'datetime', nullable: true })
  shift_end_datetime: string;

  @Column('double', { default: 0 })
  user_job_location_latitude: number;

  @Column('double', { default: 0 })
  user_job_location_longitude: number;

  @Column('double', { default: 0, comment: 'in KM' })
  user_job_location_radius: number;

  @Column({ type: 'date', nullable: true })
  shift_date: string;

  @Column({ type: 'tinyint', default: 0 })
  is_holiday: number;

  @Column('decimal', { precision: 3, scale: 2, default: 3.0 })
  buffer_hours: number;

  @Column({ type: 'int', nullable: true })
  day_off_id: number;

  @CreateDateColumn({ nullable: true })
  created_at: Date;

  @UpdateDateColumn({ nullable: true })
  updated_at: Date;
}
