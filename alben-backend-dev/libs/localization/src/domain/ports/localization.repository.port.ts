import { Language } from '../entities/language.entity';

export const LOCALIZATION_REPOSITORY = 'LOCALIZATION_REPOSITORY';

export interface LocalizationRepositoryPort {
  findActiveLanguage(code: string): Promise<Language | null>;
  getLanguageDictionary(languageId: number): Promise<Record<string, string>>;
}
