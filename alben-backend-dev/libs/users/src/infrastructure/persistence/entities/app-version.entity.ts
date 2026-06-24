import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * App Version Entity
 *
 * Represents the app_versions table in the database.
 *
 * @table app_versions
 */
@Entity('app_versions')
export class AppVersionEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'varchar', length: 100 })
  version: string;

  @Column({ name: 'is_force', type: 'tinyint', default: 0 })
  isForce: number;

  @Column({
    type: 'enum',
    enum: ['android', 'ios'],
    default: 'android',
  })
  type: string;

  @Column({
    type: 'enum',
    enum: ['active', 'inactive'],
    default: 'active',
  })
  status: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
