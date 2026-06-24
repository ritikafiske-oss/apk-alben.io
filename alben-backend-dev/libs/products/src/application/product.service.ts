import {
  Injectable,
  Inject,
  BadRequestException,
  forwardRef,
} from '@nestjs/common';
import { PRODUCT_REPOSITORY } from '../domain/ports/product.repository.port';
import type { ProductRepositoryPort } from '../domain/ports/product.repository.port';
import { CONTACT_REPOSITORY } from '@libs/contacts';
import type { ContactRepositoryPort } from '@libs/contacts';
import { CONTACT_STATUS_REPOSITORY } from '@libs/contact-status';
import type { ContactStatusRepositoryPort } from '@libs/contact-status';
import { ApiResponse } from '@libs/common';
import { ContactTypeEnum } from '@libs/contacts';
import { UserService } from '@libs/users';

@Injectable()
export class ProductService {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepo: ProductRepositoryPort,
    private readonly userService: UserService,
    @Inject(forwardRef(() => CONTACT_REPOSITORY))
    private readonly contactRepo: ContactRepositoryPort,
    @Inject(CONTACT_STATUS_REPOSITORY)
    private readonly contactStatusRepo: ContactStatusRepositoryPort,
  ) {}

  async getUserProducts(
    userId: number,
    companyId: number,
  ): Promise<ApiResponse<unknown[]>> {
    await this.userService.validateUserCompany(userId, companyId);

    const products = await this.productRepo.findUserProducts(userId, companyId);

    if (products.length > 0) {
      return {
        success: true,
        code: 'DATA_FETCHED',
        message: 'Data fetched successfully.',
        data: products,
      };
    }

    throw new BadRequestException({
      success: false,
      code: 'NO_PRODUCT_ASSIGNED',
      message:
        "You haven't assigned any product. At least one product must be assigned to you.",
      data: {},
    });
  }

  async getContactStatusByProduct(
    userId: number,
    companyId: number,
    productId: number,
    mobile: string,
  ): Promise<ApiResponse<unknown>> {
    // Check Company
    await this.userService.validateUserCompany(userId, companyId);

    // Find Contact
    const contact = await this.contactRepo.findContact(mobile, companyId);

    const isService = contact
      ? (contact.contactType as ContactTypeEnum) === ContactTypeEnum.VENDOR
      : false;

    // Check Product or Service
    await this.validateProductCompany(productId, companyId, isService);

    let response: {
      id: number;
      name: string;
      color_code: string | null;
      product_contact_id: number;
    } | null = null;

    if (contact) {
      // Find ProductContact
      const productContact = await this.contactRepo.findProductContact(
        productId,
        contact.id,
        isService,
      );

      if (productContact && productContact.contactStatusId) {
        const status = await this.contactStatusRepo.findContactStatusById(
          productContact.contactStatusId,
        );
        if (status) {
          response = {
            id: status.id, // This is Status ID
            name: status.name,
            color_code: status.colorCode,
            product_contact_id: productContact.id, // Added for update endpoint
          };
        }
      }
    }

    return {
      success: true,
      code: 'DATA_FETCHED',
      message: 'Data fetched successfully.',
      data: response,
    };
  }

  async updateProductContactStatus(
    userId: number,
    companyId: number,
    productContactId: number,
    statusId: number,
  ): Promise<ApiResponse<null>> {
    // Check Company logic is implicit by validating entities belonging to companyId,
    // but we should validate user access to company first
    await this.userService.validateUserCompany(userId, companyId);

    // Check Contact Status
    const status = await this.contactStatusRepo.findContactStatusById(statusId);
    if (!status || status.companyId !== companyId) {
      throw new BadRequestException({
        success: false,
        code: 'INVALID_STATUS',
        message: 'Invalid status.',
        data: {},
      });
    }

    // Find Product Contact
    const productContact =
      await this.contactRepo.findProductContactById(productContactId);

    if (!productContact) {
      throw new BadRequestException({
        success: false,
        code: 'CONTACT_NOT_ASSIGNED',
        message: 'Contact not assigned to you.',
        data: {},
      });
    }

    // Update Status
    await this.contactRepo.updateProductContactStatus(
      productContactId,
      statusId,
    );

    return {
      success: true,
      code: 'PRODUCT_STATUS_UPDATED',
      data: null,
      message: 'Status updated successfully.',
    };
  }

  /**
   * Centralized Product Validation
   *
   * Validates if a product belongs to the specified company.
   * Throws BadRequestException directly if validation fails.
   *
   * @param productId - Product's ID
   * @param companyId - Company's ID
   * @throws BadRequestException { code: 'INVALID_PRODUCT' }
   */
  async validateProductCompany(
    productId: number,
    companyId: number,
    isService = false,
  ): Promise<void> {
    const productExists = await this.contactRepo.checkProductExists(
      companyId,
      productId,
      isService,
    );
    if (!productExists) {
      throw new BadRequestException({
        success: false,
        code: 'INVALID_PRODUCT',
        message: 'Invalid product.',
        data: {},
      });
    }
  }
}
