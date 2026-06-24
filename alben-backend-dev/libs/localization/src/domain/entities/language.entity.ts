/**
 * Language Domain Entity
 *
 * Represents an active language in the system.
 *
 * @table languages
 */
export class Language {
  constructor(
    public readonly id: number,
    public readonly code: string,
    public readonly name: string,
    public readonly nativeName: string | null,
    public readonly status: 'active' | 'inactive',
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
