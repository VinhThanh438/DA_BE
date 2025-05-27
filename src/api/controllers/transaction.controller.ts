import { TransactionService } from '@common/services/transaction.service';
import { BaseController } from './base.controller';
import { Transactions } from '.prisma/client';

export class TransactionController extends BaseController<Transactions> {
    private static controller: TransactionController;
    protected service: TransactionService;

    constructor() {
        super(TransactionService.getInstance());
        this.service = TransactionService.getInstance();
    }

    public static getInstance(): TransactionController {
        if (!this.controller) {
            this.controller = new TransactionController();
        }
        return this.controller;
    }
}
