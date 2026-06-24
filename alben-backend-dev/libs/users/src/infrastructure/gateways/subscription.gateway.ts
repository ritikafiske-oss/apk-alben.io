import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DynamicLoggerService } from '@libs/common';

@Injectable()
export class SubscriptionGateway {
  constructor(
    private readonly configService: ConfigService,
    private readonly logger: DynamicLoggerService,
  ) {}

  async getCurrentSubscription(userId: number): Promise<unknown> {
    try {
      const baseUrl =
        this.configService.get<string>('MS_SUBSCRIPTION_URL') || '';
      const appKey = this.configService.get<string>('MS_API_APP_KEY') || '';
      const secretKey =
        this.configService.get<string>('MS_API_SECRET_KEY') || '';

      const url = `${baseUrl}/current-subscription?user_id=${userId}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'X-App-Key': appKey,
          'X-Secret-Key': secretKey,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        this.logger.error(
          `Failed to fetch subscription: ${response.statusText}`,
        );
        return null;
      }

      return await response.json();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;

      this.logger.error(
        `Failed to fetch subscription for user ${userId}: ${errorMessage}`,
        errorStack,
        'exceptions',
      );
      return null;
    }
  }
}
