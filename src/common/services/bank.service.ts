import { BankRepo } from '@common/repositories/bank.repo';
import { BaseService } from './base.service';
import { Banks, Prisma } from '.prisma/client';

export class BankService extends BaseService<Banks, Prisma.BanksSelect, Prisma.BanksWhereInput> {
    private static instance: BankService;

    private constructor() {
        super(new BankRepo());
    }

    public static getInstance(): BankService {
        if (!this.instance) {
            this.instance = new BankService();
        }
        return this.instance;
    }
}
