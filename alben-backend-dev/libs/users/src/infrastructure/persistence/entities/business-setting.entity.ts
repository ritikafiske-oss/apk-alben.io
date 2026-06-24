import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
} from 'typeorm';

/**
 * Business Setting Entity
 *
 * Represents the business_settings table in the database.
 * Stores configuration key-value pairs for companies.
 *
 * @table business_settings
 */
@Entity('business_settings')
@Index('idx_business_settings_company', ['companyId'])
@Index('idx_business_settings_key', ['key'])
@Index('idx_business_settings_company_key', ['companyId', 'key'])
export class BusinessSettingEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 100 })
  key: string;

  @Column({ type: 'varchar', length: 100 })
  value: string;

  @Column({
    type: 'enum',
    enum: ['active', 'inactive'],
    default: 'active',
  })
  status: string;

  @Column({ name: 'company_id', type: 'bigint', unsigned: true })
  companyId: number;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
