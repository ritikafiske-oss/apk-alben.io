import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

export enum CallLogTypeEnum {
  OUTGOING = 'outgoing',
  INCOMING = 'incoming',
  MISSED = 'missed',
  REJECTED = 'rejected',
  VOICEMAIL = 'voicemail',
}

@Entity('call_logs')
export class CallLogEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'varchar', length: 20, nullable: true })
  mobile: string;

  @Column({ type: 'datetime', nullable: true })
  start_call_at: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  duration: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    comment: 'received,busy,not_reachable,unanswered',
  })
  status: string;

  @Column({
    type: 'enum',
    enum: CallLogTypeEnum,
    default: CallLogTypeEnum.OUTGOING,
  })
  type: CallLogTypeEnum;

  @Column({ type: 'varchar', length: 255, nullable: true })
  recording_url: string;

  @Column({ type: 'bigint', unsigned: true })
  contact_id: number;

  @Column({ type: 'bigint', unsigned: true, nullable: true })
  product_id: number;

  @Column({ type: 'bigint', unsigned: true, nullable: true })
  last_contact_status_id: number;

  @Column({ type: 'bigint', unsigned: true, nullable: true })
  note_id: number;

  @Column({ type: 'bigint', unsigned: true })
  user_id: number;

  @Column({ type: 'double', default: 0 })
  latitude: number;

  @Column({ type: 'double', default: 0 })
  longitude: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;
}
