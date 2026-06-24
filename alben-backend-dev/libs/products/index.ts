export { ProductEntity } from './src/infrastructure/persistence/entities/product.entity';
export { UserProductEntity } from './src/infrastructure/persistence/entities/user-product.entity';
export { PRODUCT_REPOSITORY } from './src/domain/ports/product.repository.port';
export type { ProductRepositoryPort } from './src/domain/ports/product.repository.port';
export * from './src/application/product.service';

// Module export moved to bottom to ensure all entities are defined first
export * from './src/products.module';
