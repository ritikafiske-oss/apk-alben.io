import { Injectable } from '@nestjs/common';
import { ApiResponse, DateUtil } from '@libs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { DashboardMetricsResponseDto } from '../ui/dtos/dashboard-metrics.response.dto';
import { UserProductContactEntity, ContactTypeEnum } from '@libs/contacts';
import { NoteEntity } from '@libs/notes';
import { UserService } from '@libs/users';
import { LocationLogEntity } from '@libs/locations';
import { CallLogEntity } from '@libs/contacts';

@Injectable()
export class GetDashboardMetricsUseCase {
  constructor(
    @InjectRepository(UserProductContactEntity)
    private readonly userProductContactRepo: Repository<UserProductContactEntity>,
    @InjectRepository(NoteEntity)
    private readonly noteRepo: Repository<NoteEntity>,
    @InjectRepository(LocationLogEntity)
    private readonly locationLogRepo: Repository<LocationLogEntity>,
    @InjectRepository(CallLogEntity)
    private readonly callLogRepo: Repository<CallLogEntity>,
    private readonly userService: UserService,
  ) {}

  async execute(
    userId: number,
    companyId: number,
  ): Promise<ApiResponse<DashboardMetricsResponseDto>> {
    // Validate User-Company association
    await this.userService.validateUserCompany(userId, companyId);

    const now = new Date();
    const todayStart = new Date(now.setHours(0, 0, 0, 0));

    // 1. totalNewLeadCount: Count unique contacts from user_product_contacts where is_newly_assigned is true.
    const totalNewLeadCountResult = await this.userProductContactRepo
      .createQueryBuilder('upc')
      .innerJoin('contacts', 'c', 'c.id = upc.contact_id')
      .where('upc.user_id = :userId', { userId })
      .andWhere('c.company_id = :companyId', { companyId })
      .andWhere('upc.is_newly_assigned = :isNewlyAssigned', {
        isNewlyAssigned: true,
      })
      .andWhere('upc.called_at IS NULL')
      .andWhere('c.deleted_at IS NULL')
      .select('COUNT(DISTINCT upc.contact_id)', 'count')
      .getRawOne<{ count: string | number }>();
    const totalNewLeadCount = Number(totalNewLeadCountResult?.count || 0);

    // 1b. completedNewLeadCount: is_newly_assigned=1 AND called_at = today
    const completedNewLeadCountResult = await this.userProductContactRepo
      .createQueryBuilder('upc')
      .innerJoin('contacts', 'c', 'c.id = upc.contact_id')
      .where('upc.user_id = :userId', { userId })
      .andWhere('c.company_id = :companyId', { companyId })
      .andWhere('upc.is_newly_assigned = :isNewlyAssigned', {
        isNewlyAssigned: true,
      })
      .andWhere('upc.called_at >= :todayStart', { todayStart })
      .andWhere('c.deleted_at IS NULL')
      .select('COUNT(DISTINCT upc.contact_id)', 'count')
      .getRawOne<{ count: string | number }>();
    const completedNewLeadCount = Number(
      completedNewLeadCountResult?.count || 0,
    );

    // Helper for reminder queries
    const getReminderCount = async (isDone: boolean, isOverdue: boolean) => {
      const query = this.noteRepo
        .createQueryBuilder('n')
        .innerJoin('contacts', 'c', 'c.id = n.contact_id')
        .innerJoin(
          'product_contacts',
          'pc',
          'n.contact_id = pc.contact_id AND n.product_id = pc.product_id AND pc.is_service = IF(c.contact_type = :vendorType, 1, 0)',
          { vendorType: ContactTypeEnum.VENDOR },
        )
        .where('n.user_id = :userId', { userId })
        .andWhere('c.company_id = :companyId', { companyId })
        .andWhere('n.is_done = :isDone', { isDone })
        .andWhere('c.deleted_at IS NULL');

      if (isOverdue) {
        query.andWhere('n.reminder_datetime < :todayStart', { todayStart });
        if (isDone) {
          query.andWhere('n.updated_at >= :todayStart', { todayStart });
        }
      } else {
        query.andWhere('n.reminder_datetime >= :todayStart', { todayStart });
      }

      const result = await query
        .select('COUNT(DISTINCT n.contact_id)', 'count')
        .getRawOne<{ count: string | number }>();
      return Number(result?.count || 0);
    };

    // 2. setReminderCount (is_done=0, >= today)
    const setReminderCount = await getReminderCount(false, false);

    // 3. totalOverdueCount (is_done=0, < today)
    const totalOverdueCount = await getReminderCount(false, true);

    // 4. completedReminderCount (is_done=1, >= today)
    const completedReminderCount = await getReminderCount(true, false);

    // 5. completedOverdueCount (is_done=1, < today)
    const completedOverdueCount = await getReminderCount(true, true);

    // 5b. totalAutoDialLeadCount: Similar to getContacts API logic for targetDial=autodial
    const totalAutoDialLeadCountResult = await this.userProductContactRepo
      .createQueryBuilder('upc')
      .innerJoin('contacts', 'c', 'c.id = upc.contact_id')
      .innerJoin(
        'products',
        'p',
        'p.id = upc.product_id AND p.deleted_at IS NULL',
      )
      .innerJoin(
        'product_contacts',
        'pc',
        'pc.contact_id = upc.contact_id AND pc.product_id = upc.product_id',
      )
      .where('upc.user_id = :userId', { userId })
      .andWhere('c.company_id = :companyId', { companyId })
      .andWhere('pc.is_service = 0')
      .andWhere('upc.is_autodial = 1')
      .andWhere('c.contact_type = :contactType', {
        contactType: ContactTypeEnum.CLIENT,
      })
      .andWhere('c.deleted_at IS NULL')
      .select('COUNT(DISTINCT upc.contact_id)', 'count')
      .getRawOne<{ count: string | number }>();
    const totalAutoDialLeadCount = Number(
      totalAutoDialLeadCountResult?.count || 0,
    );

    // 5c. completedAutoDialLeadCount: same as total but exclude contacts called today
    const completedAutoDialLeadCountResult = await this.userProductContactRepo
      .createQueryBuilder('upc')
      .innerJoin('contacts', 'c', 'c.id = upc.contact_id')
      .innerJoin(
        'products',
        'p',
        'p.id = upc.product_id AND p.deleted_at IS NULL',
      )
      .innerJoin(
        'product_contacts',
        'pc',
        'pc.contact_id = upc.contact_id AND pc.product_id = upc.product_id',
      )
      .leftJoin(
        'call_logs',
        'cl',
        'cl.contact_id = upc.contact_id AND cl.user_id = :userId AND cl.created_at >= :todayStart',
        { userId, todayStart },
      )
      .where('upc.user_id = :userId', { userId })
      .andWhere('c.company_id = :companyId', { companyId })
      .andWhere('pc.is_service = 0')
      .andWhere('upc.is_autodial = 1')
      .andWhere('c.contact_type = :contactType', {
        contactType: ContactTypeEnum.CLIENT,
      })
      .andWhere('c.deleted_at IS NULL')
      .andWhere('cl.id IS NULL')
      .select('COUNT(DISTINCT upc.contact_id)', 'count')
      .getRawOne<{ count: string | number }>();
    const completedAutoDialLeadCount = Number(
      completedAutoDialLeadCountResult?.count || 0,
    );

    // 6. checkedInTime: Latest check_in or check_out from location_logs
    const latestLog = await this.locationLogRepo.findOne({
      where: {
        user_id: userId,
        company_id: companyId,
        log_type: In(['check_in', 'check_out']),
      },
      order: {
        created_at: 'DESC',
      },
    });

    let checkedInTime: string | null = null;
    if (latestLog && latestLog.log_type === 'check_in') {
      checkedInTime = DateUtil.getDateTimeAccordingTimezone(
        latestLog.created_at,
        'UTC',
        'Asia/Kolkata',
        'YYYY-MM-DD HH:mm:ss',
      );
    }

    return {
      success: true,
      code: 'DATA_FETCHED',
      message: 'Data fetched successfully.',
      data: {
        completedReminderCount,
        setReminderCount,
        completedNewLeadCount,
        totalNewLeadCount,
        completedOverdueCount,
        totalOverdueCount,
        completedAutoDialLeadCount,
        totalAutoDialLeadCount,
        checkedInTime,
      },
    };
  }
}
