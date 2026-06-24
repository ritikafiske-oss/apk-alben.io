import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { LocalizationService } from '../application/localization.service';
import { ApiResponse as ApiResponseDto, ExceptionHandler } from '@libs/common';

@ApiTags('Localization')
@Controller('mobile/languages')
export class LocalizationController {
  constructor(private readonly localizationService: LocalizationService) {}

  @Get(':lang')
  @ApiOperation({
    summary: 'Get all languages metadata and localized values',
  })
  @ApiParam({
    name: 'lang',
    description: 'Language abbreviation (e.g., en, fr, es)',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns a complete dictionary of keys and localized values.',
  })
  @ApiResponse({ status: 400, description: 'Language not found or inactive.' })
  async getLanguages(
    @Param('lang') langCode: string,
  ): Promise<ApiResponseDto<Record<string, string>>> {
    try {
      const dictionary = await this.localizationService.getLanguages(langCode);

      return {
        success: true,
        code: 'DATA_FETCHED',
        message: 'Data fetched successfully.',
        data: dictionary,
      };
    } catch (error) {
      ExceptionHandler.handleAndThrow(error);
    }
  }
}
