import { Contracts, Prisma } from '.prisma/client';
import { DatabaseAdapter } from '@common/infrastructure/database.adapter';
import { BaseRepo } from './base.repo';
import { ContractSelection, ContractSelectionAll } from './prisma/contract.select';

export class ContractRepo extends BaseRepo<Contracts, Prisma.ContractsSelect, Prisma.ContractsWhereInput> {
    protected db = DatabaseAdapter.getInstance().contracts;
    protected defaultSelect = ContractSelection;
    protected detailSelect = ContractSelectionAll;
    protected modelKey: keyof Prisma.TransactionClient = 'contracts';
    protected searchableFields = ['code'];
}
