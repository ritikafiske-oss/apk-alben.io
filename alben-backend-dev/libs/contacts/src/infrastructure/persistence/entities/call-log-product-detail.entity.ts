import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { CallLogEntity } from './call-log.entity';

@Entity('call_log_product_details')
export class CallLogProductDetailEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ name: 'call_log_id', type: 'bigint', unsigned: true })
  callLogId: number;

  @Column({ name: 'product_id', type: 'bigint', unsigned: true })
  productId: number;

  @Column({
    name: 'last_contact_status_id',
    type: 'bigint',
    unsigned: true,
    nullable: true,
  })
  lastContactStatusId: number | null;

  @Column({
    name: 'status_id',
    type: 'bigint',
    unsigned: true,
    nullable: true,
  })
  statusId: number | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => CallLogEntity, (callLog) => callLog.id)
  @JoinColumn({ name: 'call_log_id' })
  callLog: CallLogEntity;
}
