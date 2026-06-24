export interface SendSMSResult {
  success: boolean;
  referenceId?: string;
  providerResponse?: unknown;
}

export interface ISmsPort {
  sendSMS(
    mobile: string,
    message: string,
    templateId?: string,
  ): Promise<SendSMSResult>;
}
