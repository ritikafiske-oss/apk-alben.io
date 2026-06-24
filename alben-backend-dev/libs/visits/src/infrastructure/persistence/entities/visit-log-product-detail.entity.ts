import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { VisitLogEntity } from './visit-log.entity';
import { VisitTypeEntity } from './visit-type.entity';

@Entity('visit_log_product_details')
export class VisitLogProductDetailEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ name: 'visit_log_id', type: 'bigint', unsigned: true })
  visitLogId: number;

  @Column({ name: 'product_id', type: 'bigint', unsigned: true })
  productId: number;

  @Column({
    name: 'visit_type_id',
    type: 'bigint',
    unsigned: true,
    nullable: true,
  })
  visitTypeId: number | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => VisitLogEntity, (visitLog) => visitLog.id)
  @JoinColumn({ name: 'visit_log_id' })
  visitLog: VisitLogEntity;

  @ManyToOne(() => VisitTypeEntity)
  @JoinColumn({ name: 'visit_type_id' })
  visitType: VisitTypeEntity;
}
