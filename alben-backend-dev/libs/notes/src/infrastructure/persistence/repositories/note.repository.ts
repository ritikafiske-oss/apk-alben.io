import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NoteRepositoryPort } from '../../../domain/ports/note.repository.port';
import { Note } from '../../../domain/entities/note.entity';
import { NoteEntity } from '../entities/note.entity';
import { ImportantNoteEntity } from '../entities/important-note.entity';
import { ImportantNote } from '../../../domain/entities/important-note.entity';

@Injectable()
export class NoteRepository implements NoteRepositoryPort {
  constructor(
    @InjectRepository(NoteEntity)
    private readonly noteRepo: Repository<NoteEntity>,
    @InjectRepository(ImportantNoteEntity)
    private readonly importantNoteRepo: Repository<ImportantNoteEntity>,
  ) {}

  // This method will be handled by Contacts module for joins
  async findReminderNotes(): Promise<{ notes: Note[]; total: number }> {
    await Promise.resolve();
    throw new Error(
      'Method moved to Contacts module for cross-module joining.',
    );
  }

  async createNote(data: Partial<Note>): Promise<Note> {
    const entity = this.noteRepo.create({
      description: data.description,
      reminderDatetime: data.reminderDatetime,
      contactId: data.contactId,
      callLogId: data.callLogId ?? 0,
      visitLogId: data.visitLogId ?? 0,
      productId: data.productId,
      userId: data.userId,
      forNote: data.forNote,
      isReminderSent: data.isReminderSent,
      isDone: data.isDone ?? false,
      createdAt: data.createdAt ?? new Date(),
      updatedAt: new Date(),
    });
    const saved = await this.noteRepo.save(entity);
    return this.mapToDomain(saved);
  }

  async updateNote(id: number, data: Partial<Note>): Promise<void> {
    await this.noteRepo.update(id, {
      description: data.description,
      reminderDatetime: data.reminderDatetime,
      contactId: data.contactId,
      callLogId: data.callLogId ?? 0,
      visitLogId: data.visitLogId ?? 0,
      productId: data.productId,
      forNote: data.forNote,
      isReminderSent: data.isReminderSent,
      isDone: data.isDone,
      updatedAt: new Date(),
    });
  }

  async findNoteById(id: number): Promise<Note | null> {
    const entity = await this.noteRepo.findOne({ where: { id } });
    if (!entity) return null;
    return this.mapToDomain(entity);
  }

  async findNoteByCriteria(
    criteria: Record<string, unknown>,
  ): Promise<Note | null> {
    const entity = await this.noteRepo.findOne({
      where: criteria,
    });
    if (!entity) return null;
    return this.mapToDomain(entity);
  }

  private mapToDomain(entity: NoteEntity): Note {
    return new Note(
      Number(entity.id),
      entity.description,
      entity.reminderDatetime,
      Number(entity.contactId),
      Number(entity.callLogId),
      Number(entity.visitLogId),
      entity.productId ? Number(entity.productId) : null,
      Number(entity.userId),
      entity.forNote,
      entity.isReminderSent,
      entity.isDone,
      entity.createdAt,
      entity.updatedAt,
    );
  }

  async findImportantNote(
    noteId: number,
    userId: number,
  ): Promise<ImportantNote | null> {
    const entity = await this.importantNoteRepo.findOne({
      where: { noteId, userId },
    });
    if (!entity) return null;
    return new ImportantNote(
      Number(entity.id),
      Number(entity.noteId),
      Number(entity.userId),
      entity.createdAt,
      entity.updatedAt,
    );
  }

  async saveImportantNote(
    noteId: number,
    userId: number,
  ): Promise<ImportantNote> {
    const entity = this.importantNoteRepo.create({ noteId, userId });
    const saved = await this.importantNoteRepo.save(entity);
    return new ImportantNote(
      Number(saved.id),
      Number(saved.noteId),
      Number(saved.userId),
      saved.createdAt,
      saved.updatedAt,
    );
  }

  async deleteImportantNote(id: number): Promise<void> {
    await this.importantNoteRepo.delete(id);
  }

  async markNotesAsDone(contactId: number, productId: number): Promise<void> {
    await this.noteRepo.update(
      {
        contactId: contactId,
        productId: productId,
        isDone: false,
      },
      { isDone: true, updatedAt: new Date() },
    );
  }

  async markRemindersAsSent(
    contactId: number,
    userId: number,
    callLogId: number,
    isService: boolean,
  ): Promise<void> {
    const isServiceValue = isService ? 1 : 0;
    const subQuery = this.noteRepo.manager
      .createQueryBuilder()
      .select('upc.product_id')
      .from('user_product_contacts', 'upc')
      .where('upc.user_id = :userId', { userId })
      .andWhere('upc.contact_id = :contactId', { contactId })
      .andWhere('upc.is_service = :isServiceValue', { isServiceValue });

    await this.noteRepo
      .createQueryBuilder('notes')
      .update()
      .set({ isDone: true, updatedAt: new Date() })
      .where('contact_id = :contactId', { contactId })
      .andWhere('user_id = :userId', { userId })
      .andWhere('reminder_datetime IS NOT NULL')
      .andWhere('is_done = 0')
      .andWhere("for_note = 'others'")
      .andWhere('call_log_id != :callLogId', { callLogId })
      .andWhere(`product_id IN (${subQuery.getQuery()})`)
      .setParameters({
        contactId,
        userId,
        callLogId,
        isServiceValue,
      })
      .execute();
  }
}
