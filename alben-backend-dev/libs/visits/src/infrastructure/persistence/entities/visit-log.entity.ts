import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { VisitTypeEntity } from './visit-type.entity';
import { VisitLogProductDetailEntity } from './visit-log-product-detail.entity';

@Entity('visit_logs')
export class VisitLogEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  photo: string | null;

  @Column({ type: 'text', nullable: true })
  remark: string | null;

  @Column({ type: 'datetime', nullable: true, comment: 'Visit date time' })
  datetime: Date | null;

  @Column({
    name: 'visit_type_id',
    type: 'bigint',
    unsigned: true,
    nullable: true,
  })
  visitTypeId: number | null;

  @Column({ name: 'contact_id', type: 'bigint', unsigned: true })
  contactId: number;

  @Column({
    name: 'product_id',
    type: 'bigint',
    unsigned: true,
    nullable: true,
  })
  productId: number | null;

  @Column({ name: 'user_id', type: 'bigint', unsigned: true, nullable: true })
  userId: number | null;

  @Column({ type: 'double', default: 0 })
  latitude: number;

  @Column({ type: 'double', default: 0 })
  longitude: number;

  @Column({
    name: 'primary_latitude',
    type: 'double',
    default: 0,
    comment: 'Primary location latitude',
  })
  primaryLatitude: number;

  @Column({
    name: 'primary_longitude',
    type: 'double',
    default: 0,
    comment: 'Primary location longitude',
  })
  primaryLongitude: number;

  @Column({ name: 'is_regularized', default: false })
  isRegularized: boolean;

  @Column({
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

  // Relationships
  @ManyToOne(() => VisitTypeEntity)
  @JoinColumn({ name: 'visit_type_id' })
  visitType: VisitTypeEntity;

  @OneToMany(
    () => VisitLogProductDetailEntity,
    (productDetail) => productDetail.visitLog,
    { cascade: true },
  )
  productDetails: VisitLogProductDetailEntity[];
}
