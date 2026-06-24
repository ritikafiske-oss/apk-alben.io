import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { VISIT_REPOSITORY } from '../domain/ports/visit.repository.port';
import type { VisitRepositoryPort } from '../domain/ports/visit.repository.port';
import { UserService } from '@libs/users';
import { VisitLogDetails } from '../interfaces/visit-log-details.interface';

@Injectable()
export class GetVisitLogDetailsUseCase {
  constructor(
    @Inject(VISIT_REPOSITORY)
    private readonly visitsRepository: VisitRepositoryPort,
    private readonly userService: UserService,
  ) {}

  async execute(
    companyId: number,
    userId: number,
    visitLogId: number,
  ): Promise<VisitLogDetails> {
    // 1. Validate Company & User
    await this.userService.validateUserCompany(userId, companyId);

    // 2. Fetch Visit Details
    const details = await this.visitsRepository.getVisitLogWithDetails(
      visitLogId,
      companyId,
    );

    if (!details) {
      throw new NotFoundException({
        success: false,
        code: 'VISIT_NOT_FOUND',
        message: 'Visit log not found.',
        data: {},
      });
    }

    return details;
  }
}
