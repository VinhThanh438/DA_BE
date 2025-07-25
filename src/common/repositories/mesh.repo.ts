import { DatabaseAdapter } from '@common/infrastructure/database.adapter';
import { SearchField } from '@common/interfaces/common.interface';
import { Mesh, Prisma } from '.prisma/client';
import { BaseRepo } from './base.repo';
import { MeshSelection, MeshSelectionAll } from './prisma/prisma.select';

export class MeshRepo extends BaseRepo<Mesh, Prisma.MeshSelect, Prisma.MeshWhereInput> {
    protected db = DatabaseAdapter.getInstance().getClient().mesh;
    protected defaultSelect = MeshSelection;
    protected detailSelect = MeshSelectionAll;
    protected modelKey: keyof Prisma.TransactionClient = 'mesh';
    protected timeFieldDefault: string = 'created_at';
    protected searchableFields: Record<string, SearchField[]> = {
        basic: [],
    };
}
