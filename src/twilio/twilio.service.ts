import { Injectable } from '@nestjs/common';
import { Twilio } from 'twilio';

@Injectable()
export class TwilioService {
  private twilioClient: Twilio;

  constructor() {
    this.twilioClient = new Twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN,
    );
  }

  async sendVerificationCode(phoneNumber: string): Promise<void> {
    await this.twilioClient.verify.v2
      .services(process.env.TWILIO_VERIFY_SERVICE_ID)
      .verifications.create({ to: phoneNumber, channel: 'sms' });
  }

  async verifyCode(phoneNumber: string, code: string): Promise<boolean> {
    try {
      const verification = await this.twilioClient.verify.v2
        .services(process.env.TWILIO_VERIFY_SERVICE_ID)
        .verificationChecks.create({ to: phoneNumber, code });

      console.log('verification', JSON.stringify(verification, null, 2));

      return verification.status === 'approved';
    } catch (error) {
      console.error(
        'Error verifying code in twillio',
        JSON.stringify(error, null, 2),
      );
      throw error;
    }
  }
}
