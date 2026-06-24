import { EmailTemplateStatus } from '../infrastructure/persistence/entities/email-template.entity';

export class EmailTemplate {
  constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly slug: string,
    public readonly subject: string,
    public readonly content: string,
    public readonly status: EmailTemplateStatus,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
  ) {}
}
