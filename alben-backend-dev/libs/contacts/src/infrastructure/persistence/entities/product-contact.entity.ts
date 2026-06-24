import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ContactStatusEntity } from '@libs/contact-status';
import { ContactEntity } from './contact.entity';

@Entity('product_contacts')
export class ProductContactEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ name: 'product_id', type: 'bigint', unsigned: true })
  productId: number;

  @Column({ name: 'is_service', type: 'tinyint', width: 1, default: 0 })
  isService: boolean;

  @Column({ name: 'contact_id', type: 'bigint', unsigned: true })
  contactId: number;

  @Column({
    name: 'contact_status_id',
    type: 'bigint',
    unsigned: true,
    nullable: true,
  })
  contactStatusId: number | null;

  @Column({
    name: 'category_id',
    type: 'bigint',
    unsigned: true,
    nullable: true,
  })
  categoryId: number | null;

  @Column({ name: 'is_hide', type: 'tinyint', width: 1, default: 0 })
  isHide: boolean;

  @Column({ type: 'int', default: 0 })
  attempts: number;

  @Column({ type: 'double', default: 0 })
  latitude: number;

  @Column({ type: 'double', default: 0 })
  longitude: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => ContactStatusEntity)
  @JoinColumn({ name: 'contact_status_id' })
  contactStatus: ContactStatusEntity;

  @ManyToOne(() => ContactEntity)
  @JoinColumn({ name: 'contact_id' })
  contact: ContactEntity;
}
