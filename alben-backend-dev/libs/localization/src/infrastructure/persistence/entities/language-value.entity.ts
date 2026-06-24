import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { LanguageEntity } from './language.entity';
import { LanguageKeyEntity } from './language-key.entity';

@Entity('language_values')
@Unique(['languageId', 'languageKeyId'])
export class LanguageValueEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ name: 'language_id', type: 'bigint', unsigned: true })
  languageId: number;

  @Column({ name: 'language_key_id', type: 'bigint', unsigned: true })
  languageKeyId: number;

  @Column({ name: 'value', type: 'text' })
  value: string;

  @ManyToOne(() => LanguageEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'language_id' })
  language: LanguageEntity;

  @ManyToOne(() => LanguageKeyEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'language_key_id' })
  languageKey: LanguageKeyEntity;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
