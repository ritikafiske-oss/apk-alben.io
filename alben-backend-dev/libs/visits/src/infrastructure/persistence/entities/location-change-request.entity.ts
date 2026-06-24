import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { VisitLogEntity } from './visit-log.entity';

@Entity('location_change_requests')
export class LocationChangeRequestEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ name: 'contact_id', type: 'bigint', unsigned: true })
  contactId: number;

  @Column({
    name: 'previous_visit_log_id',
    type: 'bigint',
    unsigned: true,
    nullable: true,
  })
  previousVisitLogId: number | null;

  @Column({ name: 'visit_log_id', type: 'bigint', unsigned: true })
  visitLogId: number;

  @Column({ name: 'user_id', type: 'bigint', unsigned: true })
  userId: number;

  @Column({ name: 'user_remark', type: 'varchar', length: 255, nullable: true })
  userRemark: string | null;

  @Column({
    name: 'approved_status',
    type: 'enum',
    enum: ['approved', 'rejected', 'cancelled', 'pending', 'reverted'],
    default: 'pending',
    comment:
      'Status of the request: approved, rejected, cancelled, pending, or reverted. Used for both approval and rejection.',
  })
  approvedStatus:
    | 'approved'
    | 'rejected'
    | 'cancelled'
    | 'pending'
    | 'reverted';

  @Column({
    name: 'approved_by',
    type: 'bigint',
    unsigned: true,
    nullable: true,
    comment:
      'User who approved or rejected the request. If rejected, this field will store the ID of the user who rejected it.',
  })
  approvedBy: number | null;

  @Column({
    name: 'approved_remark',
    type: 'varchar',
    length: 255,
    nullable: true,
    comment:
      'Remarks associated with the approval or rejection of the request. This will contain the reason for approval or rejection.',
  })
  approvedRemark: string | null;

  @Column({
    name: 'approved_datetime',
    type: 'datetime',
    nullable: true,
    comment:
      'Timestamp when the request was approved or rejected. This field stores the time of the final decision (approval or rejection).',
  })
  approvedDatetime: Date | null;

  @Column({
    name: 'updated_by',
    type: 'bigint',
    unsigned: true,
    nullable: true,
  })
  updatedBy: number | null;

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

  @ManyToOne(() => VisitLogEntity)
  @JoinColumn({ name: 'visit_log_id' })
  visitLog: VisitLogEntity;
}
