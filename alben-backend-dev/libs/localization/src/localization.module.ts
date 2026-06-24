import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocalizationService } from './application/localization.service';
import { LocalizationController } from './ui/localization.controller';
import { LanguageEntity } from './infrastructure/persistence/entities/language.entity';
import { LanguageKeyEntity } from './infrastructure/persistence/entities/language-key.entity';
import { LanguageValueEntity } from './infrastructure/persistence/entities/language-value.entity';
import { LocalizationRepository } from './infrastructure/persistence/repositories/localization.repository';
import { LOCALIZATION_REPOSITORY } from './domain/ports/localization.repository.port';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LanguageEntity,
      LanguageKeyEntity,
      LanguageValueEntity,
    ]),
  ],
  controllers: [LocalizationController],
  providers: [
    LocalizationService,
    {
      provide: LOCALIZATION_REPOSITORY,
      useClass: LocalizationRepository,
    },
  ],
  exports: [LocalizationService, LOCALIZATION_REPOSITORY],
})
export class LocalizationModule {}
