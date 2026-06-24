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
 * User Entity
 *
 * Represents the users table in the database.
 * Maps all columns from the existing database schema.
 *
 * @table users
 * @schema Matches existing Laravel database structure
 *
 * @indexes
 * - users_email_unique: Unique constraint on email
 * - users_mobile_unique: Unique constraint on mobile
 * - idx_users_status: Index on status column
 * - idx_users_role: Index on role column
 * - idx_users_selected_company: Index on selected_company_id
 * - idx_users_last_login: Index on last_login_date
 * - idx_users_deleted_at: Index on deleted_at (soft delete)
 */
@Entity('users')
@Index('idx_users_status', ['status'])
@Index('idx_users_role', ['role'])
@Index('idx_users_selected_company', ['selectedCompanyId'])
@Index('idx_users_last_login', ['lastLoginDate'])
@Index('idx_users_deleted_at', ['deletedAt'])
export class UserEntity {
  /** Primary key - Auto-incrementing user ID */
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  /** User's first name (required) */
  @Column({ type: 'varchar', length: 255 })
  firstname: string;

  /** User's last name or surname (optional) */
  @Column({ type: 'varchar', length: 255, nullable: true })
  lastname: string | null;

  /** Email address (unique, optional) */
  @Column({ type: 'varchar', length: 100, nullable: true, unique: true })
  email: string | null;

  /** Country code for mobile number (default +91 for India) */
  @Column({
    name: 'country_code',
    type: 'varchar',
    length: 10,
    nullable: true,
    default: '+91',
  })
  countryCode: string | null;

  /** Mobile number (unique, optional) */
  @Column({ type: 'varchar', length: 20, nullable: true, unique: true })
  mobile: string | null;

  /** Timestamp when email was verified */
  @Column({ name: 'email_verified_at', type: 'timestamp', nullable: true })
  emailVerifiedAt: Date | null;

  /** Bcrypt hashed password (required for authentication) */
  @Column({ type: 'varchar', length: 255 })
  password: string;

  /** Date when user first registered in the system */
  @Column({ name: 'registration_date', type: 'datetime', nullable: true })
  registrationDate: Date | null;

  /** URL or path to user's profile image */
  @Column({
    name: 'profile_image',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  profileImage: string | null;

  /** User's gender (Male, Female, Other) */
  @Column({ type: 'enum', enum: ['Male', 'Female', 'Other'], nullable: true })
  gender: string | null;

  /** Preferred language for app interface */
  @Column({ type: 'varchar', length: 50, nullable: true })
  language: string | null;

  /** User's skills or expertise (comma-separated or JSON) */
  @Column({ type: 'varchar', length: 255, nullable: true })
  skill: string | null;

  /** Timestamp of last successful login */
  @Column({ name: 'last_login_date', type: 'datetime', nullable: true })
  lastLoginDate: Date | null;

  /** Account status (active/inactive/suspended) - modified by super admin */
  @Column({
    type: 'enum',
    enum: ['active', 'inactive', 'suspended'],
    default: 'active',
    comment: 'This status modified for super admin (salescaller)',
  })
  status: string;

  /** User's system role (super_admin/seo_manager/account_manager/user/hrm) */
  @Column({
    type: 'enum',
    enum: ['super_admin', 'seo_manager', 'account_manager', 'user', 'hrm'],
    default: 'user',
  })
  role: string;

  /** Whether user is verified (1 = verified, 0 = not verified) */
  @Column({ name: 'is_verified', type: 'tinyint', width: 1, default: 1 })
  isVerified: boolean;

  /** Laravel's remember me token */
  @Column({
    name: 'remember_token',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  rememberToken: string | null;

  /** App version used by user (e.g., "1.2.3") */
  @Column({ name: 'app_version', type: 'varchar', length: 10, nullable: true })
  appVersion: string | null;

  /** JSON or text data about user's device */
  @Column({ name: 'device_data', type: 'text', nullable: true })
  deviceData: string | null;

  /** Firebase Cloud Messaging token for push notifications */
  @Column({ name: 'fcm_token', type: 'text', nullable: true })
  fcmToken: string | null;

  /** JWT token for API authentication (single device login enforcement) */
  @Column({ name: 'api_token', type: 'text', nullable: true })
  apiToken: string | null;

  /** Session token for web authentication */
  @Column({
    name: 'web_auth_session',
    type: 'varchar',
    length: 191,
    nullable: true,
  })
  webAuthSession: string | null;

  /** ID of currently selected company */
  @Column({ name: 'selected_company_id', type: 'int', nullable: true })
  selectedCompanyId: number | null;

  /** Flag indicating if user must reset password on next login */
  @Column({ name: 'is_reset_password', type: 'tinyint', width: 1, default: 0 })
  isResetPassword: boolean;

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
