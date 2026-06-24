import { ContactStatus } from '@libs/contact-status';

/**
 * ProductContact Domain Entity
 *
 * Represents the association between a product and a contact.
 *
 * @table product_contacts
 */
export class ProductContact {
  constructor(
    public readonly id: number,
    public readonly productId: number,
    public readonly isService: boolean,
    public readonly contactId: number,
    public readonly contactStatusId: number | null,
    public readonly categoryId: number | null,
    public readonly isHide: boolean,
    public readonly attempts: number,
    public readonly startLatitude: number,
    public readonly startLongitude: number,
    public readonly contactStatus?: ContactStatus,
  ) {}
}
