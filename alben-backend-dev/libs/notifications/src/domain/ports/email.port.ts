export interface IEmailPort {
  sendEmail(to: string, subject: string, html: string): Promise<boolean>;
}
