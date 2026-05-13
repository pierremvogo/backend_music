import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { emailContent, Language } from './mail.i18n';
import { I18nService } from 'nestjs-i18n';

type EmailType = 'verify-email' | 'reset-password';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly senderEmail: string;
  private readonly brevoApiKey: string;

  constructor(
    private readonly config: ConfigService,
    private readonly i18n: I18nService,
  ) {
    this.senderEmail = this.config.get<string>('BREVO_SENDER_EMAIL') ?? '';
    this.brevoApiKey = this.config.get<string>('BREVO_API_KEY') ?? '';

    if (!this.senderEmail) {
      throw new Error('BREVO_SENDER_EMAIL is missing');
    }

    if (!this.brevoApiKey) {
      throw new Error('BREVO_API_KEY is missing');
    }
  }

  private getResetPasswordUrl(token: string): string {
    return `https://bbok.music/auth/reset-password?token=${token}`;
  }

  private async sendBrevoEmail(
    to: string,
    subject: string,
    htmlContent: string,
  ): Promise<void> {
    try {
      const response = await axios.post(
        'https://api.brevo.com/v3/smtp/email',
        {
          sender: {
            email: this.senderEmail,
            name: 'Bbok',
          },
          to: [{ email: to }],
          subject,
          htmlContent,
        },
        {
          headers: {
            'api-key': this.brevoApiKey,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        },
      );

      this.logger.log(
        `Email sent to ${to} — messageId ${response.data?.messageId ?? 'n/a'}`,
      );
    } catch (error: any) {
      this.logger.error(
        `Error while sending email to ${to}`,
        error?.response?.data
          ? JSON.stringify(error.response.data)
          : error?.message || String(error),
      );

      throw new InternalServerErrorException('Error while sedding Email');
    }
  }

  async sendEmail(
    to: string,
    token: string,
    type: EmailType,
    lang: string,
  ): Promise<void> {
    if (type === 'verify-email') {
      const content = emailContent.verifyEmail(lang, this.i18n);

      await this.sendBrevoEmail(to, content.subject, content.html(token));
      return;
    }

    if (type === 'reset-password') {
      const resetUrl = this.getResetPasswordUrl(token);
      const content = emailContent.resetPassword(lang, this.i18n);

      await this.sendBrevoEmail(to, content.subject, content.html(resetUrl));
      return;
    }

    if (type === 'thank-email') {
      const content = emailContent.thankYouTester(lang, this.i18n);

      await this.sendBrevoEmail(to, content.subject, content.html(''));
      return;
    }
    throw new InternalServerErrorException('Type of Email not supported');
  }
}
