/**
 * Product Domain Entity
 *
 * Represents a product in the system.
 *
 * @table products
 */
export class Product {
  constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly document: string | null,
    public readonly isDepartment: boolean,
    public readonly status: string,
    public readonly companyId: number,
  ) {}
}
