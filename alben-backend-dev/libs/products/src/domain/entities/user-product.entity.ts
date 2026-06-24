/**
 * UserProduct Domain Entity
 *
 * Represents the association between a user and a product.
 *
 * @table user_products
 */
export class UserProduct {
  constructor(
    public readonly id: number,
    public readonly userId: number,
    public readonly productId: number,
  ) {}
}
