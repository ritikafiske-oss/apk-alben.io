import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('excluded_contacts')
export class ExcludedContactEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  name: string | null;

  @Column({ type: 'varchar', length: 20 })
  mobile: string;

  @Column({ name: 'user_id', type: 'bigint', unsigned: true })
  userId: number;

  @Column({
    type: 'enum',
    enum: ['personal', 'vendor', 'others'],
    default: 'others',
  })
  type: 'personal' | 'vendor' | 'others';

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
