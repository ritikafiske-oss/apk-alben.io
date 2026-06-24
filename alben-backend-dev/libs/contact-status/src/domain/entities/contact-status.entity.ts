/**
 * ContactStatus Domain Entity
 *
 * Represents a status that can be assigned to a contact.
 *
 * @table contact_statuses
 */
export class ContactStatus {
  constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly colorCode: string | null,
    public readonly status: string,
    public readonly companyId: number,
    public readonly isHide: boolean,
    public readonly isUnassigned: boolean,
    public readonly isDefault: boolean,
  ) {}
}
