import { PartialType, PickType } from '@nestjs/swagger';
import { CreateNoteDto } from './create-note.dto';

export class UpdateNoteDto extends PartialType(
  PickType(CreateNoteDto, [
    'company_id',
    'description',
    'reminder_datetime',
    'for_note',
  ] as const),
) {}
