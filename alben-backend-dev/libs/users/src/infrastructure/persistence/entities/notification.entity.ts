import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { CompanyEntity } from './company.entity';
// Use import type to avoid triggering barrel files and circular dependencies
import type { NoteEntity } from '@libs/notes';
import type { ProductEntity } from '@libs/products';
import type { ContactEntity } from '@libs/contacts';

/**
 * Notification Entity
 *
 * Represents the notifications table in the database.
 * Maps exactly to the provided SQL schema.
 */
@Entity('notifications')
export class NotificationEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'varchar', length: 100 })
  title: string;

  @Column({ type: 'longtext', nullable: true })
  description: string | null;

  @Column({ name: 'is_read', type: 'tinyint', width: 1, default: 0 })
  @Index('notifications_is_read_index')
  isRead: boolean;

  @Column({ name: 'user_id', type: 'bigint', unsigned: true, nullable: true })
  @Index('notifications_user_id_foreign')
  @Index('idx_notifications_user')
  userId: number | null;

  @Column({ name: 'sent_by', type: 'bigint', unsigned: true, nullable: true })
  @Index('notifications_sent_by_foreign')
  sentBy: number | null;

  @Column({ name: 'contact_id', type: 'bigint', nullable: true })
  @Index('notifications_contact_id_index')
  @Index('idx_notifications_contact')
  contactId: number | null;

  @Column({
    name: 'product_id',
    type: 'bigint',
    unsigned: true,
    nullable: true,
  })
  @Index('notifications_product_id_foreign')
  productId: number | null;

  @Column({ name: 'product_ids', type: 'varchar', length: 255, nullable: true })
  productIds: string | null;

  @Column({ name: 'note_id', type: 'bigint', unsigned: true, nullable: true })
  @Index('notifications_note_id_foreign')
  noteId: number | null;

  @Column({ name: 'note_ids', type: 'varchar', length: 255, nullable: true })
  noteIds: string | null;

  @Column({
    name: 'company_id',
    type: 'bigint',
    unsigned: true,
    nullable: true,
  })
  @Index('notifications_company_id_foreign')
  companyId: number | null;

  @Column({
    name: 'notification_type',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  notificationType: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp', nullable: true })
  @Index('idx_notifications_created_at')
  createdAt: Date | null;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', nullable: true })
  updatedAt: Date | null;

  // Relations - Using string names for targets to avoid circular imports via barrels
  @ManyToOne(() => CompanyEntity)
  @JoinColumn({ name: 'company_id' })
  company: CompanyEntity;

  @ManyToOne('NoteEntity', { nullable: true })
  @JoinColumn({ name: 'note_id' })
  note: NoteEntity | null;

  @ManyToOne('ProductEntity', { nullable: true })
  @JoinColumn({ name: 'product_id' })
  product: ProductEntity | null;

  @ManyToOne('ContactEntity', { nullable: true })
  @JoinColumn({ name: 'contact_id' })
  contact: ContactEntity | null;
}
