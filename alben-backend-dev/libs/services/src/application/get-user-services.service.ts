import { Inject, Injectable } from '@nestjs/common';
import { SERVICE_REPOSITORY } from '../domain/ports/service.repository.port';
import type { ServiceRepositoryPort } from '../domain/ports/service.repository.port';
import { Service } from '../domain/entities/service.entity';

@Injectable()
export class GetUserServicesService {
  constructor(
    @Inject(SERVICE_REPOSITORY)
    private readonly serviceRepository: ServiceRepositoryPort,
  ) {}

  async execute(userId: number, companyId: number): Promise<Service[]> {
    return this.serviceRepository.findServicesByUserDepartments(
      userId,
      companyId,
    );
  }
}
