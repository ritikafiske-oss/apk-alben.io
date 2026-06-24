/**
 * Contact Domain Entity
 *
 * Represents a contact in the system.
 *
 * @table contacts
 */
export class Contact {
  constructor(
    public readonly id: number,
    public readonly mobile: string,
    public readonly alternateNumber: string | null,
    public readonly firstname: string | null,
    public readonly lastname: string | null,
    public readonly businessName: string | null,
    public readonly designation: string | null,
    public readonly email: string | null,
    public readonly status: string,
    public readonly contactType: string,
    public readonly companyId: number,
    public readonly createdBy: number,
    public readonly referenceByContactId: number | null,
    public readonly others: string | null,
  ) {}
}
