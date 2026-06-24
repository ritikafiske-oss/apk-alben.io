import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import { LOCALIZATION_REPOSITORY } from '../domain/ports/localization.repository.port';
import type { LocalizationRepositoryPort } from '../domain/ports/localization.repository.port';

@Injectable()
export class LocalizationService {
  constructor(
    @Inject(LOCALIZATION_REPOSITORY)
    private readonly localizationRepo: LocalizationRepositoryPort,
  ) {}

  /**
   * Fetches the entire language dictionary for a given language code.
   * Mobile applications use this to download all necessary UI text and API error codes.
   */
  async getLanguages(langCode: string): Promise<Record<string, string>> {
    // 1. Verify language exists and is active
    const language = await this.localizationRepo.findActiveLanguage(langCode);

    if (!language) {
      throw new BadRequestException({
        success: false,
        code: 'ERR_LANGUAGE_NOT_FOUND',
        message: `Language '${langCode}' is not supported or inactive.`,
      });
    }

    // 2. Fetch and return the flat key-value dictionary
    return this.localizationRepo.getLanguageDictionary(language.id);
  }
}
