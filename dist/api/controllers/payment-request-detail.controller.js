"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentRequestDetailController = void 0;
const payment_request_detail_service_1 = require("../../common/services/payment-request-detail.service");
const base_controller_1 = require("./base.controller");
class PaymentRequestDetailController extends base_controller_1.BaseController {
    constructor() {
        super(payment_request_detail_service_1.PaymentRequestDetailService.getInstance());
        this.service = payment_request_detail_service_1.PaymentRequestDetailService.getInstance();
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new PaymentRequestDetailController();
        }
        return this.instance;
    }
}
exports.PaymentRequestDetailController = PaymentRequestDetailController;
