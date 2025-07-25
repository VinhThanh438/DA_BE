import { MAIL_FROM, MAIL_PASSWORD, MAIL_SERVICE, MAIL_USERNAME } from '@common/environment';
import logger from '@common/logger';
import { MailOptions } from '@config/app.constant';
import nodemailer, { Transporter } from 'nodemailer';

export class MailAdapter {
    private static transporter: Transporter;

    private static getTransporter(): Transporter {
        if (!this.transporter) {
            this.transporter = nodemailer.createTransport({
                service: MAIL_SERVICE,
                auth: {
                    user: MAIL_USERNAME,
                    pass: MAIL_PASSWORD,
                },
            });
        }

        return this.transporter;
    }

    public static async sendMail(options: MailOptions): Promise<void> {
        const transporter = this.getTransporter();

        await transporter.sendMail({
            from: options.from || `"Công Ty Cổ Phần Thép Đông Anh" <noreply ${MAIL_FROM}>`,
            to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
            subject: options.subject,
            html: options.template,
            text: options.text,
        });
    }

    public static async connect(): Promise<void> {
        const transporter = this.getTransporter();

        try {
            await transporter.verify();
            logger.info('Connect to mail server successfully!');
        } catch (error) {
            logger.error('Error connecting to mail server: ', error);
            throw error;
        }
    }

    public static async disconnect(): Promise<void> {
        if (this.transporter) {
            this.transporter.close();
            logger.info('Mail server connection closed.');
        }
    }
}
