import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DynamicLoggerService } from '@libs/common';
import { ISmsPort, SendSMSResult } from '../../domain/ports/sms.port';

@Injectable()
export class BizSmsAdapter implements ISmsPort {
  constructor(
    private readonly configService: ConfigService,
    private readonly logger: DynamicLoggerService,
  ) {}

  async sendSMS(
    mobile: string,
    message: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _templateId?: string,
  ): Promise<SendSMSResult> {
    // 1. Validation (Internal Guard)
    if (!mobile || !message) {
      this.logger.error(
        'Attempted to send SMS without mobile or message',
        undefined,
        'sms_logs',
      );
      return { success: false, providerResponse: 'Missing mobile or message' };
    }

    // 2. Configuration Check
    const username = this.configService.get<string>('SMS_USERNAME');
    const password = this.configService.get<string>('SMS_PASSWORD');
    const sendername = this.configService.get<string>('SMS_SENDERNAME');
    const routetype = this.configService.get<string>('SMS_ROUTETYPE', '1');
    const apiUrl = this.configService.get<string>(
      'SMS_API_URL',
      'http://logic.bizsms.in/SMS_API/sendsms.php',
    );

    if (!username || !password || !sendername) {
      this.logger.warn(
        'SMS details not configured (SMS_USERNAME, SMS_PASSWORD, SMS_SENDERNAME). SMS not sent.',
        'sms_logs',
      );
      this.logger.log(`[MOCK SMS] To: ${mobile} | Msg: ${message}`, 'sms_logs');
      return { success: true, referenceId: 'MOCK-REF-ID' };
    }

    try {
      // 3. Delivery
      const params = new URLSearchParams();
      params.append('username', username);
      params.append('password', password);
      params.append('mobile', mobile);
      params.append('sendername', sendername);
      params.append('message', message);
      params.append('routetype', routetype);

      this.logger.log(`Sending SMS to ${mobile}`, 'sms_logs');
      // this.logger.log(
      //   `Sending SMS via ${username} with password ${password} with other details ${mobile} ${sendername} ${message} ${routetype}`,
      //   'sms_logs',
      // );

      const response = await fetch(apiUrl, {
        method: 'POST',
        body: params,
      });

      const responseText = await response.text();
      const output = responseText.trim();

      this.logger.log(`SMS Gateway Response: ${output}`, 'sms_logs');
      // Log request similar to Log::channel('sms_logs')->info(json_encode($postData))
      this.logger.log(
        `Request Params: ${JSON.stringify(Object.fromEntries(params))}`,
        'sms_logs',
      );

      const errorArr = [
        'Invalid User name Or Password',
        'Status: Invalid Sender Name',
        'Status: Credits Expired',
        'Invalid mobile number',
      ];

      // 4. Response Handling
      // Treat as error if HTTP status is not ok OR if the output matches one of the known provider errors
      if (!response.ok || errorArr.includes(output)) {
        this.logger.error(`ERROR= ${output}`, undefined, 'sms_logs');
        return {
          success: false,
          providerResponse: !response.ok
            ? `${response.status} ${response.statusText} - ${output}`
            : output,
        };
      }

      this.logger.log(`SUCCESS = ${output}`, 'sms_logs');

      let parsedMessage: unknown;
      try {
        parsedMessage = JSON.parse(output) as unknown;
      } catch {
        parsedMessage = output;
      }

      return {
        success: true,
        referenceId: output,
        providerResponse: parsedMessage,
      };
    } catch (error) {
      this.logger.error(
        `Failed to send SMS: ${(error as Error).message}`,
        (error as Error).stack,
        'exceptions',
      );
      return {
        success: false,
        providerResponse: (error as Error).message,
      };
    }
  }
}
