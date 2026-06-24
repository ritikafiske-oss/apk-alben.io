import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductRepositoryPort } from '../../../domain/ports/product.repository.port';
import { Product } from '../../../domain/entities/product.entity';
import { ProductEntity } from '../entities/product.entity';
import { UserProductEntity } from '../entities/user-product.entity';

@Injectable()
export class ProductRepository implements ProductRepositoryPort {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepo: Repository<ProductEntity>,
    @InjectRepository(UserProductEntity)
    private readonly userProductRepo: Repository<UserProductEntity>,
  ) {}

  async findUserProducts(
    userId: number,
    companyId: number,
  ): Promise<unknown[]> {
    const userProducts = await this.userProductRepo.find({
      where: {
        userId,
        product: {
          companyId,
          status: 'active',
          isDepartment: false,
        },
      },
      relations: ['product'],
    });

    // Determine unique products and map to domain/DTO structure
    // The requirement is: distinct('products.id'), sort by name
    const productsMap = new Map<
      number,
      {
        id: number;
        name: string;
        // is_department: boolean;
        document: string | null;
      }
    >();

    userProducts.forEach((up) => {
      if (!productsMap.has(up.productId)) {
        productsMap.set(up.productId, {
          id: Number(up.product.id),
          name: up.product.name,
          // is_department: up.product.isDepartment,
          document: up.product.document,
        });
      }
    });

    return Array.from(productsMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name),
    );
  }

  async findProduct(productId: number): Promise<Product | null> {
    const entity = await this.productRepo.findOne({ where: { id: productId } });
    if (!entity) return null;

    return new Product(
      entity.id,
      entity.name,
      entity.document,
      entity.isDepartment,
      entity.status,
      Number(entity.companyId),
    );
  }
}
