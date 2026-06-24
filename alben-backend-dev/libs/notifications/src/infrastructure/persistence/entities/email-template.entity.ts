import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum EmailTemplateStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

@Entity('email_templates')
export class EmailTemplateEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 100 })
  slug: string;

  @Column({ type: 'text' })
  subject: string;

  @Column({ type: 'longtext' })
  content: string;

  @Column({
    type: 'enum',
    enum: EmailTemplateStatus,
    default: EmailTemplateStatus.ACTIVE,
  })
  status: EmailTemplateStatus;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp', nullable: true })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', nullable: true })
  updatedAt: Date;
}
