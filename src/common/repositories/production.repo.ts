import { Productions, Prisma, MeshProductionDetails } from '.prisma/client';
import { DatabaseAdapter } from '@common/infrastructure/database.adapter';
import { BaseRepo } from './base.repo';
import { SearchField } from '@common/interfaces/common.interface';
import {
    MeshProductionDetailSelection,
    MeshProductionDetailSelectionAll,
    ProductionSelection,
    ProductionSelectionAll,
} from './prisma/prisma.select';

export class ProductionRepo extends BaseRepo<Productions, Prisma.ProductionsSelect, Prisma.ProductionsWhereInput> {
    protected db = DatabaseAdapter.getInstance().getClient().productions;
    protected defaultSelect = ProductionSelection;
    protected detailSelect = ProductionSelectionAll;
    protected modelKey: keyof Prisma.TransactionClient = 'productions';
    protected timeFieldDefault: string = 'time_at';
    protected searchableFields: Record<string, SearchField[]> = {
        basic: [{ path: ['code'] }],
    };
}

export class MeshProductionDetailsRepo extends BaseRepo<
    MeshProductionDetails,
    Prisma.MeshProductionDetailsSelect,
    Prisma.MeshProductionDetailsWhereInput
> {
    protected db = DatabaseAdapter.getInstance().getClient().meshProductionDetails;
    protected defaultSelect = MeshProductionDetailSelection;
    protected detailSelect = MeshProductionDetailSelectionAll;
    protected modelKey: keyof Prisma.TransactionClient = 'meshProductionDetails';
    protected timeFieldDefault: string = 'time_at';
    protected searchableFields: Record<string, SearchField[]> = {
        basic: [],
    };
}
