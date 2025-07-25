import handlebars from 'handlebars';
import path from 'path';
import fs from 'fs';
import logger from '@common/logger';
import { MailAdapter } from '@common/infrastructure/mail.adapter';
import { MAIL_FROM } from '@common/environment';
import { MailOptions, RequestStatus } from '@config/app.constant';
import { IJobSendConfirmEmailData, IJobSendPendingEmailData, IJobSendRejectQuotationEmailData } from '@common/interfaces/common.interface';

const readFileAsync = fs.promises.readFile;

export class MailService {
    private static templateCache: { [key: string]: HandlebarsTemplateDelegate } = {};
    private static templateOption: Partial<MailOptions> = {
        from: MAIL_FROM,
        text: 'Thông báo từ hệ thống',
    };
    private static FileNameList = {
        CONFIRM_MAIL_TEMPLATE: 'confirm-mail.template.html',
        PENDING_MAIL_TEMPLATE: 'confirm-mail.template.html',
        REJECT_QUOTATION_MAIL_TEMPLATE: 'reject-quotation.template.html',
    };

    private static async loadTemplate(templateName: string): Promise<HandlebarsTemplateDelegate> {
        if (this.templateCache[templateName]) {
            return this.templateCache[templateName];
        }

        try {
            const templatePath = path.join(process.cwd(), 'templates', templateName);
            const templateContent = await readFileAsync(templatePath, 'utf-8');
            const template = handlebars.compile(templateContent);

            this.templateCache[templateName] = template;

            return template;
        } catch (error) {
            logger.error(`Error loading template ${templateName}:`, error);
            throw error;
        }
    }

    public static async sendConfirmMail(data: IJobSendConfirmEmailData): Promise<void> {
        try {
            const template = await this.loadTemplate(this.FileNameList.CONFIRM_MAIL_TEMPLATE);
            const htmlContent = template({
                name: data.name,
                status: data.status === RequestStatus.APPROVED ? 'xác nhận' : 'từ chối',
            });

            Object.assign(this.templateOption, {
                to: data.email,
                subject: 'Xác nhận yêu cầu đăng nhập',
                template: htmlContent,
            });

            await MailAdapter.sendMail(this.templateOption as MailOptions);

            logger.info('Confirmation email sent successfully', {
                from: MAIL_FROM,
                recipient: data.email,
                name: data.name,
            });
        } catch (error) {
            logger.error('Error sending confirmation email:', error);
            throw error;
        }
    }

    public static async sendPendingMail(data: IJobSendPendingEmailData): Promise<void> {
        try {
            const template = await this.loadTemplate(this.FileNameList.PENDING_MAIL_TEMPLATE);
            const htmlContent = template({
                name: data.name,
            });

            Object.assign(this.templateOption, {
                to: data.email,
                subject: 'Thông báo phát hiện đăng nhập từ thiết bị mới',
                template: htmlContent,
            });

            await MailAdapter.sendMail(this.templateOption as MailOptions);

            logger.info('Pending email sent successfully', {
                from: MAIL_FROM,
                recipient: data.email,
                name: data.name,
            });
        } catch (error) {
            logger.error('Error sending pending email:', error);
            throw error;
        }
    }

    static async sendRejectQuotationMail(data: IJobSendRejectQuotationEmailData): Promise<void> {
        try {
            const template = await this.loadTemplate(this.FileNameList.REJECT_QUOTATION_MAIL_TEMPLATE);
            const htmlContent = template(data);

            Object.assign(this.templateOption, {
                to: data.email,
                subject: 'Từ chối yêu cầu báo giá',
                template: htmlContent,
            });

            await MailAdapter.sendMail(this.templateOption as MailOptions);

            logger.info('Reject quotation email sent successfully', {
                from: MAIL_FROM,
                recipient: data.email,
                name: data.name,
            });
        } catch (error) {
            logger.error('Error sending pending email:', error);
            throw error;
        }
    }
}
