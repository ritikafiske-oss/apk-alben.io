import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContactsController } from './ui/contacts.controller';
import { ContactService } from './application/contact.service';
import { CreateContactUseCase } from './application/create-contact.usecase';
import { UpdateContactUseCase } from './application/update-contact.usecase';
import { SaveBulkCallLogUseCase } from './application/save-bulk-call-log.usecase';
import { ContactRepository } from './infrastructure/persistence/repositories/contact.repository';
import { CONTACT_REPOSITORY } from './domain/ports/contact.repository.port';
import { ContactEntity } from './infrastructure/persistence/entities/contact.entity';
import { UsersModule, UserEntity } from '@libs/users';
import { ContactStatusModule } from '@libs/contact-status';
import { ExcludedContactEntity } from './infrastructure/persistence/entities/excluded-contact.entity';
import { ProductContactEntity } from './infrastructure/persistence/entities/product-contact.entity';
import { UserProductContactEntity } from './infrastructure/persistence/entities/user-product-contact.entity';
import { AttachmentEntity } from './infrastructure/persistence/entities/attachment.entity';
import { CallLogEntity } from './infrastructure/persistence/entities/call-log.entity';
import { CallLogProductDetailEntity } from './infrastructure/persistence/entities/call-log-product-detail.entity';
import { CallLogRepository } from './infrastructure/persistence/repositories/call-log.repository';
import {
  GetCallLogsUseCase,
  CALL_LOG_REPOSITORY,
} from './application/get-call-logs.usecase';
import { UploadAttachmentsUseCase } from './application/upload-attachments.usecase';
import { StorageModule } from '@libs/storage';
import { ProductsModule } from '@libs/products';
import { NotesModule, NoteEntity } from '@libs/notes';
import { ContactNotesController } from './ui/contact-notes.controller';
import { GetReminderNotesUseCase } from './application/notes/get-reminder-notes.usecase';
import { GetContactCountsUseCase } from './application/get-contact-counts.usecase';
import { CreateNoteUseCase } from './application/notes/create-note.usecase';
import { UpdateNoteUseCase } from './application/notes/update-note.usecase';
import { ToggleNoteImportanceUseCase } from './application/notes/toggle-note-importance.usecase';
import { SaveCallLogDetailsUseCase } from './application/save-call-log-details.usecase';
import { UpdateCallLogRecordingUseCase } from './application/update-call-log-recording.usecase';
import { ContactNoteRepository } from './infrastructure/persistence/repositories/contact-note.repository';
import { GetActionDetailsUseCase } from './application/get-action-details.usecase';
import { GetActionRecentsUseCase } from './application/get-action-recents.usecase';
import { MarkMyPlanUseCase } from './application/mark-my-plan.usecase';
import { UnmarkMyPlanUseCase } from './application/unmark-my-plan.usecase';

@Module({
  imports: [
    StorageModule,
    TypeOrmModule.forFeature([
      ContactEntity,
      ExcludedContactEntity,
      ProductContactEntity,
      UserProductContactEntity,
      AttachmentEntity,
      CallLogEntity,
      CallLogProductDetailEntity,
      NoteEntity,
      UserEntity,
    ]),
    UsersModule,
    ContactStatusModule,
    forwardRef(() => ProductsModule),
    forwardRef(() => NotesModule),
  ],
  controllers: [ContactsController, ContactNotesController],
  providers: [
    ContactService,
    CreateContactUseCase,
    UpdateContactUseCase,
    SaveBulkCallLogUseCase,
    {
      provide: CONTACT_REPOSITORY,
      useClass: ContactRepository,
    },
    {
      provide: CALL_LOG_REPOSITORY,
      useClass: CallLogRepository,
    },
    GetCallLogsUseCase,
    GetContactCountsUseCase,
    UploadAttachmentsUseCase,
    GetReminderNotesUseCase,
    CreateNoteUseCase,
    UpdateNoteUseCase,
    ToggleNoteImportanceUseCase,
    SaveCallLogDetailsUseCase,
    UpdateCallLogRecordingUseCase,
    GetActionDetailsUseCase,
    GetActionRecentsUseCase,
    MarkMyPlanUseCase,
    UnmarkMyPlanUseCase,
    ContactNoteRepository,
  ],

  exports: [CONTACT_REPOSITORY, CALL_LOG_REPOSITORY, ContactService],
})
export class ContactsModule {}
