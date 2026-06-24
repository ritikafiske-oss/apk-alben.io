import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { ApiResponse } from '@libs/common';
import { NotesService } from '@libs/notes';
import { ToggleImportanceDto } from '../../ui/dtos/notes/toggle-importance.dto';

@Injectable()
export class ToggleNoteImportanceUseCase {
  constructor(
    @Inject(forwardRef(() => NotesService))
    private readonly notesService: NotesService,
  ) {}

  async execute(
    userId: number,
    dto: ToggleImportanceDto,
  ): Promise<ApiResponse<unknown>> {
    const { note_id, action } = dto;

    const result = await this.notesService.toggleImportance(
      userId,
      note_id,
      action,
    );

    let message = '';
    if (result === 'ALREADY_IMPORTANT') {
      return {
        success: true,
        code: 'NOTE_ALREADY_IMPORTANT',
        message: 'Note already marked as important.',
        data: null,
      };
    }

    message =
      action === 'add'
        ? 'Note marked as important.'
        : 'Note removed from important.';

    return {
      success: true,
      code: 'NOTE_IMPORTANCE_TOGGLED',
      message,
      data: null,
    };
  }
}
