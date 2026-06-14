import nodemailer from 'nodemailer';
import { appConfig } from '../../common/config/config';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: appConfig.EMAIL,
    pass: appConfig.GOOGLE_APP_PASSWORD,
  },
});

export const nodemailerService = {
  async sendRegistrationEmail(email: string, code: string): Promise<void> {
    await transporter.sendMail({
      from: appConfig.EMAIL_FROM,
      to: email,
      subject: 'Complete your registration',
      html: `
        <h1>Thank you for your registration</h1>
        <p>To finish registration please follow the link below:
          <a href='${appConfig.CONFIRM_EMAIL_URL}?code=${code}'>complete registration</a>
        </p>
      `,
    });
  },
};
