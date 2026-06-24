import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('attachments')
export class AttachmentEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  title: string | null;

  @Column({ type: 'varchar', length: 255 })
  url: string;

  @Column({ name: 'contact_id', type: 'bigint', nullable: true })
  contactId: string | null;

  @Column({
    name: 'product_id',
    type: 'bigint',
    unsigned: true,
    nullable: true,
  })
  productId: string | null;

  @Column({ name: 'user_id', type: 'bigint', unsigned: true })
  userId: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp', nullable: true })
  createdAt: Date | null;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', nullable: true })
  updatedAt: Date | null;
}
