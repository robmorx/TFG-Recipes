import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST'),
      port: this.configService.get<number>('SMTP_PORT'),
      secure: false,
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASSWORD'),
      },
    });
  }

  async sendVerificationCode(email: string, code: string): Promise<void> {
    await this.transporter.sendMail({
      from: this.configService.get<string>('SMTP_FROM'),
      to: email,
      subject: 'Verifica tu cuenta',
      html: `
        <h1>Bienvenido</h1>
        <p>Tu código de verificación es:</p>
        <h2 style="font-size: 32px; letter-spacing: 8px; text-align: center;">${code}</h2>
        <p>Este código expirará en 24 horas.</p>
      `,
    });
  }

  async sendPasswordResetCode(email: string, code: string): Promise<void> {
    await this.transporter.sendMail({
      from: this.configService.get<string>('SMTP_FROM'),
      to: email,
      subject: 'Restablece tu contraseña',
      html: `
        <h1>Restablecimiento de contraseña</h1>
        <p>Tu código para restablecer la contraseña es:</p>
        <h2 style="font-size: 32px; letter-spacing: 8px; text-align: center;">${code}</h2>
        <p>Este código expirará en 1 hora.</p>
        <p>Si no solicitaste este cambio, ignora este mensaje.</p>
      `,
    });
  }
}
