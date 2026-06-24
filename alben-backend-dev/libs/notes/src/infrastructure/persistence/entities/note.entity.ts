import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('notes')
export class NoteEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'text' })
  description: string;

  @Column({ name: 'reminder_datetime', type: 'datetime', nullable: true })
  reminderDatetime: Date | null;

  @Column({ name: 'contact_id', type: 'bigint', unsigned: true })
  contactId: number;

  @Column({
    name: 'call_log_id',
    type: 'bigint',
    unsigned: true,
    default: 0,
  })
  callLogId: number;

  @Column({
    name: 'visit_log_id',
    type: 'bigint',
    unsigned: true,
    default: 0,
  })
  visitLogId: number;

  @Column({
    name: 'product_id',
    type: 'bigint',
    unsigned: true,
    nullable: true,
  })
  productId: number | null;

  @Column({ name: 'user_id', type: 'bigint', unsigned: true })
  userId: number;

  @Column({
    name: 'for_note',
    type: 'enum',
    enum: ['visit', 'others'],
    default: 'others',
  })
  forNote: 'visit' | 'others';

  @Column({ name: 'is_reminder_sent', type: 'tinyint', width: 1, default: 0 })
  isReminderSent: boolean;

  @Column({ name: 'is_my_plan', type: 'tinyint', width: 1, default: 0 })
  isMyPlan: boolean;

  @Column({
    name: 'is_done',
    type: 'tinyint',
    width: 1,
    default: 1,
    comment: 'if reminder completed or not',
  })
  isDone: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
