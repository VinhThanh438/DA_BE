import { DatabaseAdapter } from '@common/infrastructure/database.adapter';
import { SearchField } from '@common/interfaces/common.interface';
import { MeshDetail, Prisma } from '.prisma/client';
import { BaseRepo } from './base.repo';
import { MeshDetailSelection } from './prisma/prisma.select';

export class MeshDetailRepo extends BaseRepo<MeshDetail, Prisma.MeshDetailSelect, Prisma.MeshDetailWhereInput> {
    protected db = DatabaseAdapter.getInstance().getClient().meshDetail;
    protected defaultSelect = MeshDetailSelection;
    protected detailSelect = MeshDetailSelection;
    protected modelKey: keyof Prisma.TransactionClient = 'meshDetail';
    protected timeFieldDefault: string = 'created_at';
    protected searchableFields: Record<string, SearchField[]> = {
        basic: [],
    };
}
