import {
  Injectable,
  NotFoundException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { ApiResponse, DateUtil, DynamicLoggerService } from '@libs/common';
import { NotesService } from '@libs/notes';
import { UpdateNoteDto } from '../../ui/dtos/notes/update-note.dto';

@Injectable()
export class UpdateNoteUseCase {
  constructor(
    @Inject(forwardRef(() => NotesService))
    private readonly notesService: NotesService,
    private readonly logger: DynamicLoggerService,
  ) {}

  async execute(
    userId: number,
    noteId: number,
    dto: UpdateNoteDto,
  ): Promise<ApiResponse<unknown>> {
    const note = await this.notesService.findNoteById(noteId);
    if (!note) {
      throw new NotFoundException('Note not found.');
    }

    await this.notesService.updateNote(noteId, {
      description: dto.description,
      reminderDatetime: (() => {
        const after = dto.reminder_datetime
          ? DateUtil.getDateTimeAccordingTimezone(
              dto.reminder_datetime,
              'Asia/Kolkata',
              'UTC',
            )
          : null;
        if (dto.reminder_datetime !== undefined) {
          this.logger.log({
            message: 'Note Reminder Datetime Conversion (Update)',
            before: note.reminderDatetime,
            after: after,
            noteId: noteId,
            userId,
          });
        }
        return after;
      })(),
      forNote: dto.for_note,
    });

    return {
      success: true,
      code: 'NOTE_UPDATED',
      message: dto.reminder_datetime
        ? 'Reminder set successfully.'
        : 'Note updated successfully.',
      data: null,
    };
  }
}
