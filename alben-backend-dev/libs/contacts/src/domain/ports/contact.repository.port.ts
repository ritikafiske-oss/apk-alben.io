export const CONTACT_REPOSITORY = 'CONTACT_REPOSITORY';

import { Contact } from '../entities/contact.entity';
import { ContactEntity } from '../../infrastructure/persistence/entities/contact.entity';
import { ProductContactEntity } from '../../infrastructure/persistence/entities/product-contact.entity';
import { UserProductContactEntity } from '../../infrastructure/persistence/entities/user-product-contact.entity';
import { ExcludedContact } from '../entities/excluded-contact.entity';
import { ContactStatusRecord } from '../../interfaces/contact-status-record.interface';
import { AttachmentEntity } from '../../infrastructure/persistence/entities/attachment.entity';
import { GetContactsDto } from '../../ui/dtos/get-contacts.dto';
import { CheckContactProductResult } from '../../interfaces/check-contact-product-result.interface';

export interface ContactRepositoryPort {
  findContact(mobile: string, companyId: number): Promise<Contact | null>;
  findExcludedContact(
    mobile: string,
    userId: number,
  ): Promise<ExcludedContact | null>;
  getContacts(
    userId: number,
    targetDial: import('../../ui/dtos/get-contacts.dto').DialTypeEnum,
    dto: GetContactsDto,
  ): Promise<
    import('../../ui/dtos/get-contacts-response.dto').GetContactsResponseDto
  >;

  getContactDetails(
    userId: number,
    dto: import('../../ui/dtos/get-contact-details.dto').GetContactDetailsDto,
  ): Promise<unknown>;
  checkProductExists(
    companyId: number,
    productId: number,
    isService?: boolean,
  ): Promise<boolean>;
  checkContactExists(companyId: number, contactId: number): Promise<boolean>;
  checkContactStatus(companyId: number, statusId: number): Promise<boolean>;
  findContactStatus(
    companyId: number,
    statusId: number,
  ): Promise<ContactStatusRecord | null>;
  findContactStatusesByCompany(companyId: number): Promise<unknown[]>;
  createContact(data: Partial<ContactEntity>): Promise<ContactEntity>;
  createProductContact(
    data: Partial<ProductContactEntity>,
  ): Promise<ProductContactEntity>;
  findProductContact(
    productId: number,
    contactId: number,
    isService?: boolean,
  ): Promise<ProductContactEntity | null>;
  findProductContactById(id: number): Promise<ProductContactEntity | null>;
  updateProductContactStatus(
    id: number,
    statusId: number,
    isHide?: number,
    isService?: boolean,
  ): Promise<void>;
  updateProductContact(
    id: number,
    data: Partial<ProductContactEntity>,
  ): Promise<void>;
  createUserProductContact(
    data: Partial<UserProductContactEntity>,
  ): Promise<UserProductContactEntity>;
  findUserProductContact(
    productId: number,
    contactId: number,
    userId: number,
    isService?: boolean,
  ): Promise<UserProductContactEntity | null>;
  updateUserProductContact(
    id: number,
    data: Partial<UserProductContactEntity>,
  ): Promise<void>;
  deleteUserProductContact(
    productId: number,
    contactId: number,
    userId: number,
    isService?: boolean,
  ): Promise<void>;
  findLastProductContact(
    contactId: number,
  ): Promise<ProductContactEntity | null>;
  findContactById(
    companyId: number,
    contactId: number,
  ): Promise<ContactEntity | null>;
  findContactByIdWithoutCompany(
    contactId: number,
  ): Promise<ContactEntity | null>;
  updateContact(id: number, data: Partial<ContactEntity>): Promise<void>;
  saveAttachment(data: Partial<AttachmentEntity>): Promise<AttachmentEntity>;
  countUserProductContacts(
    productId: number,
    contactId: number,
    isService?: boolean,
  ): Promise<number>;

  getActionDetails(
    userId: number,
    dto: import('../../ui/dtos/get-action-details-query.dto').GetActionDetailsQueryDto,
  ): Promise<
    import('../../ui/dtos/get-contacts-response.dto').GetContactsResponseDto
  >;

  getActionRecents(
    userId: number,
    dto: import('../../ui/dtos/get-action-recents-query.dto').GetActionRecentsQueryDto,
  ): Promise<
    import('../../ui/dtos/get-contacts-response.dto').GetContactsResponseDto
  >;

  findContactProducts(
    contactId: number,
    isVendor: boolean,
    userId: number,
    companyId: number,
  ): Promise<CheckContactProductResult[]>;

  findDepartmentsByService(serviceId: number): Promise<number[]>;
  saveUserProduct(userId: number, productId: number): Promise<void>;
  findUserProductContactsByContact(
    contactId: number,
    userId: number,
  ): Promise<UserProductContactEntity[]>;
}
