import { Injectable, Inject } from '@nestjs/common';
import { CONTACT_STATUS_REPOSITORY } from '../domain/ports/contact-status.repository.port';
import type { ContactStatusRepositoryPort } from '../domain/ports/contact-status.repository.port';
import { UserService } from '@libs/users';
import { ApiResponse } from '@libs/common';
import { ContactStatus } from '../domain/entities/contact-status.entity';

@Injectable()
export class ContactStatusService {
  constructor(
    @Inject(CONTACT_STATUS_REPOSITORY)
    private readonly contactStatusRepo: ContactStatusRepositoryPort,
    private readonly userService: UserService,
  ) {}

  async getContactStatuses(
    userId: number,
    companyId: number,
  ): Promise<ApiResponse<ContactStatus[]>> {
    await this.userService.validateUserCompany(userId, companyId);

    const statuses =
      await this.contactStatusRepo.findContactStatuses(companyId);

    return {
      success: true,
      code: 'DATA_FETCHED',
      message: 'Data fetched successfully.',
      data: statuses,
    };
  }
}
