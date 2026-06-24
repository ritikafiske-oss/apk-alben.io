import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StorageModule } from '@libs/storage';
import { VisitTypeEntity } from './infrastructure/persistence/entities/visit-type.entity';
import { VisitLogEntity } from './infrastructure/persistence/entities/visit-log.entity';
import { SurpriseVisitEntity } from './infrastructure/persistence/entities/surprise-visit.entity';
import { LocationChangeRequestEntity } from './infrastructure/persistence/entities/location-change-request.entity';
import { VisitLogProductDetailEntity } from './infrastructure/persistence/entities/visit-log-product-detail.entity';
import { UserCompanyEntity } from '@libs/users';
import { ContactEntity, ProductContactEntity } from '@libs/contacts';
import { ProductEntity, ProductsModule } from '@libs/products';
import { VisitsController } from './ui/visits.controller';
import { VisitsService } from './application/visits.service';
import { UsersModule } from '@libs/users';
import { NotesModule } from '@libs/notes';
import { VisitsRepository } from './infrastructure/persistence/repositories/visits.repository';
import { VISIT_REPOSITORY } from './domain/ports/visit.repository.port';
import { GetVisitTypesUseCase } from './application/get-visit-types.usecase';
import { GetVisitLogsUseCase } from './application/get-visit-logs.usecase';
import { SaveVisitLogUseCase } from './application/save-visit-log.usecase';
import { SaveSurpriseVisitUseCase } from './application/save-surprise-visit.usecase';
import { GetVisitLogDetailsUseCase } from './application/get-visit-log-details.usecase';
import { LocationChangeRequestUseCase } from './application/location-change-request.usecase';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      VisitTypeEntity,
      VisitLogEntity,
      SurpriseVisitEntity,
      LocationChangeRequestEntity,
      UserCompanyEntity,
      ContactEntity,
      ProductEntity,
      ProductContactEntity,
      VisitLogProductDetailEntity,
    ]),
    StorageModule,
    UsersModule,
    ProductsModule,
    NotesModule,
  ],
  controllers: [VisitsController],
  providers: [
    {
      provide: VISIT_REPOSITORY,
      useClass: VisitsRepository,
    },
    VisitsService,
    GetVisitTypesUseCase,
    GetVisitLogsUseCase,
    SaveVisitLogUseCase,
    SaveSurpriseVisitUseCase,
    GetVisitLogDetailsUseCase,
    LocationChangeRequestUseCase,
  ],
  exports: [VISIT_REPOSITORY, VisitsService],
})
export class VisitsModule {}
