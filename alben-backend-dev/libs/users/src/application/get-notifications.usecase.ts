import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { NOTIFICATION_REPOSITORY } from '../domain/ports/notification.repository.port';
import type { NotificationRepositoryPort } from '../domain/ports/notification.repository.port';
import { UserService } from './user.service';
import {
  GetNotificationsDto,
  NotificationResponseDto,
} from '../ui/dtos/get-notifications.dto';
import { ApiResponse } from '@libs/common';

@Injectable()
export class GetNotificationsUseCase {
  constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly notificationRepo: NotificationRepositoryPort,
    private readonly userService: UserService,
  ) {}

  async execute(
    userId: number,
    dto: GetNotificationsDto,
  ): Promise<ApiResponse<NotificationResponseDto>> {
    const { company_id: companyId, page = 1, limit = 200 } = dto;

    // 1. Check company association
    try {
      await this.userService.validateUserCompany(userId, companyId);
    } catch {
      throw new BadRequestException({
        success: false,
        message: 'Invalid company.',
        data: null,
      });
    }

    // 2. Fetch unread count
    const totalUnread = await this.notificationRepo.countUnread(userId);

    // 3. Fetch paginated notifications
    const { records, total, lastPage } =
      await this.notificationRepo.findPaginated(userId, page, limit, companyId);

    // 4. Fetch latest unanswered surprise visit
    const surpriseVisit =
      await this.notificationRepo.findLatestPendingSurpriseVisit(
        userId,
        companyId,
      );

    // 5. Construct response
    const response: NotificationResponseDto = {
      surprise_visit: surpriseVisit,
      total_unread: totalUnread,
      current_page: page,
      total_pages: lastPage,
      total_items: total,
      records: records,
    };

    return {
      success: true,
      code: 'DATA_FETCHED',
      message: 'Notifications fetched successfully.',
      data: response,
    };
  }
}
