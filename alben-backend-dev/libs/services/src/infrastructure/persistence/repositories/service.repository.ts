import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ServiceRepositoryPort } from '../../../domain/ports/service.repository.port';
import { Service } from '../../../domain/entities/service.entity';
import { ServiceEntity } from '../entities/service.entity';
import { DepartmentServiceEntity } from '../entities/department-service.entity';
import { ServiceMapper } from '../mappers/service.mapper';
import { UserProductEntity, ProductEntity } from '@libs/products';

@Injectable()
export class ServiceRepository implements ServiceRepositoryPort {
  constructor(private readonly dataSource: DataSource) {}

  async findServicesByUserDepartments(
    userId: number,
    companyId: number,
  ): Promise<Service[]> {
    const queryBuilder = this.dataSource
      .getRepository(ServiceEntity)
      .createQueryBuilder('service')
      .innerJoin(DepartmentServiceEntity, 'ds', 'ds.service_id = service.id')
      .innerJoin(
        ProductEntity,
        'p',
        'p.id = ds.department_id AND p.is_department = 1',
      )
      .innerJoin(
        UserProductEntity,
        'up',
        'up.product_id = p.id AND up.user_id = :userId',
        { userId },
      )
      .where('service.status = 1')
      .andWhere('service.company_id = :companyId', { companyId })
      .andWhere('service.deleted_at IS NULL');

    const services: ServiceEntity[] = await queryBuilder.getMany();

    return services.map((service) => ServiceMapper.toDomain(service));
  }
}
