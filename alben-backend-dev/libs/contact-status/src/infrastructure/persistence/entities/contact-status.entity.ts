import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

@Entity('contact_statuses')
export class ContactStatusEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ name: 'color_code', type: 'varchar', length: 255, nullable: true })
  colorCode: string | null;

  @Column({
    type: 'enum',
    enum: ['active', 'inactive'],
    default: 'active',
  })
  status: string;

  @Column({ name: 'company_id', type: 'bigint', unsigned: true })
  companyId: number;

  @Column({ name: 'is_hide', type: 'tinyint', width: 1, default: 0 })
  isHide: boolean;

  @Column({ name: 'is_unassigned', type: 'tinyint', width: 1, default: 0 })
  isUnassigned: boolean;

  @Column({ name: 'is_default', type: 'tinyint', width: 1, default: 0 })
  isDefault: boolean;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
