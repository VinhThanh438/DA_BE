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
exports.BankEvent = void 0;
const eventbus_1 = __importDefault(require("../eventbus"));
const logger_1 = __importDefault(require("../logger"));
const bank_repo_1 = require("../repositories/bank.repo");
const app_constant_1 = require("../../config/app.constant");
const event_constant_1 = require("../../config/event.constant");
class BankEvent {
    static register() {
        this.bankRepo = new bank_repo_1.BankRepo();
        eventbus_1.default.on(event_constant_1.EVENT_PAYMENT_CREATED, this.paymentCreatedHandler.bind(this));
        eventbus_1.default.on(event_constant_1.EVENT_PAYMENT_DELETED, this.paymentDeletedHandler.bind(this));
    }
    static paymentCreatedHandler(body) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = yield this.bankRepo.update({ id: body.bank_id }, { balance: body.new_bank_balance });
                if (id) {
                    logger_1.default.info('BankEvent.paymentCreatedHandler: balance updated successfully!');
                }
                else {
                    logger_1.default.info('BankEvent.paymentCreatedHandler: bank not found!');
                }
            }
            catch (error) {
                logger_1.default.error('BankEvent.paymentCreatedHandler:', error);
            }
        });
    }
    static paymentDeletedHandler(body) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const bank = yield this.bankRepo.findOne({ id: body.bank_id });
                if (bank) {
                    const newBalance = body.type === app_constant_1.PaymentType.EXPENSE
                        ? Number(bank === null || bank === void 0 ? void 0 : bank.balance) + Number(body.refund)
                        : Number(bank === null || bank === void 0 ? void 0 : bank.balance) - Number(body.refund);
                    yield this.bankRepo.update({ id: body.bank_id }, { balance: newBalance });
                    logger_1.default.info('BankEvent.paymentDeletedHandler: balance updated successfully!');
                }
                else {
                    logger_1.default.info('BankEvent.paymentDeletedHandler: bank not found!');
                }
            }
            catch (error) {
                logger_1.default.error('BankEvent.paymentDeletedHandler:', error);
            }
        });
    }
}
exports.BankEvent = BankEvent;
