import { Injectable, Inject } from '@nestjs/common';
import { NOTE_REPOSITORY } from '../domain/ports/note.repository.port';
import type { NoteRepositoryPort } from '../domain/ports/note.repository.port';
import { Note } from '../domain/entities/note.entity';

@Injectable()
export class NotesService {
  constructor(
    @Inject(NOTE_REPOSITORY)
    private readonly noteRepo: NoteRepositoryPort,
  ) {}

  async createNote(data: Partial<Note>): Promise<Note> {
    return await this.noteRepo.createNote(data);
  }

  async updateNote(id: number, data: Partial<Note>): Promise<void> {
    await this.noteRepo.updateNote(id, data);
  }

  async findNoteById(id: number): Promise<Note | null> {
    return await this.noteRepo.findNoteById(id);
  }

  async toggleImportance(
    userId: number,
    noteId: number,
    action: 'add' | 'remove',
  ): Promise<'ADDED' | 'REMOVED' | 'ALREADY_IMPORTANT'> {
    const importantNote = await this.noteRepo.findImportantNote(noteId, userId);

    if (importantNote && action === 'add') {
      return 'ALREADY_IMPORTANT';
    } else if (importantNote && action === 'remove') {
      await this.noteRepo.deleteImportantNote(importantNote.id);
      return 'REMOVED';
    } else {
      if (action === 'add') {
        await this.noteRepo.saveImportantNote(noteId, userId);
        return 'ADDED';
      }
      return 'REMOVED'; // Fallback for remove when not found
    }
  }

  async markNotesAsDone(contactId: number, productId: number): Promise<void> {
    await this.noteRepo.markNotesAsDone(contactId, productId);
  }
}
