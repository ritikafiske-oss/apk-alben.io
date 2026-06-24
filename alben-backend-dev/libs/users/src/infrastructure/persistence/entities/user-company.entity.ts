import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { CompanyEntity } from './company.entity';

/**
 * User Company Entity
 *
 * Represents the user_companies junction table.
 * Links users to companies with role, status, and activity information.
 *
 * @table user_companies
 * @schema Matches existing Laravel database structure
 *
 * @indexes
 * - idx_user_companies_user_company: Composite index on (user_id, company_id)
 * - idx_user_companies_company_role: Composite index on (company_id, role)
 * - idx_user_companies_status: Index on status
 * - idx_user_companies_activity_status: Index on activity_status
 * - idx_user_companies_deleted_at: Index on deleted_at (soft delete)
 *
 * @constraints
 * - Foreign key: user_id references users(id) ON DELETE CASCADE
 * - Foreign key: company_id references companies(id) ON DELETE CASCADE
 * - Foreign key: shift_id references shifts(id) ON DELETE CASCADE ON UPDATE SET NULL
 * - Foreign key: deleted_by references users(id) ON DELETE SET NULL
 */
@Entity('user_companies')
@Index('idx_user_companies_user_company', ['userId', 'companyId'])
@Index('idx_user_companies_company_role', ['companyId', 'role'])
@Index('idx_user_companies_status', ['status'])
@Index('idx_user_companies_activity_status', ['activityStatus'])
@Index('idx_user_companies_deleted_at', ['deletedAt'])
export class UserCompanyEntity {
  /** Primary key - Auto-incrementing ID */
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  /** Company ID (foreign key to companies table) */
  @Column({ name: 'company_id', type: 'bigint', unsigned: true })
  companyId: number;

  @ManyToOne(() => CompanyEntity, (company) => company.userCompanies)
  @JoinColumn({ name: 'company_id' })
  company: CompanyEntity;

  /** User ID (foreign key to users table) */
  @Column({ name: 'user_id', type: 'bigint', unsigned: true })
  userId: number;

  /** Current activity/attendance status (Check In/Check Out) */
  @Column({
    name: 'activity_status',
    type: 'enum',
    enum: ['Check In', 'Check Out'],
    default: 'Check Out',
  })
  activityStatus: string;

  /** Association status (active/inactive) */
  @Column({
    type: 'enum',
    enum: ['active', 'inactive'],
    default: 'active',
  })
  status: string;

  /** User's role within the company */
  @Column({
    type: 'enum',
    enum: [
      'telecaller',
      'field_agent',
      'all_in_one',
      'attendee_user',
      'contact_handler',
    ],
    default: 'all_in_one',
  })
  role: string;

  /** Flag indicating if user is a manager (1 = manager, 0 = not manager) */
  @Column({ name: 'is_manager', type: 'tinyint', width: 1, default: 0 })
  isManager: boolean;

  /** Allow popup notifications for vendor-related activities */
  @Column({
    name: 'allow_popup_for_vendor',
    type: 'tinyint',
    width: 1,
    default: 1,
  })
  allowPopupForVendor: boolean;

  /** Allow popup notifications for colleague-related activities */
  @Column({
    name: 'allow_popup_for_colleague',
    type: 'tinyint',
    width: 1,
    default: 1,
  })
  allowPopupForColleague: boolean;

  /** Assigned shift ID (foreign key to shifts table, optional) */
  @Column({ name: 'shift_id', type: 'bigint', unsigned: true, nullable: true })
  shiftId: number | null;

  /** User ID who soft-deleted this record (foreign key to users table) */
  @Column({
    name: 'deleted_by',
    type: 'bigint',
    unsigned: true,
    nullable: true,
  })
  deletedBy: number | null;

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
