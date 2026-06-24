/**
 * App Version Domain Entity
 *
 * Pure TypeScript class representing an app version record.
 * No framework or infrastructure dependencies.
 *
 * @architecture Clean Architecture - Domain Layer
 */
export class AppVersion {
  constructor(
    public readonly version: string,
    public readonly description: string | null,
    public readonly isForce: number,
  ) {}
}
