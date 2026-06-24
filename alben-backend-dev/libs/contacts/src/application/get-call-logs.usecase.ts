import { Injectable, Inject, forwardRef } from '@nestjs/common';
import {
  GetCallLogsDto,
  GetCallLogsContactTypeEnum,
} from '../ui/dtos/get-call-logs.dto';
import { CallLogRepositoryPort } from '../domain/ports/call-log.repository.port';
import { CONTACT_REPOSITORY } from '../domain/ports/contact.repository.port';
import type { ContactRepositoryPort } from '../domain/ports/contact.repository.port';
import { ApiResponse } from '@libs/common';
import { UserService } from '@libs/users';
import { ProductService } from '@libs/products';

export const CALL_LOG_REPOSITORY = 'CallLogRepositoryPort';

@Injectable()
export class GetCallLogsUseCase {
  constructor(
    @Inject(CALL_LOG_REPOSITORY)
    private readonly callLogRepo: CallLogRepositoryPort,
    @Inject(CONTACT_REPOSITORY)
    private readonly contactRepo: ContactRepositoryPort,
    private readonly userService: UserService,
    @Inject(forwardRef(() => ProductService))
    private readonly productService: ProductService,
  ) {}

  async execute(
    userId: number,
    dto: GetCallLogsDto,
  ): Promise<ApiResponse<unknown>> {
    const { company_id, product_id } = dto;

    await this.userService.validateUserCompany(userId, company_id);

    if (product_id && product_id !== 'all') {
      const productIds = product_id
        .split(',')
        .map((id) => id.trim())
        .filter((id) => id !== '')
        .map((id) => Number(id))
        .filter((id) => !isNaN(id));

      for (const pId of productIds) {
        await this.productService.validateProductCompany(
          pId,
          company_id,
          dto.contact_type === GetCallLogsContactTypeEnum.VENDOR,
        );
      }
    }

    const responseData = await this.callLogRepo.getCallLogs(userId, dto);

    return {
      success: true,
      code: 'DATA_FETCHED',
      message: 'Data fetched successfully.',
      data: responseData,
    };
  }
}
