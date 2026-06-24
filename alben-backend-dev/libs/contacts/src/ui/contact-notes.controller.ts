import {
  Controller,
  Get,
  Post,
  Put,
  UseGuards,
  Query,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse as SwaggerApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard, User, ExceptionHandler } from '@libs/common';
import { ActiveCompanyGuard } from '@libs/users';
import { GetReminderNotesDto } from './dtos/notes/get-reminder-notes.dto';
import { ToggleImportanceDto } from './dtos/notes/toggle-importance.dto';
import { CreateNoteDto } from './dtos/notes/create-note.dto';
import { UpdateNoteDto } from './dtos/notes/update-note.dto';
import { GetReminderNotesUseCase } from '../application/notes/get-reminder-notes.usecase';
import { CreateNoteUseCase } from '../application/notes/create-note.usecase';
import { UpdateNoteUseCase } from '../application/notes/update-note.usecase';
import { ToggleNoteImportanceUseCase } from '../application/notes/toggle-note-importance.usecase';

@ApiTags('Notes / Reminders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, ActiveCompanyGuard)
@Controller('notes')
export class ContactNotesController {
  constructor(
    private readonly getReminderNotesUseCase: GetReminderNotesUseCase,
    private readonly createNoteUseCase: CreateNoteUseCase,
    private readonly updateNoteUseCase: UpdateNoteUseCase,
    private readonly toggleNoteImportanceUseCase: ToggleNoteImportanceUseCase,
  ) {}

  @Get('reminder')
  @ApiOperation({ summary: 'Get reminder notes' })
  @SwaggerApiResponse({
    status: 200,
    description: 'Reminder notes fetched successfully.',
  })
  async getReminderNotes(
    @User() user: { id: number },
    @Query() query: GetReminderNotesDto,
  ) {
    try {
      return await this.getReminderNotesUseCase.execute(user.id, query);
    } catch (error) {
      ExceptionHandler.handleAndThrow(error);
    }
  }

  @Post('importance')
  @ApiOperation({ summary: 'Toggle note importance' })
  @SwaggerApiResponse({
    status: 201,
    description: 'Note importance toggled successfully.',
  })
  async importanceNote(
    @User() user: { id: number },
    @Body() dto: ToggleImportanceDto,
  ) {
    try {
      return await this.toggleNoteImportanceUseCase.execute(user.id, dto);
    } catch (error) {
      ExceptionHandler.handleAndThrow(error);
    }
  }

  @Post()
  @ApiOperation({ summary: 'Create a new note / reminder' })
  @SwaggerApiResponse({
    status: 201,
    description: 'Note/Reminder created successfully.',
  })
  async createNote(@User() user: { id: number }, @Body() dto: CreateNoteDto) {
    try {
      return await this.createNoteUseCase.execute(user.id, dto);
    } catch (error) {
      ExceptionHandler.handleAndThrow(error);
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a note / reminder' })
  @SwaggerApiResponse({
    status: 200,
    description: 'Note/Reminder updated successfully.',
  })
  async updateNote(
    @User() user: { id: number },
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateNoteDto,
  ) {
    try {
      return await this.updateNoteUseCase.execute(user.id, id, dto);
    } catch (error) {
      ExceptionHandler.handleAndThrow(error);
    }
  }
}
