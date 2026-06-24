import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Shift Schedule ORM Entity
 *
 * Maps the 'shift_schedules' table (schema-exact).
 * Each row defines the working hours for a specific day-of-week within a shift.
 * buffer_hours is decimal(3,2) — supports values like 0.50, 1.50, 3.00 etc.
 */
@Entity('shift_schedules')
export class ShiftScheduleEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({
    type: 'enum',
    enum: [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday',
    ],
    default: 'Monday',
  })
  day: string;

  @Column({ type: 'time', nullable: true, default: null })
  start_time: string; // HH:mm:ss

  @Column({ type: 'time', nullable: true, default: null })
  end_time: string; // HH:mm:ss

  @Column({ type: 'tinyint', default: 0 })
  is_holiday: number;

  @Column({ type: 'bigint', unsigned: true })
  shift_id: number;

  /**
   * IMP: buffer_hours is decimal(3,2) — can be a fractional value (e.g. 0.50 = 30 min).
   * Always coerce to Number() before arithmetic to avoid string concatenation bugs.
   */
  @Column('decimal', { precision: 3, scale: 2, default: 3.0 })
  buffer_hours: number;

  @CreateDateColumn({ type: 'timestamp', nullable: true, default: null })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp', nullable: true, default: null })
  updated_at: Date;
}
