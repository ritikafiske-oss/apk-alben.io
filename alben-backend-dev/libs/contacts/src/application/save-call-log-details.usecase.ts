import { Injectable, Inject } from '@nestjs/common';
import type { CallLogRepositoryPort } from '../domain/ports/call-log.repository.port';
import type { ContactRepositoryPort } from '../domain/ports/contact.repository.port';
import type { NoteRepositoryPort } from '@libs/notes';
import { CALL_LOG_REPOSITORY } from './get-call-logs.usecase';
import { CONTACT_REPOSITORY } from '../domain/ports/contact.repository.port';
import { NOTE_REPOSITORY } from '@libs/notes';
import { SaveCallLogDetailsRequestDto } from '../ui/dtos/save-call-log-details.dto';
import { ApiResponse, DateUtil, ExceptionHandler } from '@libs/common';
import { UserService } from '@libs/users';
import { ContactTypeEnum } from '../ui/dtos/get-contacts.dto';
import { CallLogEntity } from '../infrastructure/persistence/entities/call-log.entity';

@Injectable()
export class SaveCallLogDetailsUseCase {
  constructor(
    @Inject(CALL_LOG_REPOSITORY)
    private readonly callLogRepo: CallLogRepositoryPort,
    @Inject(CONTACT_REPOSITORY)
    private readonly contactRepository: ContactRepositoryPort,
    @Inject(NOTE_REPOSITORY)
    private readonly noteRepo: NoteRepositoryPort,
    private readonly userService: UserService,
  ) {}

  async execute(
    userId: number,
    dto: SaveCallLogDetailsRequestDto,
  ): Promise<ApiResponse<unknown>> {
    const { call_log_id, products } = dto;

    // 1. Verify call log exists
    const callLog = await this.callLogRepo.findById(call_log_id);
    if (!callLog) {
      return {
        success: false,
        code: 'CALL_LOG_NOT_FOUND',
        message: 'Call log not found.',
        data: null,
      };
    }

    // Get contact and company context
    const contact = await this.contactRepository.findContactByIdWithoutCompany(
      callLog.contact_id,
    );
    if (!contact) {
      return {
        success: false,
        code: 'CONTACT_NOT_FOUND',
        message: 'Contact not found.',
        data: null,
      };
    }

    const companyId = contact.companyId;

    // Fetch user company role and business settings
    const userCompany = await this.userService.validateUserCompany(
      userId,
      companyId,
    );
    const callAttemptsSetting = await this.userService.getBusinessSetting(
      companyId,
      'call_attempts',
    );
    const totalAttempts = callAttemptsSetting
      ? parseInt(callAttemptsSetting)
      : 0;

    let isFirstProduct = true;

    const isColleague =
      contact.contactType === (ContactTypeEnum.COLLEAGUE as string);

    for (const item of products) {
      try {
        const {
          product_id,
          status_id,
          note_description,
          note_reminder_datetime,
          dial_type,
        } = item;

        // Validation for non-colleague contacts
        if (!isColleague) {
          if (!product_id || !status_id || !note_description) {
            return {
              success: false,
              code: 'VALIDATION_ERROR',
              message:
                'Product ID, Status ID, and Note Description are required for this contact type.',
              data: null,
            };
          }
        }

        let dialType = '';
        if (userCompany.role === 'field_agent') {
          dialType = 'manualdial';
        } else if (userCompany.role === 'telecaller') {
          dialType = 'autodial';
        }

        const isService =
          contact.contactType === (ContactTypeEnum.VENDOR as string);

        let previousStatusId: number | null | undefined = status_id;

        if (!isColleague && product_id && status_id) {
          const productId = product_id;
          const statusId = status_id;

          // Verify product and status
          const isValidProd = await this.contactRepository.checkProductExists(
            companyId,
            productId,
            isService,
          );
          if (!isValidProd) continue;

          const contactStatus = await this.contactRepository.findContactStatus(
            companyId,
            statusId,
          );
          if (!contactStatus) continue;

          const isHide = contactStatus.is_hide ? 1 : 0;
          const isUnassigned = contactStatus.is_unassigned;
          const effectiveDialType = dialType || dial_type;
          const isManualdial = effectiveDialType === 'manualdial';
          const isAutodial = effectiveDialType === 'autodial';

          // Create or update ProductContact
          let productContact = await this.contactRepository.findProductContact(
            productId,
            contact.id,
            isService,
          );
          previousStatusId = productContact
            ? productContact.contactStatusId
            : statusId;

          if (!productContact) {
            productContact = await this.contactRepository.createProductContact({
              contactId: contact.id,
              productId: productId,
              contactStatusId: statusId,
              isHide: !!isHide,
              attempts: 1,
              isService:
                contact.contactType === (ContactTypeEnum.VENDOR as string),
              latitude: callLog.latitude || 0,
              longitude: callLog.longitude || 0,
            });
          } else {
            await this.contactRepository.updateProductContact(
              productContact.id,
              {
                contactStatusId: statusId,
                isHide: !!isHide,
                attempts: (productContact.attempts || 0) + 1,
                latitude: callLog.latitude || productContact.latitude,
                longitude: callLog.longitude || productContact.longitude,
                isService: isService,
              },
            );
          }

          // Calculate isLastNumber (True if no alternates or if this is the last alternate number)
          const alternateNumbersStr = contact.alternateNumber || '';
          const alternateNumbers = alternateNumbersStr
            .split(',')
            .map((n) => n.trim())
            .filter((n) => n.length > 0);

          const calledMobile = callLog.mobile || '';
          const normalizePhone = (n: string) => n.replace(/\D/g, '').slice(-10);
          const normalizedCalledMobile = normalizePhone(calledMobile);
          const normalizedAlts = alternateNumbers.map(normalizePhone);

          const altNumberIndex = normalizedAlts.indexOf(normalizedCalledMobile);
          const altNumberCount = alternateNumbers.length;

          // If called number is in alternates, altNumberIndex is 0, 1, 2...
          // Normalized index matching Laravel (1-based for comparison):
          const normalizedAltIndex =
            altNumberIndex !== -1 ? altNumberIndex + 1 : 0;
          const isLastNumber =
            altNumberCount === 0 || altNumberCount === normalizedAltIndex;

          // Handle User Product Contact (Attempts, Assignment, and Unassignment)
          if (isUnassigned) {
            await this.contactRepository.deleteUserProductContact(
              productId,
              contact.id,
              userId,
              isService,
            );
          } else {
            const userProductContact =
              await this.contactRepository.findUserProductContact(
                productId,
                contact.id,
                userId,
                isService,
              );
            if (userProductContact) {
              const callStatus = callLog.status;
              let handled = false;

              if (effectiveDialType === 'autodial') {
                if (
                  callStatus === 'received' &&
                  userProductContact.isAutodial
                ) {
                  // Received: Reset VPC always (no isLastNumber check for received)
                  await this.contactRepository.deleteUserProductContact(
                    productId,
                    contact.id,
                    userId,
                    isService,
                  );
                  await this.contactRepository.createUserProductContact({
                    contactId: contact.id,
                    productId: productId,
                    userId: userId,
                    isService: isService,
                    attempts: 1, // Reset attempts to 1
                    isManualdial: userProductContact.isManualdial,
                    isAutodial: userProductContact.isAutodial,
                    calledAt: userProductContact.calledAt ?? new Date(),
                  });
                  handled = true;
                } else if (
                  callStatus === 'unanswered' &&
                  userProductContact.isAutodial
                ) {
                  const attempts = (userProductContact.attempts || 0) + 1;

                  // Only update/delete VPC if it's the last number
                  if (isLastNumber) {
                    if (totalAttempts > 0 && attempts >= totalAttempts) {
                      if (
                        userProductContact.isManualdial &&
                        userProductContact.isAutodial
                      ) {
                        if (userCompany.role === 'telecaller') {
                          await this.contactRepository.deleteUserProductContact(
                            productId,
                            contact.id,
                            userId,
                            isService,
                          );
                        } else {
                          await this.contactRepository.updateUserProductContact(
                            userProductContact.id,
                            {
                              isManualdial: true,
                              isAutodial: false,
                              calledAt:
                                userProductContact.calledAt ?? new Date(),
                            },
                          );
                        }
                      } else if (userProductContact.isAutodial) {
                        await this.contactRepository.deleteUserProductContact(
                          productId,
                          contact.id,
                          userId,
                          isService,
                        );
                      }
                    } else {
                      // Re-create with incremented attempts
                      await this.contactRepository.deleteUserProductContact(
                        productId,
                        contact.id,
                        userId,
                        isService,
                      );
                      await this.contactRepository.createUserProductContact({
                        contactId: contact.id,
                        productId: productId,
                        userId: userId,
                        isService: isService,
                        attempts: attempts,
                        isManualdial: userProductContact.isManualdial,
                        isAutodial: userProductContact.isAutodial,
                        calledAt: userProductContact.calledAt ?? new Date(),
                      });
                    }
                  }
                  handled = true;
                }
              }

              if (!handled) {
                // For non-autodial or cases where isLastNumber logic wasn't triggered
                // We still update the attempts count if needed, but Laravel logic
                // for Autodial is very specific about the recreate cycle.
                await this.contactRepository.updateUserProductContact(
                  userProductContact.id,
                  {
                    attempts: (userProductContact.attempts || 0) + 1,
                    isManualdial,
                    isAutodial,
                    calledAt: userProductContact.calledAt ?? new Date(),
                  },
                );
              }
            } else {
              // Check assignment limit before assigning
              const canAssign = await this.canAssignContact(
                companyId,
                productId,
                contact.id,
                isService,
              );
              if (canAssign) {
                await this.contactRepository.createUserProductContact({
                  contactId: contact.id,
                  productId: productId,
                  userId: userId,
                  isService: isService,
                  attempts: 1,
                  isManualdial,
                  isAutodial,
                  calledAt: new Date(),
                });
              }
            }
          }
        }

        const isServiceVal =
          contact.contactType === (ContactTypeEnum.VENDOR as string);
        await this.noteRepo.markRemindersAsSent(
          contact.id,
          userId,
          callLog.id,
          isServiceVal,
        );

        // Create CallLogProductDetail
        if (!isColleague && product_id && status_id) {
          await this.callLogRepo.createCallLogProductDetail({
            callLogId: callLog.id,
            productId: product_id,
            statusId: status_id,
            lastContactStatusId: previousStatusId,
          });
        }

        // Create Note
        let createdNoteId: number | undefined = undefined;
        if (note_description) {
          let reminderUtc: Date | null = null;
          if (note_reminder_datetime) {
            reminderUtc = DateUtil.getDateTimeAccordingTimezone(
              note_reminder_datetime,
              'Asia/Kolkata',
              'UTC',
            );
          }

          const createdNote = await this.noteRepo.createNote({
            description: note_description,
            reminderDatetime: reminderUtc,
            productId: product_id,
            contactId: contact.id,
            userId: userId,
            callLogId: callLog.id,
            forNote: 'others',
          });
          createdNoteId = createdNote.id;
        }

        // Sync first product back to main call_logs table for compatibility
        if (isFirstProduct) {
          const updateData: Partial<CallLogEntity> = {
            note_id: createdNoteId,
          };

          if (product_id) updateData.product_id = product_id;
          if (status_id) updateData.last_contact_status_id = status_id;

          await this.callLogRepo.updateCallLog(callLog.id, updateData);
          isFirstProduct = false;
        }
      } catch (err) {
        ExceptionHandler.handleAndThrow(err);
      }
    }

    // Refresh remaining products for the contact (delete and recreate with same data)
    if (!isColleague) {
      try {
        const existingAssignments =
          await this.contactRepository.findUserProductContactsByContact(
            contact.id,
            userId,
          );
        const processedProductIds = new Set(
          products.map((p) => Number(p.product_id)),
        );

        for (const assignment of existingAssignments) {
          const assignmentProductId = assignment.productId
            ? Number(assignment.productId)
            : 0;
          if (!processedProductIds.has(assignmentProductId)) {
            await this.contactRepository.deleteUserProductContact(
              assignmentProductId,
              contact.id,
              userId,
              assignment.isService,
            );
            await this.contactRepository.createUserProductContact({
              contactId: assignment.contactId,
              productId: assignment.productId,
              userId: assignment.userId,
              isService: assignment.isService,
              attempts: assignment.attempts,
              isManualdial: assignment.isManualdial,
              isAutodial: assignment.isAutodial,
              calledAt: assignment.calledAt,
              isMyPlan: assignment.isMyPlan,
              isNewlyAssigned: assignment.isNewlyAssigned,
            });
          }
        }
      } catch (err) {
        ExceptionHandler.handleAndThrow(err);
      }
    }

    return {
      success: true,
      code: 'DETAILS_SAVED',
      message: 'Details saved successfully.',
      data: null,
    };
  }

  private async canAssignContact(
    companyId: number,
    productId: number,
    contactId: number,
    isService: boolean,
  ): Promise<boolean> {
    const totalAssigned = await this.contactRepository.countUserProductContacts(
      productId,
      contactId,
      isService,
    );

    const settingValue = await this.userService.getBusinessSetting(
      companyId,
      'assign_contact_user_limit',
    );

    if (settingValue) {
      const availableAssigned = Number(settingValue);
      return availableAssigned > totalAssigned;
    } else {
      return totalAssigned < 1;
    }
  }
}
