import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContactStatusController } from './ui/contact-status.controller';
import { ContactStatusService } from './application/contact-status.service';
import { ContactStatusRepository } from './infrastructure/persistence/repositories/contact-status.repository';
import { CONTACT_STATUS_REPOSITORY } from './domain/ports/contact-status.repository.port';
import { ContactStatusEntity } from './infrastructure/persistence/entities/contact-status.entity';
import { UsersModule } from '@libs/users';

@Module({
  imports: [TypeOrmModule.forFeature([ContactStatusEntity]), UsersModule],
  controllers: [ContactStatusController],
  providers: [
    ContactStatusService,
    {
      provide: CONTACT_STATUS_REPOSITORY,
      useClass: ContactStatusRepository,
    },
  ],
  exports: [CONTACT_STATUS_REPOSITORY, ContactStatusService],
})
export class ContactStatusModule {}
