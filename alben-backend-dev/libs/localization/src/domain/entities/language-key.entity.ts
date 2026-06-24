/**
 * LanguageKey Domain Entity
 *
 * Represents a key used for text localization.
 *
 * @table language_keys
 */
export class LanguageKey {
  constructor(
    public readonly id: number,
    public readonly keyName: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
