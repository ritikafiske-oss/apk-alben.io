import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('user_product_contacts')
export class UserProductContactEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ name: 'contact_id', type: 'bigint', unsigned: true })
  contactId: number;

  @Column({
    name: 'product_id',
    type: 'bigint',
    unsigned: true,
    nullable: true,
  })
  productId: number | null;

  @Column({ name: 'is_service', type: 'tinyint', width: 1, default: 0 })
  isService: boolean;

  @Column({ name: 'user_id', type: 'bigint', unsigned: true })
  userId: number;

  @Column({ name: 'is_manualdial', type: 'tinyint', width: 1, default: 1 })
  isManualdial: boolean;

  @Column({ name: 'is_autodial', type: 'tinyint', width: 1, default: 0 })
  isAutodial: boolean;

  @Column({ type: 'int', default: 0 })
  attempts: number;

  @Column({ name: 'is_newly_assigned', type: 'tinyint', width: 1, default: 0 })
  isNewlyAssigned: boolean;

  @Column({
    name: 'called_at',
    type: 'datetime',
    nullable: true,
    default: null,
  })
  calledAt: Date | null;

  @Column({ name: 'is_my_plan', type: 'tinyint', width: 1, default: 0 })
  isMyPlan: boolean;

  @CreateDateColumn({ name: 'created_at', nullable: true })
  createdAt: Date | null;

  @UpdateDateColumn({ name: 'updated_at', nullable: true })
  updatedAt: Date | null;
}
