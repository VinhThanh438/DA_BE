import { Banks, Prisma } from '.prisma/client';
import { BaseRepo } from './base.repo';
import { DatabaseAdapter } from '@common/infrastructure/database.adapter';

export const BankSelection: Prisma.BanksSelect = {
    id: true,
    bank: true,
    account_number: true,
    branch: true,
    name: true,
    responsibility: true,
};
export const BankSelectionAll: Prisma.BanksSelect = {
    ...BankSelection,
};

export class BankRepo extends BaseRepo<Banks, Prisma.BanksSelect, Prisma.BanksWhereInput> {
    constructor() {
        super();
    }
    protected db = DatabaseAdapter.getInstance().banks;
    protected defaultSelect = BankSelection;
    protected detailSelect = BankSelectionAll;
    protected modelKey = 'banks' as const;
}
