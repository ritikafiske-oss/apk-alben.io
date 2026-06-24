import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserProductContactEntity } from '../infrastructure/persistence/entities/user-product-contact.entity';
import { NoteEntity } from '@libs/notes';
import { ApiResponse } from '@libs/common';
import { UserService } from '@libs/users';
import { MarkMyPlanTypeEnum } from '../ui/dtos/mark-my-plan.dto';
import { UnmarkMyPlanRequestDto } from '../ui/dtos/unmark-my-plan.dto';

@Injectable()
export class UnmarkMyPlanUseCase {
  constructor(
    @InjectRepository(UserProductContactEntity)
    private readonly userProductContactRepo: Repository<UserProductContactEntity>,
    @InjectRepository(NoteEntity)
    private readonly noteRepo: Repository<NoteEntity>,
    private readonly userService: UserService,
  ) {}

  async execute(
    userId: number,
    dto: UnmarkMyPlanRequestDto,
    companyId: number,
  ): Promise<ApiResponse<null>> {
    // 1. Validate User-Company association
    await this.userService.validateUserCompany(userId, companyId);

    // 2. Iterate through items and update
    const noteIds: number[] = [];
    const callIds: number[] = [];

    for (const item of dto.items) {
      if (item.type === MarkMyPlanTypeEnum.NOTES) {
        noteIds.push(item.id);
      } else if (item.type === MarkMyPlanTypeEnum.CALL) {
        callIds.push(item.id);
      }
    }

    if (noteIds.length > 0) {
      await this.noteRepo.update(noteIds, { isMyPlan: false });
    }

    if (callIds.length > 0) {
      await this.userProductContactRepo.update(callIds, { isMyPlan: false });
    }

    return {
      success: true,
      code: 'MY_PLAN_UPDATED',
      message: 'Items unmarked from My Plan successfully.',
      data: null,
    };
  }
}
