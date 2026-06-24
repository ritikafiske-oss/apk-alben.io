import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserProductContactEntity } from '../infrastructure/persistence/entities/user-product-contact.entity';
import { NoteEntity } from '@libs/notes';
import { ApiResponse } from '@libs/common';
import { ContactCountsResponseDto } from '../ui/dtos/get-contact-counts-response.dto';
import { UserService } from '@libs/users';
import { ContactTypeEnum } from '../ui/dtos/get-contacts.dto';

@Injectable()
export class GetContactCountsUseCase {
  constructor(
    @InjectRepository(UserProductContactEntity)
    private readonly userProductContactRepo: Repository<UserProductContactEntity>,
    @InjectRepository(NoteEntity)
    private readonly noteRepo: Repository<NoteEntity>,
    private readonly userService: UserService,
  ) {}

  async execute(
    userId: number,
    companyId: number,
  ): Promise<ApiResponse<ContactCountsResponseDto>> {
    // Validate User-Company association (this also checks company status)
    await this.userService.validateUserCompany(userId, companyId);

    const now = new Date();
    const todayStart = new Date(now.setHours(0, 0, 0, 0));

    // 1. my_plan: Count unique contacts present in both user_product_contacts (is_my_plan=1) AND notes (is_my_plan=1 AND is_done=0)
    const myPlanQuery = `
      SELECT COUNT(DISTINCT actions.contact_id) as count FROM (
        SELECT upc.contact_id 
        FROM user_product_contacts upc 
        INNER JOIN contacts c ON c.id = upc.contact_id 
        WHERE upc.user_id = ? AND c.company_id = ? AND upc.is_my_plan = 1 AND c.deleted_at IS NULL
        
        UNION
        
        SELECT n.contact_id 
        FROM notes n 
        INNER JOIN contacts c ON c.id = n.contact_id 
        WHERE n.user_id = ? AND c.company_id = ? AND n.is_my_plan = 1 AND n.is_done = 0 AND c.deleted_at IS NULL
      ) as actions
    `;
    const myPlanResult = await this.userProductContactRepo.manager.query<
      {
        count: string | number;
      }[]
    >(myPlanQuery, [userId, companyId, userId, companyId]);
    const myPlanCount = Number(myPlanResult[0]?.count || 0);

    // 2. new: Count unique contacts from user_product_contacts for userId where is_newly_assigned is true.
    const newCountResult = await this.userProductContactRepo
      .createQueryBuilder('upc')
      .innerJoin('contacts', 'c', 'c.id = upc.contact_id')
      .where('upc.user_id = :userId', { userId })
      .andWhere('c.company_id = :companyId', { companyId })
      .andWhere('upc.is_newly_assigned = :isNewlyAssigned', {
        isNewlyAssigned: true,
      })
      .andWhere('upc.is_my_plan = :isMyPlan', { isMyPlan: false })
      .andWhere('upc.called_at IS NULL')
      .andWhere('c.deleted_at IS NULL')
      .select('COUNT(DISTINCT upc.contact_id)', 'count')
      .getRawOne<{ count: string | number }>();
    const newCount = Number(newCountResult?.count || 0);

    // 3. reminder: Count unique contacts from notes for userId where related contact matches companyId AND is_done is false AND date of reminder_datetime >= today.
    const reminderCountResult = await this.noteRepo
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
      .andWhere('n.is_done = :isDone', { isDone: false })
      .andWhere('n.is_my_plan = :isMyPlan', { isMyPlan: false })
      .andWhere('n.reminder_datetime >= :todayStart', { todayStart })
      .andWhere('c.deleted_at IS NULL')
      .select('COUNT(DISTINCT n.contact_id)', 'count')
      .getRawOne<{ count: string | number }>();
    const reminderCount = Number(reminderCountResult?.count || 0);

    // 4. overdue: Count unique contacts from notes for userId where related contact matches companyId AND is_done is false AND date of reminder_datetime < today.
    const overdueCountResult = await this.noteRepo
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
      .andWhere('n.is_done = :isDone', { isDone: false })
      .andWhere('n.is_my_plan = :isMyPlan', { isMyPlan: false })
      .andWhere('n.reminder_datetime < :todayStart', { todayStart })
      .andWhere('c.deleted_at IS NULL')
      .select('COUNT(DISTINCT n.contact_id)', 'count')
      .getRawOne<{ count: string | number }>();
    const overdueCount = Number(overdueCountResult?.count || 0);

    return {
      success: true,
      code: 'DATA_FETCHED',
      message: 'Counts fetched successfully.',
      data: {
        my_plan: myPlanCount,
        new: newCount,
        reminder: reminderCount,
        overdue: overdueCount,
      },
    };
  }
}
