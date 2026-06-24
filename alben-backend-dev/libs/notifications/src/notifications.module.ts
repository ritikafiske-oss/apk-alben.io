import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsService } from './application/notifications.service';
import { EMAIL_PORT, SMS_PORT } from './domain/constants';
import { NodemailerAdapter } from './infrastructure/adapters/nodemailer.adapter';
import { BizSmsAdapter } from './infrastructure/adapters/bizsms.adapter';
import { EmailTemplateEntity } from './infrastructure/persistence/entities/email-template.entity';

import { EmailTemplateRepository } from './infrastructure/persistence/repositories/email-template.repository';
import { EMAIL_TEMPLATE_REPOSITORY } from './domain/ports/email-template.repository.port';

@Global()
@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([EmailTemplateEntity])],
  providers: [
    NotificationsService,
    {
      provide: EMAIL_PORT,
      useClass: NodemailerAdapter,
    },
    {
      provide: SMS_PORT,
      useClass: BizSmsAdapter,
    },
    {
      provide: EMAIL_TEMPLATE_REPOSITORY,
      useClass: EmailTemplateRepository,
    },
  ],
  exports: [NotificationsService],
})
export class NotificationsModule {}
