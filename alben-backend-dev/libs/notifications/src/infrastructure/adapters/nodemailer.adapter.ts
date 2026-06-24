import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DynamicLoggerService } from '@libs/common';
import * as nodemailer from 'nodemailer';
import { IEmailPort } from '../../domain/ports/email.port';

@Injectable()
export class NodemailerAdapter implements IEmailPort {
  private transporter: nodemailer.Transporter | null = null;

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: DynamicLoggerService,
  ) {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    const host = this.configService.get<string>('MAIL_HOST');
    const port = this.configService.get<number>('MAIL_PORT');
    const user = this.configService.get<string>('MAIL_USERNAME');
    const pass = this.configService.get<string>('MAIL_PASSWORD');

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: false, // port 587 uses STARTTLS
        auth: { user, pass },
      });
    }
  }

  async sendEmail(to: string, subject: string, html: string): Promise<boolean> {
    if (!this.transporter) {
      // Try initializing again just in case env vars were loaded late (rare)
      this.initializeTransporter();
      if (!this.transporter) {
        this.logger.warn('SMTP not configured. Email not sent.');
        return true; // Return true to avoid blocking flow
      }
    }

    const fromName = this.configService.get<string>(
      'MAIL_FROM_NAME',
      'Alben.io',
    );
    const fromAddress = this.configService.get<string>(
      'MAIL_FROM_ADDRESS',
      'no-reply@alben.io',
    );

    try {
      const info = (await this.transporter.sendMail({
        from: `"${fromName}" <${fromAddress}>`,
        to,
        subject,
        html,
      })) as { messageId: string };

      this.logger.log(`Email sent: ${info.messageId}`);
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to send email: ${(error as Error).message}`,
        (error as Error).stack,
        'exceptions',
      );
      return false;
    }
  }
}
