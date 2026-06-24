import { Injectable } from '@nestjs/common';
import { ApiResponse, DateUtil } from '@libs/common';
import { UserService } from '@libs/users';
import { GetReminderNotesDto } from '../../ui/dtos/notes/get-reminder-notes.dto';
import { ContactNoteRepository } from '../../infrastructure/persistence/repositories/contact-note.repository';
import { NoteEntity } from '@libs/notes';
import {
  ContactStatusObj,
  ContactObj,
  ProductObj,
  CreatedByObj,
  NoteContactRaw,
} from '../../interfaces/notes/note-response.interface';

type JoinedNote = NoteEntity & {
  contact: NoteContactRaw;
  product: ProductObj;
  createdBy: CreatedByObj;
};

@Injectable()
export class GetReminderNotesUseCase {
  constructor(
    private readonly contactNoteRepo: ContactNoteRepository,
    private readonly userService: UserService,
  ) {}

  async execute(
    userId: number,
    dto: GetReminderNotesDto,
  ): Promise<ApiResponse<unknown>> {
    await this.userService.validateUserCompany(userId, dto.company_id);

    const { notes, total } = (await this.contactNoteRepo.findReminderNotes(
      userId,
      dto.company_id,
      {
        productId: dto.product_id,
        type: dto.type,
        filterBy: dto.filter_by,
        contactType: dto.contact_type,
        page: dto.page,
        limit: dto.limit,
      },
    )) as { notes: JoinedNote[]; total: number };

    const formatDateTime = (date: Date) => {
      if (!date) return null;
      return DateUtil.getDateTimeAccordingTimezone(
        date,
        'UTC',
        'Asia/Kolkata',
        'YYYY-MM-DD HH:mm:ss',
      );
    };

    const result = notes.map((note) => {
      let contactStatus: ContactStatusObj | null = null;
      let contactObj: ContactObj | null = null;
      let productObj: ProductObj | null = null;
      let createdByObj: CreatedByObj | null = null;

      const nContact = note.contact as NoteContactRaw | undefined;
      const nProduct = note.product as ProductObj | undefined;
      const nCreatedBy = note.createdBy as CreatedByObj | undefined;

      if (nContact) {
        if (
          nContact.contactType !== 'colleague' &&
          nContact.productContacts &&
          nContact.productContacts.length > 0
        ) {
          const rawStatus = nContact.productContacts[0].contactStatus;
          if (rawStatus) {
            contactStatus = {
              id: rawStatus.id,
              name: rawStatus.name,
              color_code: rawStatus.colorCode,
            };
          }
        }

        contactObj = {
          id: nContact.id,
          firstname: nContact.firstname,
          lastname: nContact.lastname,
          mobile: nContact.mobile,
          business_name: nContact.businessName,
          designation: nContact.designation,
          email: nContact.email,
          contact_type: nContact.contactType,
        };
      }

      if (nProduct) {
        productObj = {
          id: nProduct.id,
          name: nProduct.name,
        };
      }

      if (nCreatedBy) {
        createdByObj = {
          id: nCreatedBy.id,
          firstname: nCreatedBy.firstname,
          lastname: nCreatedBy.lastname,
        };
      }

      return {
        id: note.id,
        description: note.description,
        reminder_datetime: note.reminderDatetime
          ? formatDateTime(note.reminderDatetime)
          : null,
        created_at: formatDateTime(note.createdAt),
        contact_id: note.contactId,
        product_id: note.productId,
        user_id: note.userId,
        for_note: note.forNote,
        contact_status: contactStatus,
        contact: contactObj,
        product: productObj,
        created_by: createdByObj,
      };
    });

    return {
      success: true,
      code: 'DATA_FETCHED',
      message: 'Data fetched successfully.',
      data: {
        type: dto.type,
        current_page: dto.page,
        total_pages: Math.ceil(total / dto.limit),
        total_items: total,
        records: result,
      },
    };
  }
}
