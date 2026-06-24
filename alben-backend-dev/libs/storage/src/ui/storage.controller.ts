import {
  Controller,
  Post,
  Body,
  UploadedFiles,
  UseInterceptors,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard, ExceptionHandler } from '@libs/common';
import { UploadFilesUseCase } from '../application/upload-files.usecase';
import { UploadFilesDto } from './dtos/upload-files.dto';
import type { MulterFile } from '../interfaces/multer-file.interface';

@ApiTags('storage')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class StorageController {
  constructor(private readonly uploadFilesUseCase: UploadFilesUseCase) {}

  @Post('upload-files')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['company_id', 'files[]'],
      properties: {
        company_id: {
          type: 'string',
          example: '3',
        },
        'files[]': {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  @UseInterceptors(AnyFilesInterceptor())
  async uploadFiles(
    @Body() body: UploadFilesDto,
    @UploadedFiles() files: MulterFile[],
  ) {
    try {
      if (!files || files.length === 0) {
        throw new BadRequestException(['files are required.']);
      }

      const data = await this.uploadFilesUseCase.execute(
        body.company_id,
        files,
      );

      return {
        success: true,
        message: 'file uploaded successfully.',
        data,
      };
    } catch (error) {
      ExceptionHandler.handleAndThrow(error);
    }
  }
}
