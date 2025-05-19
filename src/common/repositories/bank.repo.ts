import { Banks, Prisma } from '.prisma/client';
import { BaseRepo } from './base.repo';
import { DatabaseAdapter } from '@common/infrastructure/database.adapter';
import { BankSelection, BankSelectionAll } from './prisma/bank.select';

export class BankRepo extends BaseRepo<Banks, Prisma.BanksSelect, Prisma.BanksWhereInput> {
    constructor() {
        super();
    }
    protected db = DatabaseAdapter.getInstance().banks;
    protected defaultSelect = BankSelection;
    protected detailSelect = BankSelectionAll;
    protected modelKey = 'banks' as const;
}
