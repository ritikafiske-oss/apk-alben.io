import { EmailTemplate } from '../../../domain/email-template.entity';
import { EmailTemplateEntity } from '../entities/email-template.entity';

export class EmailTemplateMapper {
  static toDomain(entity: EmailTemplateEntity): EmailTemplate {
    return new EmailTemplate(
      Number(entity.id),
      entity.name,
      entity.slug,
      entity.subject,
      entity.content,
      entity.status,
      entity.createdAt,
      entity.updatedAt,
    );
  }
}
