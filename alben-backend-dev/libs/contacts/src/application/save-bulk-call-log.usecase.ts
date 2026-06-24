import { Inject, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
  SaveBulkCallLogRequestDto,
  SaveBulkCallLogsDataDto,
} from '../ui/dtos/save-bulk-call-log.dto';
import { CONTACT_REPOSITORY } from '../domain/ports/contact.repository.port';
import { CALL_LOG_REPOSITORY } from './get-call-logs.usecase';
import { ApiResponse, DateUtil, ExceptionHandler } from '@libs/common';
import type { ContactRepositoryPort } from '../domain/ports/contact.repository.port';
import type { CallLogRepositoryPort } from '../domain/ports/call-log.repository.port';
import { UserService } from '@libs/users';
import { NOTE_REPOSITORY } from '@libs/notes';
import type { NoteRepositoryPort } from '@libs/notes';

@Injectable()
export class SaveBulkCallLogUseCase {
  constructor(
    @Inject(CONTACT_REPOSITORY)
    private readonly contactRepository: ContactRepositoryPort,
    @Inject(CALL_LOG_REPOSITORY)
    private readonly callLogRepo: CallLogRepositoryPort,
    @Inject(NOTE_REPOSITORY)
    private readonly noteRepo: NoteRepositoryPort,
    private readonly userService: UserService,
    private readonly dataSource: DataSource,
  ) {}

  async execute(
    userId: number,
    dto: SaveBulkCallLogRequestDto,
  ): Promise<ApiResponse<SaveBulkCallLogsDataDto>> {
    const { company_id, call_logs } = dto;

    // 1. Validate Company & Get User Role
    await this.userService.validateUserCompany(userId, company_id);

    const appCallLogIds: Array<{
      app_call_log_id: number | null;
      call_log_id: number | null;
    }> = [];

    await this.userService.getBusinessSetting(company_id, 'call_attempts');

    for (const callLog of call_logs) {
      try {
        let contactType = callLog.contact_type || 'client';

        const mobile = callLog.mobile;
        const firstName = callLog.firstname;
        const lastName = callLog.lastname ?? null;
        const alternateNumber = callLog.alternate_number ?? null;
        const businessName = callLog.business_name ?? null;
        const designation = callLog.designation ?? null;
        const email = callLog.email ?? null;

        const callStartAt = callLog.start_call_at;
        let duration = callLog.duration ?? 0;

        const callType = callLog.call_type;
        let callStatus = callLog.call_status ?? 'unanswered';

        const latitude = callLog.latitude ?? 0;
        const longitude = callLog.longitude ?? 0;

        if (callType === 'missed') {
          callStatus = 'unanswered';
          duration = 0;
        } else if (duration > 0) {
          callStatus = 'received';
        }

        if (duration === 0) {
          callStatus = 'unanswered';
        }

        // Find or create Contact
        let contact = await this.contactRepository.findContact(
          mobile,
          company_id,
        );

        if (!contact && firstName) {
          contact = await this.contactRepository.createContact({
            mobile,
            firstname: firstName,
            lastname: lastName,
            alternateNumber: alternateNumber,
            businessName: businessName,
            designation: designation,
            email: email,
            contactType: contactType,
            companyId: company_id,
            createdBy: userId,
          });
        } else if (contact) {
          contactType = contact.contactType;
          // Update alternate number if provided and different
          if (alternateNumber) {
            const currentAlt = contact.alternateNumber || '';
            const newAltArr = alternateNumber
              .split(',')
              .map((n) => n.trim())
              .filter((n) => n.length === 10 && !isNaN(Number(n)));
            const finalNewAlt =
              newAltArr.length > 0 ? newAltArr.join(',') : null;

            if (finalNewAlt && finalNewAlt !== currentAlt) {
              await this.contactRepository.updateContact(contact.id, {
                alternateNumber: finalNewAlt,
              });
            }
          }
        } else {
          continue; // If no contact and no firstname, skip
        }

        const contactId = contact.id;

        // Timezone formatting: IST -> UTC
        const callStartAtUtc = DateUtil.getDateTimeAccordingTimezone(
          callStartAt,
          'Asia/Kolkata',
          'UTC',
        );
        const callCreatedAt = callStartAtUtc;

        // Check if the call log entry already exists
        const checkCallLog = await this.callLogRepo.findExistingCallLog(
          contactId,
          mobile,
          callStartAtUtc,
          duration,
          userId,
        );

        if (checkCallLog) {
          appCallLogIds.push({
            app_call_log_id: callLog.app_call_log_id ?? null,
            call_log_id: checkCallLog.id ?? null,
          });
          continue;
        }

        if (callStatus) {
          // Native insert for CallLog
          const createdCallLog = await this.callLogRepo.createCallLog({
            mobile,
            start_call_at: callStartAtUtc,
            duration: duration.toString(),
            contact_id: contactId,
            user_id: userId,
            type: callType as import('../infrastructure/persistence/entities/call-log.entity').CallLogTypeEnum,
            status: callStatus,
            latitude,
            longitude,
            created_at: callCreatedAt,
          });

          appCallLogIds.push({
            app_call_log_id: callLog.app_call_log_id ?? null,
            call_log_id: createdCallLog.id ?? null,
          });
        }
      } catch (err) {
        ExceptionHandler.handleAndThrow(err);
      }
    }

    return {
      success: true,
      message: 'Details saved successfully.',
      code: 'DETAILS_SAVED',
      data: {
        call_log_ids: appCallLogIds,
      },
    };
  }
}
