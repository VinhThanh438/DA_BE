import { BankAccounts, Prisma } from '.prisma/client';
import { BaseRepo } from './base.repo';
import { DatabaseAdapter } from '@common/infrastructure/database.adapter';
import { IPaginationInput, IPaginationResponse } from '@common/interfaces/common.interface';
import { BankType } from '@config/app.constant';

export const BankAccountSelection: Prisma.BankAccountsSelect = {
    id: true,
    bank: true,
    account_number: true,
    name: true,
};
export const BankAccountSelectionAll: Prisma.BankAccountsSelect = {
    ...BankAccountSelection,
};

export class BankRepo extends BaseRepo<BankAccounts, Prisma.BankAccountsSelect, Prisma.BankAccountsWhereInput> {
    constructor() {
        super();
    }
    protected db = DatabaseAdapter.getInstance().bankAccounts;
    protected defaultSelect = BankAccountSelection;
    protected detailSelect = BankAccountSelectionAll;
    protected modelKey = 'bankAccounts' as const;

    public async getAll(
        body: IPaginationInput,
        includeRelations: boolean,
        type: BankType | '',
        id: number | null,
    ): Promise<IPaginationResponse> {
        const s_query = id === 0 ? {} : type === BankType.EMPLOYEE ? { employee_id: id } : { partner_id: id };
        return super.paginate(body, includeRelations, s_query);
    }
}
