import {
  Injectable,
  Inject,
  BadRequestException,
  forwardRef,
} from '@nestjs/common';
import { CONTACT_REPOSITORY } from '../domain/ports/contact.repository.port';
import type { ContactRepositoryPort } from '../domain/ports/contact.repository.port';
import { ApiResponse } from '@libs/common';
import { UserService } from '@libs/users';
import { ProductService } from '@libs/products';

import { CheckContactDto } from '../ui/dtos/check-contact.dto';
import {
  GetContactsDto,
  ContactTypeEnum,
  DialTypeEnum,
} from '../ui/dtos/get-contacts.dto';
import { GetContactsResponseDto } from '../ui/dtos/get-contacts-response.dto';
import { Contact } from '../domain/entities/contact.entity';
import { ExcludedContact } from '../domain/entities/excluded-contact.entity';
import { GetContactDetailsDto } from '../ui/dtos/get-contact-details.dto';

@Injectable()
export class ContactService {
  constructor(
    @Inject(CONTACT_REPOSITORY)
    private readonly contactRepo: ContactRepositoryPort,
    private readonly userService: UserService,
    @Inject(forwardRef(() => ProductService))
    private readonly productService: ProductService,
  ) {}

  async checkContact(
    userId: number,
    dto: CheckContactDto,
  ): Promise<ApiResponse<unknown>> {
    // 1. Validate Company
    await this.userService.validateUserCompany(userId, dto.company_id);

    let contact: Contact | null = null;
    let excludedContact: ExcludedContact | null = null;

    // 2. Find Contact in Company
    // Logic: Search by mobile in contacts table for this company
    contact = await this.contactRepo.findContact(dto.mobile, dto.company_id);

    if (contact) {
      const isVendor =
        (contact.contactType as ContactTypeEnum) === ContactTypeEnum.VENDOR;
      const products = await this.contactRepo.findContactProducts(
        contact.id,
        isVendor,
        userId,
        dto.company_id,
      );

      return {
        success: true,
        code: 'DATA_FETCHED',
        message: 'Data fetched successfully.',
        data: {
          contact_exists: true,
          contact: contact,
          products: products,
        },
      };
    }

    // Check excluded_contacts table
    excludedContact = await this.contactRepo.findExcludedContact(
      dto.mobile,
      userId,
    );

    if (excludedContact) {
      return {
        success: true,
        code: 'CONTACT_FOUND_IN_EXCLUDED_LIST',
        message: 'Contact Found in Excluded List.',
        data: {
          contact_exists: false,
          excluded_contact: excludedContact,
          is_excluded: true,
        },
      };
    }

    return {
      success: true,
      code: 'CONTACT_NOT_FOUND',
      message: 'Contact does not exist.',
      data: {
        contact_exists: false,
      },
    };
  }

  async getContacts(
    userId: number,
    dto: GetContactsDto,
  ): Promise<ApiResponse<GetContactsResponseDto>> {
    const { company_id, type, dial } = dto;

    // 1. Validate Company
    const userCompany = await this.userService.validateUserCompany(
      userId,
      company_id,
    );

    let targetDial = dial ?? DialTypeEnum.MANUALDIAL;
    if (targetDial !== DialTypeEnum.ALL && type) {
      targetDial =
        type === ContactTypeEnum.CLIENT ? targetDial : DialTypeEnum.MANUALDIAL;
    }

    // Role specific dial rewrite
    if (
      userCompany &&
      ['telecaller', 'field_agent'].includes(userCompany.role) &&
      (!type || type === ContactTypeEnum.CLIENT)
    ) {
      targetDial =
        userCompany.role === 'telecaller'
          ? DialTypeEnum.AUTODIAL
          : DialTypeEnum.MANUALDIAL;
    }

    if (userCompany && ['telecaller'].includes(userCompany.role)) {
      targetDial = DialTypeEnum.AUTODIAL;
    }

    const responseData = await this.contactRepo.getContacts(
      userId,
      targetDial,
      dto,
    );

    return {
      success: true,
      code: 'DATA_FETCHED',
      message: 'Data fetched successfully.',
      data: responseData,
    };
  }

  async getContactDetails(
    userId: number,
    dto: GetContactDetailsDto,
  ): Promise<ApiResponse<unknown>> {
    const { company_id, contact_id, product_id, type } = dto;

    // Contact Type Logic
    const contactType = type ?? ContactTypeEnum.CLIENT;
    const finalProductId =
      contactType === ContactTypeEnum.COLLEAGUE ? undefined : product_id;

    if (!(await this.contactRepo.checkContactExists(company_id, contact_id))) {
      throw new BadRequestException({
        success: false,
        code: 'INVALID_CONTACT',
        message: 'Invalid contact.',
        data: {},
      });
    }

    if (finalProductId) {
      await this.productService.validateProductCompany(
        finalProductId,
        company_id,
        contactType === ContactTypeEnum.VENDOR,
      );
    }

    const responseData = await this.contactRepo.getContactDetails(userId, {
      ...dto,
      type: contactType,
      product_id: finalProductId,
    });

    if (!responseData) {
      throw new BadRequestException({
        success: false,
        code: 'CONTACT_NOT_FOUND',
        message: 'Contact not found.',
        data: {},
      });
    }

    return {
      success: true,
      code: 'DATA_FETCHED',
      message: 'Data fetched successfully.',
      data: responseData,
    };
  }
}
