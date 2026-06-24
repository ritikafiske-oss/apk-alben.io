import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotesService } from './application/notes.service';
import { NoteRepository } from './infrastructure/persistence/repositories/note.repository';
import { NOTE_REPOSITORY } from './domain/ports/note.repository.port';
import { NoteEntity } from './infrastructure/persistence/entities/note.entity';
import { ImportantNoteEntity } from './infrastructure/persistence/entities/important-note.entity';

@Module({
  imports: [TypeOrmModule.forFeature([NoteEntity, ImportantNoteEntity])],
  controllers: [],
  providers: [
    NotesService,
    {
      provide: NOTE_REPOSITORY,
      useClass: NoteRepository,
    },
  ],
  exports: [NOTE_REPOSITORY, NotesService, TypeOrmModule],
})
export class NotesModule {}
