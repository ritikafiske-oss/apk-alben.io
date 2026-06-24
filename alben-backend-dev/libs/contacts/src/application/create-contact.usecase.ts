/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
import {
  Inject,
  Injectable,
  BadRequestException,
  forwardRef,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CreateContactRequestDto } from '../ui/dtos/create-contact.dto';
import { CONTACT_REPOSITORY } from '../domain/ports/contact.repository.port';
import { ApiResponse, ExceptionHandler } from '@libs/common';
import type { ContactRepositoryPort } from '../domain/ports/contact.repository.port';
import { UserService } from '@libs/users';
import { ProductService } from '@libs/products';
import { ContactTypeEnum } from '../ui/dtos/get-contacts.dto';
import { ContactStatusRecord } from '../interfaces/contact-status-record.interface';

@Injectable()
export class CreateContactUseCase {
  constructor(
    @Inject(CONTACT_REPOSITORY)
    private readonly contactRepository: ContactRepositoryPort,
    private readonly dataSource: DataSource,
    private readonly userService: UserService,
    @Inject(forwardRef(() => ProductService))
    private readonly productService: ProductService,
  ) {}

  async execute(
    userId: number,
    dto: CreateContactRequestDto,
  ): Promise<ApiResponse<unknown>> {
    const { reference_by_contact_id, company_id, contacts } = dto;

    // 1. Verify User Company
    const userCompany = await this.userService.validateUserCompany(
      userId,
      company_id,
    );

    // 2. Reference Contact Check
    if (reference_by_contact_id) {
      const checkContact = await this.contactRepository.checkContactExists(
        company_id,
        reference_by_contact_id,
      );
      if (!checkContact) {
        throw new BadRequestException({
          success: false,
          code: 'INVALID_REFERENCE_CONTACT',
          message: 'Invalid reference contact',
          data: {},
        });
      }
    }

    let details: unknown = null;
    const isImported = contacts.length > 1;

    const isManualdial = [
      'field_agent',
      'all_in_one',
      'contact_handler',
    ].includes(userCompany.role);
    const isAutodial = userCompany.role === 'telecaller';

    // Fetch contact statuses for bulk operations memory optimization
    let contactStatusesMap: Record<number, unknown> = {};
    if (isImported) {
      const statuses: unknown[] =
        await this.contactRepository.findContactStatusesByCompany(company_id);
      contactStatusesMap = statuses.reduce(
        (acc: Record<number, unknown>, status: unknown) => {
          if (status && typeof status === 'object' && 'id' in status) {
            acc[status.id as number] = status;
          }
          return acc;
        },
        {} as Record<number, unknown>,
      ) as Record<number, unknown>;
    }

    const batchSize = isImported ? 100 : 1;
    const contactBatches = this.chunkArray(contacts, batchSize);

    for (const batch of contactBatches) {
      try {
        for (const contact of batch) {
          const statusId = contact.status_id;
          const productId = contact.product_id;
          const contactType = contact.contact_type || ContactTypeEnum.CLIENT;

          if (productId) {
            await this.productService.validateProductCompany(
              productId,
              company_id,
              (contactType as ContactTypeEnum) === ContactTypeEnum.VENDOR,
            );
          }

          let contactStatus: ContactStatusRecord | null = null;
          if (isImported && statusId) {
            contactStatus = contactStatusesMap[statusId] as ContactStatusRecord;
            if (!contactStatus) continue;
          } else if (!isImported && statusId) {
            contactStatus = await this.contactRepository.findContactStatus(
              company_id,
              statusId,
            );
            if (!contactStatus) continue;
          }

          const isUnassigned =
            contactStatus && contactStatus.is_unassigned ? 1 : 0;
          const mobile = contact.mobile || '';
          let alternateNumbersStr: string | null = null;

          if (contact.alternate_number) {
            const alternateNumberArray = contact.alternate_number
              .split(',')
              .filter((n) => n.length === 10 && !isNaN(Number(n)));
            if (alternateNumberArray.includes(mobile)) {
              if (isImported) continue;
              throw new BadRequestException({
                success: false,
                code: 'MOBILE_AND_ALTERNATE_SAME',
                message:
                  'Mobile number and alternate number should not be the same.',
                data: {},
              });
            }
            alternateNumbersStr =
              alternateNumberArray.length > 0
                ? alternateNumberArray.join(',')
                : null;

            if (alternateNumbersStr) {
              const isDuplicateAlt =
                await this.isDuplicateMobileAndAlternateNumber(
                  company_id,
                  mobile,
                  alternateNumberArray,
                );
              if (isDuplicateAlt) alternateNumbersStr = null;
            }
          }

          if (
            mobile &&
            mobile.length === 10 &&
            !isNaN(Number(mobile)) &&
            contact.firstname
          ) {
            const existingContact = await this.contactRepository.findContact(
              mobile,
              company_id,
            );

            if (!existingContact) {
              const isDuplicateMobile =
                await this.isDuplicateMobileAndAlternateNumber(
                  company_id,
                  mobile,
                  [],
                );
              if (isDuplicateMobile) {
                if (isImported) continue;
                throw new BadRequestException({
                  success: false,
                  code: 'MOBILE_ALREADY_EXISTS',
                  message: 'This mobile number is already registered.',
                  data: {},
                });
              }

              const newContact = await this.contactRepository.createContact({
                mobile,
                firstname: contact.firstname,
                lastname: contact.lastname,
                alternateNumber: alternateNumbersStr,
                businessName: contact.business_name,
                designation: contact.designation,
                email: contact.email,
                contactType,
                companyId: company_id,
                createdBy: userId,
                referenceByContactId: reference_by_contact_id || null,
              });

              if (contactType !== 'colleague' && productId) {
                await this.contactRepository.createProductContact({
                  productId,
                  contactId: newContact.id,
                  contactStatusId: statusId,
                  isService: contactType === 'vendor',
                });

                if (!isUnassigned) {
                  await this.contactRepository.createUserProductContact({
                    productId,
                    contactId: newContact.id,
                    userId,
                    isService: contactType === 'vendor',
                    isManualdial,
                    isAutodial,
                  });
                }

                if (contactType === 'vendor') {
                  const departments =
                    await this.contactRepository.findDepartmentsByService(
                      productId,
                    );
                  for (const deptId of departments) {
                    await this.contactRepository.saveUserProduct(
                      userId,
                      deptId,
                    );
                  }
                }
              }

              if (!isImported) {
                details = {
                  id: newContact.id,
                  firstname: newContact.firstname,
                  lastname: newContact.lastname || null,
                  alternate_number: newContact.alternateNumber || null,
                  business_name: newContact.businessName || null,
                  designation: newContact.designation || null,
                  email: newContact.email || null,
                  product_id: productId ? String(productId) : null,
                  status_id: statusId || null,
                  contact_type: newContact.contactType,
                  mobile: newContact.mobile,
                };
              }
            } else {
              // Existing contact logic
              let handled = false;
              if (
                (existingContact.contactType === 'client' ||
                  existingContact.contactType === 'vendor') &&
                existingContact.contactType === contactType &&
                productId
              ) {
                const isService = contactType === 'vendor';
                let productContact =
                  await this.contactRepository.findProductContact(
                    productId,
                    existingContact.id,
                    isService,
                  );

                if (!productContact) {
                  productContact =
                    await this.contactRepository.createProductContact({
                      productId,
                      contactId: existingContact.id,
                      contactStatusId: statusId,
                      isService: isService,
                    });
                } else {
                  if (!isImported) {
                    throw new BadRequestException({
                      success: false,
                      code: 'CONTACT_ALREADY_ADDED',
                      message:
                        'This contact has already been added to your business.',
                      data: { id: existingContact.id },
                    });
                  }
                }

                const limitReached = await this.isAssignContactLimitReached(
                  productContact,
                  company_id,
                  isService,
                );
                if (!limitReached && !isImported) {
                  throw new BadRequestException({
                    success: false,
                    code: 'CONTACT_ALREADY_ADDED',
                    message:
                      'This contact has already been added to your business.',
                    data: { id: existingContact.id },
                  });
                } else if (!limitReached && isImported) {
                  continue;
                }

                const userProductContact =
                  await this.contactRepository.findUserProductContact(
                    productId,
                    existingContact.id,
                    userId,
                    isService,
                  );

                if (!userProductContact && !isUnassigned) {
                  await this.contactRepository.createUserProductContact({
                    productId,
                    contactId: existingContact.id,
                    userId,
                    isService: isService,
                    isManualdial,
                    isAutodial,
                  });
                }

                if (contactType === 'vendor') {
                  const departments =
                    await this.contactRepository.findDepartmentsByService(
                      productId,
                    );
                  for (const deptId of departments) {
                    await this.contactRepository.saveUserProduct(
                      userId,
                      deptId,
                    );
                  }
                }

                if (!isImported) {
                  details = {
                    id: existingContact.id,
                    firstname: existingContact.firstname,
                    lastname: existingContact.lastname || null,
                    alternate_number: existingContact.alternateNumber || null,
                    business_name: existingContact.businessName || null,
                    designation: existingContact.designation || null,
                    email: existingContact.email || null,
                    product_id: productId ? String(productId) : null,
                    status_id: statusId || null,
                    contact_type: existingContact.contactType,
                    mobile: existingContact.mobile,
                  };
                }
                handled = true;
              }

              if (
                (existingContact.contactType === 'client' ||
                  existingContact.contactType === 'vendor') &&
                existingContact.contactType === contactType
              ) {
                if (productId) {
                  const isService = contactType === 'vendor';
                  const pc = await this.contactRepository.findProductContact(
                    productId,
                    existingContact.id,
                    isService,
                  );
                  if (pc && statusId) {
                    await this.contactRepository.updateProductContactStatus(
                      pc.id,
                      statusId,
                      undefined,
                      contactType === 'vendor',
                    );
                  }
                }
                handled = true;
              }

              if (!handled && !isImported) {
                throw new BadRequestException({
                  success: false,
                  code: 'CONTACT_ALREADY_EXISTS',
                  message: 'Contact is already present',
                  data: { id: existingContact.id },
                });
              }
            }
          }
          await this.delay(isImported ? 50 : 300);
        }
      } catch (error) {
        ExceptionHandler.handleAndThrow(error);
      }
    }

    return {
      success: true,
      code: 'CONTACT_SAVED_SUCCESSFULLY',
      message: 'Contact saved successfully.',
      data: details,
    };
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunked_arr: T[][] = [];
    let index = 0;
    while (index < array.length) {
      chunked_arr.push(array.slice(index, size + index));
      index += size;
    }
    return chunked_arr;
  }

  private delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private async isDuplicateMobileAndAlternateNumber(
    companyId: number,
    mobile: string,
    alternateNumbers: string[],
  ): Promise<boolean> {
    // Check alternate array unique
    if (new Set(alternateNumbers).size !== alternateNumbers.length) {
      return true;
    }

    if (alternateNumbers.includes(mobile)) {
      return true;
    }

    const res = await this.dataSource.query(
      'SELECT id FROM contacts WHERE company_id = ? AND mobile = ? LIMIT 1',
      [companyId, mobile],
    );

    return res.length > 0;
  }

  private async isAssignContactLimitReached(
    productContact: { contactId: number; productId: number },
    companyId: number,
    isService: boolean,
  ): Promise<boolean> {
    const totalAssignedRes = await this.dataSource.query(
      'SELECT count(id) as c FROM user_product_contacts WHERE contact_id = ? AND product_id = ? AND is_service = ?',
      [productContact.contactId, productContact.productId, isService ? 1 : 0],
    );
    const totalAssigned = Number(totalAssignedRes[0]?.c || 0);

    const settingRes = await this.dataSource.query(
      'SELECT value FROM business_settings WHERE company_id = ? AND `key` = ? LIMIT 1',
      [companyId, 'assign_contact_user_limit'],
    );
    const setting = settingRes[0];

    if (setting) {
      const availableAssigned = Number(setting.value);
      return availableAssigned > totalAssigned;
    } else {
      return totalAssigned < 1;
    }
  }
}
