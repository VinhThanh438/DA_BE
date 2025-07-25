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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentRequestDetailEvent = void 0;
const eventbus_1 = __importDefault(require("../eventbus"));
const logger_1 = __importDefault(require("../logger"));
const payment_request_details_repo_1 = require("../repositories/payment-request-details.repo");
const app_constant_1 = require("../../config/app.constant");
const event_constant_1 = require("../../config/event.constant");
class PaymentRequestDetailEvent {
    static register() {
        this.paymentRequestDetailRepo = new payment_request_details_repo_1.PaymentRequestDetailRepo();
        eventbus_1.default.on(event_constant_1.EVENT_PAYMENT_CREATED, this.paymentCreatedHandler.bind(this));
    }
    static paymentCreatedHandler(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { payment_request_detail_id } = data, paymentData = __rest(data, ["payment_request_detail_id"]);
                if (payment_request_detail_id) {
                    yield this.paymentRequestDetailRepo.update({
                        id: payment_request_detail_id,
                    }, {
                        status: app_constant_1.PaymentRequestDetailStatus.PAYMENTED,
                    });
                }
                logger_1.default.info('PaymentRequestDetailEvent.paymentCreatedHandler: Successfully!');
            }
            catch (error) {
                logger_1.default.error('PaymentRequestDetailEvent.paymentCreatedHandler:', error);
            }
        });
    }
}
exports.PaymentRequestDetailEvent = PaymentRequestDetailEvent;
