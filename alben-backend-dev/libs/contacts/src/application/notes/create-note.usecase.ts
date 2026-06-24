import {
  Injectable,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { ApiResponse, DateUtil, DynamicLoggerService } from '@libs/common';
import { UserService } from '@libs/users';
import { ProductService } from '@libs/products';
import { CONTACT_REPOSITORY } from '../../domain/ports/contact.repository.port';
import type { ContactRepositoryPort } from '../../domain/ports/contact.repository.port';
import { NotesService } from '@libs/notes';
import { CreateNoteDto } from '../../ui/dtos/notes/create-note.dto';
import { ContactTypeEnum } from '../../ui/dtos/get-contacts.dto';

@Injectable()
export class CreateNoteUseCase {
  constructor(
    @Inject(forwardRef(() => NotesService))
    private readonly notesService: NotesService,
    private readonly userService: UserService,
    @Inject(forwardRef(() => ProductService))
    private readonly productService: ProductService,
    @Inject(CONTACT_REPOSITORY)
    private readonly contactRepo: ContactRepositoryPort,
    private readonly logger: DynamicLoggerService,
  ) {}

  async execute(
    userId: number,
    dto: CreateNoteDto,
  ): Promise<ApiResponse<unknown>> {
    // 1. Validate Company
    await this.userService.validateUserCompany(userId, dto.company_id);

    // 2. Find Contact
    const contact = await this.contactRepo.findContact(
      dto.mobile,
      dto.company_id,
    );
    if (!contact) {
      throw new BadRequestException({
        success: false,
        code: 'CONTACT_NOT_FOUND',
        message: 'Contact not found.',
        data: {},
      });
    }

    // 3. Logic: If colleague, productId is null
    const contactType = contact.contactType;
    let productId = dto.product_id;
    if ((contactType as ContactTypeEnum) === ContactTypeEnum.COLLEAGUE) {
      productId = null;
    }

    // 4. Validate Product if exists
    if (productId) {
      await this.productService.validateProductCompany(
        productId,
        dto.company_id,
        (contact.contactType as ContactTypeEnum) === ContactTypeEnum.VENDOR,
      );
    }

    // 5. Timezone Conversion (Using DateUtil)
    const createdAtUtc = DateUtil.getDateTimeAccordingTimezone(
      dto.created_at,
      'Asia/Kolkata',
      'UTC',
    );

    // 6. Create Note via simplified NotesService
    await this.notesService.createNote({
      description: dto.description,
      reminderDatetime: (() => {
        const after = dto.reminder_datetime
          ? DateUtil.getDateTimeAccordingTimezone(
              dto.reminder_datetime,
              'Asia/Kolkata',
              'UTC',
            )
          : null;
        if (dto.reminder_datetime) {
          this.logger.log({
            message: 'Note Reminder Datetime Conversion (Create)',
            before: dto.reminder_datetime,
            after: after,
            mobile: dto.mobile,
            userId,
          });
        }
        return after;
      })(),
      contactId: contact.id,
      productId: productId ?? null,
      userId: userId,
      forNote: dto.for_note,
      createdAt: createdAtUtc,
      isReminderSent: false,
    });

    return {
      success: true,
      code: 'NOTE_CREATED',
      message: dto.reminder_datetime
        ? 'Reminder set successfully.'
        : 'Note created successfully.',
      data: null,
    };
  }
}
