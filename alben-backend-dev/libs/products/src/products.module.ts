import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductEntity } from './infrastructure/persistence/entities/product.entity';
import { UserProductEntity } from './infrastructure/persistence/entities/user-product.entity';
import { ProductsController } from './ui/products.controller';
import { ProductService } from './application/product.service';
import { ProductRepository } from './infrastructure/persistence/repositories/product.repository';
import { PRODUCT_REPOSITORY } from './domain/ports/product.repository.port';
import { UsersModule } from '@libs/users';
import { ContactsModule } from '@libs/contacts';
import { ContactStatusModule } from '@libs/contact-status';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProductEntity, UserProductEntity]),
    UsersModule,
    forwardRef(() => ContactsModule),
    ContactStatusModule,
  ],
  controllers: [ProductsController],
  providers: [
    ProductService,
    {
      provide: PRODUCT_REPOSITORY,
      useClass: ProductRepository,
    },
  ],
  exports: [PRODUCT_REPOSITORY, ProductService],
})
export class ProductsModule {}
