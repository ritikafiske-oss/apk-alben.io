import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

/**
 * Job Location ORM Entity
 *
 * Maps the 'job_locations' table.
 * Defines the geofencing parameters (latitude, longitude, radius) for a company worksite.
 */
@Entity('job_locations')
export class JobLocationEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  name: string;

  @Column()
  address: string;

  @Column({ default: '0.3', comment: 'in KM' })
  radius: string; // Varchar in schema

  @Column('double', { default: 0 })
  latitude: number;

  @Column('double', { default: 0 })
  longitude: number;

  @Column()
  company_id: number;

  @Column()
  created_by: number;

  @Column({ type: 'enum', enum: ['active', 'inactive'], default: 'active' })
  status: string;

  @CreateDateColumn({ nullable: true })
  created_at: Date;

  @UpdateDateColumn({ nullable: true })
  updated_at: Date;

  @DeleteDateColumn({ nullable: true })
  deleted_at: Date;
}
