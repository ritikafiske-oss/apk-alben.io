import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from '@libs/common';
import { ProductsModule } from '@libs/products';
import { UsersModule } from '@libs/users';
import { ServiceEntity } from './infrastructure/persistence/entities/service.entity';
import { DepartmentServiceEntity } from './infrastructure/persistence/entities/department-service.entity';
import { ServicesController } from './ui/services.controller';
import { GetUserServicesService } from './application/get-user-services.service';
import { ServiceRepository } from './infrastructure/persistence/repositories/service.repository';
import { SERVICE_REPOSITORY } from './domain/ports/service.repository.port';

@Module({
  imports: [
    TypeOrmModule.forFeature([ServiceEntity, DepartmentServiceEntity]),
    CommonModule,
    ProductsModule,
    UsersModule,
  ],
  controllers: [ServicesController],
  providers: [
    GetUserServicesService,
    {
      provide: SERVICE_REPOSITORY,
      useClass: ServiceRepository,
    },
  ],
  exports: [SERVICE_REPOSITORY, GetUserServicesService],
})
export class ServicesModule {}
