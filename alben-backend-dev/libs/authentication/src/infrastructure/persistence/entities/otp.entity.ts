import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('otps')
export class OtpEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  mobile: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string | null;

  @Column({ name: 'mobile_otp', type: 'varchar', length: 255, nullable: true })
  mobileOtp: string | null;

  @Column({ name: 'email_otp', type: 'varchar', length: 255, nullable: true })
  emailOtp: string | null;

  @Column({
    type: 'enum',
    enum: ['active', 'expired'],
    default: 'active',
  })
  status: string;

  @Column({ name: 'is_verified', type: 'tinyint', width: 1, default: 0 })
  isVerified: boolean;

  @Column({ name: 'change_sms_api', type: 'tinyint', default: 0 })
  changeSmsApi: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
