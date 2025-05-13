import { BaseController } from './base.controller';
import { Banks } from '.prisma/client';
import { BankService } from '@common/services/bank.service';

export class BankController extends BaseController<Banks> {
    private static instance: BankController;
    protected service: BankService;

    private constructor() {
        super(BankService.getInstance());
        this.service = BankService.getInstance();
    }

    public static getInstance(): BankController {
        if (!this.instance) {
            this.instance = new BankController();
        }
        return this.instance;
    }
}
