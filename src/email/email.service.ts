import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { createForgotPasswordEmailBody } from '../utils/emailTemplates/resetPassword';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    try {
      // Log the nodemailer object to ensure it's imported correctly
      // this.logger.log(`Nodemailer object: ${JSON.stringify(nodemailer)}`);

      if (!nodemailer.createTransport) {
        throw new Error('Nodemailer does not have createTransport method.');
      }

      // Log environment variables
      this.logger.log(
        `Mail user: ${this.configService.get<string>('Mail_user')}`,
      );
      // Do not log sensitive information like passwords in production
      // this.logger.log(`Mail password: ${this.configProvider.Mail_password}`);

      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: this.configService.get<string>('Mail_user'),
          pass: this.configService.get<string>('Mail_password'),
        },
      });

      this.logger.log('Transporter created successfully');
    } catch (error) {
      this.logger.error('Error creating transporter:', error.message);
    }
  }

  async sendMail(to: string, subject: string, html: string): Promise<void> {
    this.logger.log(`Sending mail to: ${to}`);
    const mailOptions: nodemailer.SendMailOptions = {
      from: this.configService.get<string>('Mail_user'),
      to,
      subject,
      html, // Always use HTML
    };

    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.log('Mail sent successfully');
    } catch (error) {
      this.logger.error('Error sending mail:', error.message);
    }
  }

  // async createMailTemplate(data:any):Promise<void>{
  //     const html = createForgotPasswordEmailBody(data.)
  // }
}
