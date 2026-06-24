import { Note } from '../entities/note.entity';
import { ImportantNote } from '../entities/important-note.entity';

export const NOTE_REPOSITORY = 'NOTE_REPOSITORY';

export interface NoteRepositoryPort {
  findReminderNotes(
    userId: number,
    companyId: number,
    filter: {
      productId?: number;
      type?: 'All' | 'visit' | 'others';
      filterBy: 'today' | 'tomorrow' | 'upcoming' | 'past';
      contactType?: 'client' | 'vendor' | 'colleague';
      page: number;
      limit: number;
    },
  ): Promise<{ notes: Note[]; total: number }>;

  createNote(note: Partial<Note>): Promise<Note>;
  updateNote(id: number, note: Partial<Note>): Promise<void>;
  findNoteById(id: number): Promise<Note | null>;
  findNoteByCriteria(criteria: Record<string, unknown>): Promise<Note | null>;
  markNotesAsDone(contactId: number, productId: number): Promise<void>;
  markRemindersAsSent(
    contactId: number,
    userId: number,
    callLogId: number,
    isService: boolean,
  ): Promise<void>;

  findImportantNote(
    noteId: number,
    userId: number,
  ): Promise<ImportantNote | null>;
  saveImportantNote(noteId: number, userId: number): Promise<ImportantNote>;
  deleteImportantNote(id: number): Promise<void>;
}
