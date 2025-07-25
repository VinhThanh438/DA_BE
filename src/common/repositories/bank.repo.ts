import { Banks, Prisma } from '.prisma/client';
import { BaseRepo } from './base.repo';
import { DatabaseAdapter } from '@common/infrastructure/database.adapter';
import { BankSelection, BankSelectionAll } from './prisma/prisma.select';

export class BankRepo extends BaseRepo<Banks, Prisma.BanksSelect, Prisma.BanksWhereInput> {
    constructor() {
        super();
    }
    protected db = DatabaseAdapter.getInstance().getClient().banks;
    protected defaultSelect = BankSelection;
    protected detailSelect = BankSelectionAll;
    protected modelKey = 'banks' as const;
}
