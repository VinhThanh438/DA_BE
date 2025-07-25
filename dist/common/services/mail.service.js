"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailService = void 0;
const handlebars_1 = __importDefault(require("handlebars"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const logger_1 = __importDefault(require("../logger"));
const mail_adapter_1 = require("../infrastructure/mail.adapter");
const environment_1 = require("../environment");
const app_constant_1 = require("../../config/app.constant");
const readFileAsync = fs_1.default.promises.readFile;
class MailService {
    static loadTemplate(templateName) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.templateCache[templateName]) {
                return this.templateCache[templateName];
            }
            try {
                const templatePath = path_1.default.join(process.cwd(), 'templates', templateName);
                const templateContent = yield readFileAsync(templatePath, 'utf-8');
                const template = handlebars_1.default.compile(templateContent);
                this.templateCache[templateName] = template;
                return template;
            }
            catch (error) {
                logger_1.default.error(`Error loading template ${templateName}:`, error);
                throw error;
            }
        });
    }
    static sendConfirmMail(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const template = yield this.loadTemplate(this.FileNameList.CONFIRM_MAIL_TEMPLATE);
                const htmlContent = template({
                    name: data.name,
                    status: data.status === app_constant_1.RequestStatus.APPROVED ? 'xác nhận' : 'từ chối',
                });
                Object.assign(this.templateOption, {
                    to: data.email,
                    subject: 'Xác nhận yêu cầu đăng nhập',
                    template: htmlContent,
                });
                yield mail_adapter_1.MailAdapter.sendMail(this.templateOption);
                logger_1.default.info('Confirmation email sent successfully', {
                    from: environment_1.MAIL_FROM,
                    recipient: data.email,
                    name: data.name,
                });
            }
            catch (error) {
                logger_1.default.error('Error sending confirmation email:', error);
                throw error;
            }
        });
    }
    static sendPendingMail(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const template = yield this.loadTemplate(this.FileNameList.PENDING_MAIL_TEMPLATE);
                const htmlContent = template({
                    name: data.name,
                });
                Object.assign(this.templateOption, {
                    to: data.email,
                    subject: 'Thông báo phát hiện đăng nhập từ thiết bị mới',
                    template: htmlContent,
                });
                yield mail_adapter_1.MailAdapter.sendMail(this.templateOption);
                logger_1.default.info('Pending email sent successfully', {
                    from: environment_1.MAIL_FROM,
                    recipient: data.email,
                    name: data.name,
                });
            }
            catch (error) {
                logger_1.default.error('Error sending pending email:', error);
                throw error;
            }
        });
    }
    static sendRejectQuotationMail(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const template = yield this.loadTemplate(this.FileNameList.REJECT_QUOTATION_MAIL_TEMPLATE);
                const htmlContent = template(data);
                Object.assign(this.templateOption, {
                    to: data.email,
                    subject: 'Từ chối yêu cầu báo giá',
                    template: htmlContent,
                });
                yield mail_adapter_1.MailAdapter.sendMail(this.templateOption);
                logger_1.default.info('Reject quotation email sent successfully', {
                    from: environment_1.MAIL_FROM,
                    recipient: data.email,
                    name: data.name,
                });
            }
            catch (error) {
                logger_1.default.error('Error sending pending email:', error);
                throw error;
            }
        });
    }
}
exports.MailService = MailService;
MailService.templateCache = {};
MailService.templateOption = {
    from: environment_1.MAIL_FROM,
    text: 'Thông báo từ hệ thống',
};
MailService.FileNameList = {
    CONFIRM_MAIL_TEMPLATE: 'confirm-mail.template.html',
    PENDING_MAIL_TEMPLATE: 'confirm-mail.template.html',
    REJECT_QUOTATION_MAIL_TEMPLATE: 'reject-quotation.template.html',
};
