import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter | null = null;
  private readonly logger = new Logger(MailService.name);

  constructor(private configService: ConfigService) {
    const smtpHost = this.configService.get<string>('SMTP_HOST');
    const resendApiKey = this.configService.get<string>('RESEND_API_KEY');

    if (!resendApiKey && smtpHost) {
      this.transporter = nodemailer.createTransport({
        host: smtpHost,
        port: this.configService.get<number>('SMTP_PORT'),
        secure: false,
        auth: {
          user: this.configService.get<string>('SMTP_USER'),
          pass: this.configService.get<string>('SMTP_PASSWORD'),
        },
        connectionTimeout: 5000, // 5 segundos max para establecer conexion
        socketTimeout: 5000, // 5 segundos max de inactividad de socket
      });
    }
  }

  private async sendEmail(to: string, subject: string, html: string): Promise<void> {
    const resendApiKey = this.configService.get<string>('RESEND_API_KEY');

    if (resendApiKey) {
      this.logger.log(`Enviando email a ${to} usando Resend API...`);
      let from = this.configService.get<string>('RESEND_FROM') || 
                 this.configService.get<string>('SMTP_FROM') || 
                 'onboarding@resend.dev';
      
      // Resend requiere un formato de email valido para el remitente. 
      // Si el from no contiene '@', le añadimos la direccion sandbox por defecto
      if (!from.includes('@')) {
        from = `${from} <onboarding@resend.dev>`;
      }

      try {
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${resendApiKey}`,
          },
          body: JSON.stringify({
            from,
            to,
            subject,
            html,
          }),
        });

        const data = await response.json() as any;
        if (!response.ok) {
          throw new Error(data.message || `Error de la API de Resend: status ${response.status}`);
        }
        this.logger.log(`Email enviado con éxito vía Resend. ID: ${data.id}`);
      } catch (error: any) {
        this.logger.error(`Error al enviar email a ${to} vía Resend: ${error.message}`);
        throw error;
      }
    } else if (this.transporter) {
      this.logger.log(`Enviando email a ${to} usando SMTP...`);
      const from = this.configService.get<string>('SMTP_FROM') || 'CeroSobras <no-reply@cerosobras.com>';
      try {
        await this.transporter.sendMail({
          from,
          to,
          subject,
          html,
        });
        this.logger.log(`Email enviado con éxito vía SMTP a ${to}`);
      } catch (error: any) {
        this.logger.error(`Error al enviar email a ${to} vía SMTP: ${error.message}`);
        throw error;
      }
    } else {
      const errMsg = 'No hay un transporte de correo configurado (falta RESEND_API_KEY o configuración SMTP)';
      this.logger.warn(errMsg);
      this.logger.warn(`CONTENIDO DEL CORREO (Consola):\nPara: ${to}\nAsunto: ${subject}\nHTML: ${html}`);
    }
  }

  async sendVerificationCode(email: string, code: string): Promise<void> {
    await this.sendEmail(
      email,
      'Verifica tu cuenta',
      `
        <h1>Bienvenido</h1>
        <p>Tu código de verificación es:</p>
        <h2 style="font-size: 32px; letter-spacing: 8px; text-align: center;">${code}</h2>
        <p>Este código expirará en 24 horas.</p>
      `
    );
  }

  async sendPasswordResetCode(email: string, code: string): Promise<void> {
    await this.sendEmail(
      email,
      'Restablece tu contraseña',
      `
        <h1>Restablecimiento de contraseña</h1>
        <p>Tu código para restablecer la contraseña es:</p>
        <h2 style="font-size: 32px; letter-spacing: 8px; text-align: center;">${code}</h2>
        <p>Este código expirará en 1 hora.</p>
        <p>Si no solicitaste este cambio, ignora este mensaje.</p>
      `
    );
  }
}
