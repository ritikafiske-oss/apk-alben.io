export const PRODUCT_REPOSITORY = 'PRODUCT_REPOSITORY';

import { Product } from '../entities/product.entity';
export interface ProductRepositoryPort {
  findUserProducts(userId: number, companyId: number): Promise<unknown[]>;
  findProduct(productId: number): Promise<Product | null>;
}
