import { Injectable, Inject } from '@nestjs/common';
import { UserService } from '@libs/users';
import { VISIT_REPOSITORY } from '../domain/ports/visit.repository.port';
import type { VisitRepositoryPort } from '../domain/ports/visit.repository.port';

@Injectable()
export class GetVisitTypesUseCase {
  constructor(
    @Inject(VISIT_REPOSITORY)
    private readonly visitsRepository: VisitRepositoryPort,
    private readonly userService: UserService,
  ) {}

  async execute(companyId: number, userId: number) {
    await this.userService.validateUserCompany(userId, companyId);

    return this.visitsRepository.getVisitTypes(companyId);
  }
}
