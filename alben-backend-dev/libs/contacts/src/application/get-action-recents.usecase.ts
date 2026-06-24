import { Injectable, Inject } from '@nestjs/common';
import { CONTACT_REPOSITORY } from '../domain/ports/contact.repository.port';
import type { ContactRepositoryPort } from '../domain/ports/contact.repository.port';
import { ApiResponse } from '@libs/common';
import { UserService } from '@libs/users';
import { GetActionRecentsQueryDto } from '../ui/dtos/get-action-recents-query.dto';
import { GetContactsResponseDto } from '../ui/dtos/get-contacts-response.dto';

@Injectable()
export class GetActionRecentsUseCase {
  constructor(
    @Inject(CONTACT_REPOSITORY)
    private readonly contactRepo: ContactRepositoryPort,
    private readonly userService: UserService,
  ) {}

  async execute(
    userId: number,
    dto: GetActionRecentsQueryDto,
  ): Promise<ApiResponse<GetContactsResponseDto>> {
    // 1. Validate User-Company association
    await this.userService.validateUserCompany(userId, dto.company_id);

    // 2. Fetch action recents from repository
    const responseData = await this.contactRepo.getActionRecents(userId, dto);

    return {
      success: true,
      code: 'DATA_FETCHED',
      message: 'Action recents fetched successfully.',
      data: responseData,
    };
  }
}
