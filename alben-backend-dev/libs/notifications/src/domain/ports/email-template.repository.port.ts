import { EmailTemplate } from '../email-template.entity';

export const EMAIL_TEMPLATE_REPOSITORY = Symbol('EMAIL_TEMPLATE_REPOSITORY');

export interface EmailTemplateRepositoryPort {
  findBySlug(slug: string): Promise<EmailTemplate | null>;
}
