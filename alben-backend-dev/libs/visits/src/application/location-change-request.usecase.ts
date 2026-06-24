import { Inject, Injectable, BadRequestException } from '@nestjs/common';
import { VISIT_REPOSITORY } from '../domain/ports/visit.repository.port';
import type { VisitRepositoryPort } from '../domain/ports/visit.repository.port';
import { LocationChangeRequestDto } from '../ui/dtos/location-change-request.dto';

@Injectable()
export class LocationChangeRequestUseCase {
  constructor(
    @Inject(VISIT_REPOSITORY)
    private readonly visitRepo: VisitRepositoryPort,
  ) {}

  async execute(
    userId: number,
    items: LocationChangeRequestDto[],
  ): Promise<void> {
    for (const item of items) {
      const visitLog = await this.visitRepo.findVisitLogById(item.visit_log_id);
      if (!visitLog) {
        throw new BadRequestException({
          success: false,
          code: 'VISIT_NOT_FOUND',
          message: 'Visit not found.',
          data: null,
        });
      }

      const pending = await this.visitRepo.findPendingLocationChangeRequest(
        visitLog.contactId,
        Number(visitLog.productId),
      );
      if (pending) {
        throw new BadRequestException({
          success: false,
          code: 'LOCATION_CHANGE_REQUEST_ALREADY_SUBMITTED',
          message: 'Location change request is already submitted.',
          data: null,
        });
      }

      const approved = await this.visitRepo.findApprovedLocationChangeRequest(
        item.visit_log_id,
      );
      let previousVisitLogId: number | null = null;
      if (approved) {
        previousVisitLogId = approved.visitLogId;
      } else {
        previousVisitLogId = await this.visitRepo.findFirstVisitLogId(
          visitLog.contactId,
          Number(visitLog.productId),
        );
        if (!previousVisitLogId) {
          throw new BadRequestException({
            success: false,
            code: 'PREVIOUS_VISIT_NOT_FOUND',
            message:
              'No previous visit log found for this contact and product.',
            data: null,
          });
        }
      }

      await this.visitRepo.createLocationChangeRequest({
        contactId: visitLog.contactId,
        previousVisitLogId,
        visitLogId: item.visit_log_id,
        userId,
        userRemark: item.remark,
        approvedStatus: 'pending',
        updatedBy: userId,
      });
    }
  }
}
