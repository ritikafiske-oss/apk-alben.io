/**
 * Job Location Domain Entity
 *
 * Defines a geofenced area where users are authorized to check in.
 */
export class JobLocation {
  constructor(
    public readonly id: number,
    public readonly companyId: number,
    public readonly name: string | null,
    public readonly address: string,
    public readonly latitude: number,
    public readonly longitude: number,
    public readonly radius: string, // Store as string per schema (varchar)
    public readonly createdBy: number,
    public readonly status: string,
    public readonly createdAt: Date | null = null,
    public readonly updatedAt: Date | null = null,
    public readonly deletedAt: Date | null = null,
  ) {}
}
