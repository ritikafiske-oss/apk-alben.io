import { Service } from '../entities/service.entity';

export const SERVICE_REPOSITORY = 'SERVICE_REPOSITORY';

export interface ServiceRepositoryPort {
  findServicesByUserDepartments(
    userId: number,
    companyId: number,
  ): Promise<Service[]>;
}
