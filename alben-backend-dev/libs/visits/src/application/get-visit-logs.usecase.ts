import { Injectable, Inject } from '@nestjs/common';
import { UserService } from '@libs/users';
import { VISIT_REPOSITORY } from '../domain/ports/visit.repository.port';
import type { VisitRepositoryPort } from '../domain/ports/visit.repository.port';
import { ProductService } from '@libs/products';

@Injectable()
export class GetVisitLogsUseCase {
  constructor(
    @Inject(VISIT_REPOSITORY)
    private readonly visitsRepository: VisitRepositoryPort,
    private readonly userService: UserService,
    private readonly productService: ProductService,
  ) {}

  async execute(
    companyId: number,
    productId: number,
    userId: number,
    page: number,
    limit: number,
    visitTypeId?: number,
  ) {
    await this.userService.validateUserCompany(userId, companyId);

    await this.productService.validateProductCompany(productId, companyId);

    return this.visitsRepository.getVisitLogs(
      companyId,
      productId,
      userId,
      page,
      limit,
      visitTypeId,
    );
  }
}
