import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
  OneToMany,
} from 'typeorm';

import { UserCompanyEntity } from './user-company.entity';

/**
 * Company Entity
 *
 * Represents the companies table in the database.
 * Maps all columns from the existing database schema.
 *
 * @table companies
 * @schema Matches existing Laravel database structure
 *
 * @indexes
 * - companies_owner_id_foreign: Foreign key to users table
 * - idx_companies_owner: Index on owner_id column
 * - idx_companies_deleted_at: Index on deleted_at (soft delete)
 *
 * @constraints
 * - Foreign key: owner_id references users(id) ON DELETE CASCADE
 */
@Entity('companies')
@Index('idx_companies_owner', ['ownerId'])
@Index('idx_companies_deleted_at', ['deletedAt'])
export class CompanyEntity {
  @OneToMany(() => UserCompanyEntity, (userCompany) => userCompany.company)
  userCompanies: UserCompanyEntity[];
  /** Primary key - Auto-incrementing company ID */
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  /** Business or company name (required) */
  @Column({ name: 'business_name', type: 'varchar', length: 255 })
  businessName: string;

  /** Company website URL */
  @Column({ name: 'website', type: 'varchar', length: 255, nullable: true })
  website: string | null;

  /** URL or path to company logo image */
  @Column({
    name: 'business_logo',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  businessLogo: string | null;

  /** Company's physical address */
  @Column({ name: 'address', type: 'varchar', length: 255, nullable: true })
  address: string | null;

  /** Postal/ZIP code */
  @Column({ name: 'postalcode', type: 'varchar', length: 255, nullable: true })
  postalcode: string | null;

  /** City name */
  @Column({ name: 'city', type: 'varchar', length: 255, nullable: true })
  city: string | null;

  /** State or province name */
  @Column({ name: 'state', type: 'varchar', length: 255, nullable: true })
  state: string | null;

  /** Country name */
  @Column({ name: 'country', type: 'varchar', length: 255, nullable: true })
  country: string | null;

  /** GST (Goods and Services Tax) number for India */
  @Column({ name: 'gst_number', type: 'varchar', length: 255, nullable: true })
  gstNumber: string | null;

  /** User ID of company owner (foreign key to users table) */
  @Column({ name: 'owner_id', type: 'bigint', unsigned: true })
  ownerId: number;

  /** Primary helpline/support contact number */
  @Column({
    name: 'helpline_no_1',
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  helplineNo1: string | null;

  /** Secondary helpline/support contact number */
  @Column({
    name: 'helpline_no_2',
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  helplineNo2: string | null;

  /** Soft delete timestamp (null = not deleted) */
  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date | null;

  /** Record creation timestamp */
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  /** Record last update timestamp */
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
