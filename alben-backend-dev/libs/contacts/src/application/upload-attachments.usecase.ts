import {
  Injectable,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { CONTACT_REPOSITORY } from '../domain/ports/contact.repository.port';
import type { ContactRepositoryPort } from '../domain/ports/contact.repository.port';
import { UploadAttachmentsDto } from '../ui/dtos/upload-attachments.dto';
import { Connection } from 'typeorm';
import { InjectConnection } from '@nestjs/typeorm';
import { AttachmentDetail } from '../interfaces/attachment.interface';
import { ApiResponse } from '@libs/common';
import { ProductService } from '@libs/products';
import { ContactTypeEnum } from '../ui/dtos/get-contacts.dto';

@Injectable()
export class UploadAttachmentsUseCase {
  constructor(
    @Inject(CONTACT_REPOSITORY)
    private readonly contactRepository: ContactRepositoryPort,
    @InjectConnection() private readonly connection: Connection,
    @Inject(forwardRef(() => ProductService))
    private readonly productService: ProductService,
  ) {}

  async execute(
    userId: number,
    dto: UploadAttachmentsDto,
  ): Promise<ApiResponse<unknown>> {
    const { contact_id, product_id, attachments } = dto;

    if (!attachments || attachments.length === 0) {
      throw new BadRequestException({
        success: false,
        code: 'ATTACHMENTS_REQUIRED',
        message: 'attachments are required.',
      });
    }

    const contact =
      await this.contactRepository.findContactByIdWithoutCompany(contact_id);

    if (!contact) {
      throw new BadRequestException({
        success: false,
        code: 'CONTACT_NOT_FOUND',
        message: 'Contact not found.',
        data: {},
      });
    }

    const companyId = Number(contact.companyId);
    const finalProductId =
      (contact.contactType as ContactTypeEnum) === ContactTypeEnum.COLLEAGUE
        ? null
        : product_id;

    if (finalProductId) {
      await this.productService.validateProductCompany(
        finalProductId,
        companyId,
        (contact.contactType as ContactTypeEnum) === ContactTypeEnum.VENDOR,
      );
    }

    let lastAttachment: AttachmentDetail | null = null;

    for (const item of attachments) {
      const saved = await this.contactRepository.saveAttachment({
        contactId: contact_id.toString(),
        productId: finalProductId ? finalProductId.toString() : null,
        userId: userId.toString(),
        url: item.url,
        title: item.filename,
      });
      lastAttachment = {
        id: Number(saved.id),
        title: saved.title ?? '',
        url: saved.url ?? '',
        contactId: saved.contactId ?? '',
        productId: saved.productId ?? null,
        userId: saved.userId ?? '',
        createdAt: saved.createdAt
          ? saved.createdAt.toString()
          : new Date().toISOString(),
      };
    }

    if (!lastAttachment) {
      throw new BadRequestException({
        success: false,
        code: 'FAILED_TO_PROCESS_ATTACHMENTS',
        message: 'Failed to process attachments.',
      });
    }

    const responseData = {
      contact_id: lastAttachment.contactId,
      product_id: lastAttachment.productId,
      user_id: Number(lastAttachment.userId),
      url: lastAttachment.url,
      title: lastAttachment.title,
      created_at: lastAttachment.createdAt,
      id: Number(lastAttachment.id),
    };

    return {
      success: true,
      code: 'ATTACHMENT_UPLOADED_SUCCESSFULLY',
      message: 'Attachment uploaded successfully.',
      data: responseData,
    };
  }
}
