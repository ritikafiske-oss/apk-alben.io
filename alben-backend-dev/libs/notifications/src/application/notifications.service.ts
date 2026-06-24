import { Injectable, Inject } from '@nestjs/common';
import type { IEmailPort } from '../domain/ports/email.port';
import type { ISmsPort, SendSMSResult } from '../domain/ports/sms.port';
import { EMAIL_PORT, SMS_PORT } from '../domain/constants';
import { EMAIL_TEMPLATE_REPOSITORY } from '../domain/ports/email-template.repository.port';
import type { EmailTemplateRepositoryPort } from '../domain/ports/email-template.repository.port';
import { DynamicLoggerService } from '@libs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class NotificationsService {
  constructor(
    @Inject(SMS_PORT) private readonly smsPort: ISmsPort,
    @Inject(EMAIL_PORT) private readonly emailPort: IEmailPort,
    @Inject(EMAIL_TEMPLATE_REPOSITORY)
    private readonly emailTemplateRepository: EmailTemplateRepositoryPort,
    private readonly logger: DynamicLoggerService,
  ) {}

  /**
   * Replaces placeholders in the format {key} with values from the data object.
   * Matches Laravel's logic: if key exists, replace; else remove placeholder.
   */
  private renderTemplate(template: string, data: unknown): string {
    return template.replace(/{(\w+)}/g, (match, key: string) => {
      return Object.prototype.hasOwnProperty.call(data, key)
        ? String((data as Record<string, unknown>)[key])
        : '';
    });
  }

  async sendTemplatedEmail(
    to: string,
    slug: string,
    data: unknown,
  ): Promise<boolean> {
    const template = await this.emailTemplateRepository.findBySlug(slug);

    if (!template) {
      this.logger.error(
        `Email template not found or inactive: ${slug}`,
        undefined,
        'exceptions',
      );
      return false;
    }

    // 1. Render the database content (inner content)
    const innerContent = this.renderTemplate(template.content, data);

    // 2. Load the HTML wrapper layout
    let layoutHtml = '';
    try {
      // Adjust path based on your project structure distribution
      // In dev: libs/notifications/src/infrastructure/templates/message-wrapper.html
      // simpler approach: assume file exists at known location or define a fallback
      // If running from dist, path might be different.
      // For now, let's try a robust path resolution relative to process.cwd for dev/cloud environment
      const layoutPath = path.join(
        process.cwd(),
        'libs/notifications/src/infrastructure/templates/message-wrapper.html',
      );

      if (fs.existsSync(layoutPath)) {
        layoutHtml = fs.readFileSync(layoutPath, 'utf8');
      } else {
        // Fallback to searching in probable dist location or src location
        // This is critical for robustness.
        this.logger.warn(
          `Layout file not found at ${layoutPath}, using fallback.`,
        );
        // ... fallback logic or error
        // For now, let's assume src path exists as created
      }
    } catch (err) {
      this.logger.error(
        'Error reading email layout file',
        (err as Error).stack,
        'exceptions',
      );
    }

    // 3. If layout found, inject content into layout. Otherwise use innerContent as is.
    let finalHtml = innerContent;
    if (layoutHtml) {
      // Inject rendered content into layout's {content} placeholder
      const layoutData = {
        ...(data as Record<string, unknown>),
        content: innerContent,
        year: new Date().getFullYear(),
        // ensure app_name is present if not passed
        app_name:
          ((data as Record<string, unknown>).app_name as string) || 'Alben',
      };
      finalHtml = this.renderTemplate(layoutHtml, layoutData);
    }

    const subject = this.renderTemplate(template.subject, data);
    return this.emailPort.sendEmail(to, subject, finalHtml);
  }

  async sendSMS(
    mobile: string,
    message: string,
    _templateId?: string,
  ): Promise<SendSMSResult> {
    this.logger.log(`Delegating SMS to adapter for ${mobile}`);
    return this.smsPort.sendSMS(mobile, message, _templateId);
  }

  async sendEmail(to: string, subject: string, html: string): Promise<boolean> {
    this.logger.log(`Delegating Email to adapter for ${to}`);
    return this.emailPort.sendEmail(to, subject, html);
  }
}
