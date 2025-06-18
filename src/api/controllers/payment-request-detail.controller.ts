import { PaymentRequestDetailService } from '@common/services/payment-request-detail.service';
import { BaseController } from './base.controller';
import { PaymentRequestDetails } from '.prisma/client';

export class PaymentRequestDetailController extends BaseController<PaymentRequestDetails> {
    private static instance: PaymentRequestDetailController;
    protected service: PaymentRequestDetailService;

    private constructor() {
        super(PaymentRequestDetailService.getInstance());
        this.service = PaymentRequestDetailService.getInstance();
    }

    public static getInstance(): PaymentRequestDetailController {
        if (!this.instance) {
            this.instance = new PaymentRequestDetailController();
        }
        return this.instance;
    }
}
