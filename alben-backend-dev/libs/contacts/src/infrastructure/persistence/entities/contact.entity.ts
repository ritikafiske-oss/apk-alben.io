import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm';
import { ProductContactEntity } from './product-contact.entity';

@Entity('contacts')
export class ContactEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'varchar', length: 20 })
  mobile: string;

  @Column({
    name: 'alternate_number',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  alternateNumber: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  firstname: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  lastname: string | null;

  @Column({
    name: 'business_name',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  businessName: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  designation: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string | null;

  @Column({
    type: 'enum',
    enum: ['active', 'inactive'],
    default: 'active',
  })
  status: string;

  @Column({
    name: 'contact_type',
    type: 'enum',
    enum: ['client', 'vendor', 'colleague'],
    default: 'client',
  })
  contactType: string;

  @Column({ name: 'company_id', type: 'bigint', unsigned: true })
  companyId: number;

  @Column({ name: 'created_by', type: 'bigint', unsigned: true })
  createdBy: number;

  @Column({
    name: 'reference_by_contact_id',
    type: 'bigint',
    unsigned: true,
    nullable: true,
  })
  referenceByContactId: number | null;

  @Column({ type: 'longtext', nullable: true })
  others: string | null;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(
    () => ProductContactEntity,
    (productContact) => productContact.contact,
  )
  productContacts: ProductContactEntity[];
}
