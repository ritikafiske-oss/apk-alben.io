import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmailTemplateRepositoryPort } from '../../../domain/ports/email-template.repository.port';
import { EmailTemplate } from '../../../domain/email-template.entity';
import {
  EmailTemplateEntity,
  EmailTemplateStatus,
} from '../entities/email-template.entity';
import { EmailTemplateMapper } from '../mappers/email-template.mapper';

@Injectable()
export class EmailTemplateRepository implements EmailTemplateRepositoryPort {
  constructor(
    @InjectRepository(EmailTemplateEntity)
    private readonly repo: Repository<EmailTemplateEntity>,
  ) {}

  async findBySlug(slug: string): Promise<EmailTemplate | null> {
    const entity = await this.repo.findOne({
      where: { slug, status: EmailTemplateStatus.ACTIVE },
    });
    return entity ? EmailTemplateMapper.toDomain(entity) : null;
  }
}
