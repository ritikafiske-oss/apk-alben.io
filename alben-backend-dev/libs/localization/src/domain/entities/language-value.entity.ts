import { Language } from './language.entity';
import { LanguageKey } from './language-key.entity';

/**
 * LanguageValue Domain Entity
 *
 * Represents a translated string for a specific language and key.
 *
 * @table language_values
 */
export class LanguageValue {
  constructor(
    public readonly id: number,
    public readonly languageId: number,
    public readonly languageKeyId: number,
    public readonly value: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly language?: Language,
    public readonly languageKey?: LanguageKey,
  ) {}
}
