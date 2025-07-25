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
exports.MailAdapter = void 0;
const environment_1 = require("../environment");
const logger_1 = __importDefault(require("../logger"));
const nodemailer_1 = __importDefault(require("nodemailer"));
class MailAdapter {
    static getTransporter() {
        if (!this.transporter) {
            this.transporter = nodemailer_1.default.createTransport({
                service: environment_1.MAIL_SERVICE,
                auth: {
                    user: environment_1.MAIL_USERNAME,
                    pass: environment_1.MAIL_PASSWORD,
                },
            });
        }
        return this.transporter;
    }
    static sendMail(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const transporter = this.getTransporter();
            yield transporter.sendMail({
                from: options.from || `"Công Ty Cổ Phần Thép Đông Anh" <noreply ${environment_1.MAIL_FROM}>`,
                to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
                subject: options.subject,
                html: options.template,
                text: options.text,
            });
        });
    }
    static connect() {
        return __awaiter(this, void 0, void 0, function* () {
            const transporter = this.getTransporter();
            try {
                yield transporter.verify();
                logger_1.default.info('Connect to mail server successfully!');
            }
            catch (error) {
                logger_1.default.error('Error connecting to mail server: ', error);
                throw error;
            }
        });
    }
    static disconnect() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.transporter) {
                this.transporter.close();
                logger_1.default.info('Mail server connection closed.');
            }
        });
    }
}
exports.MailAdapter = MailAdapter;
