import { Inventories, Prisma } from '.prisma/client';
import { DatabaseAdapter } from '@common/infrastructure/database.adapter';
import { BaseRepo } from './base.repo';
import { CommonDetailSelectionAll } from './common-detail.repo';
import { EmployeeSelection } from './employee.repo';
import { PartnerSelection } from './partner.repo';
import { OrganizationSelection } from './organization.repo';

export const InventorySelection: Prisma.InventoriesSelect = {
    id: true,
    code: true,
    time_at: true,
    type: true,
    note: true,
    files: true,
    license_plate: true,
};

export const InventorySelectionAll: Prisma.InventoriesSelect = {
    ...InventorySelection,
    organization: {
        select: OrganizationSelection
    },
    employee: {
        select: EmployeeSelection,
    },
    supplier: {
        select: PartnerSelection,
    },
    customer: {
        select: PartnerSelection,
    },
    delivery: {
        select: PartnerSelection,
    },
    details: {
        select: CommonDetailSelectionAll,
    },
};

export class InventoryRepo extends BaseRepo<Inventories, Prisma.InventoriesSelect, Prisma.InventoriesWhereInput> {
    protected db = DatabaseAdapter.getInstance().inventories;
    protected defaultSelect = InventorySelection;
    protected detailSelect = InventorySelectionAll;
    protected modelKey: keyof Prisma.TransactionClient = 'inventories';
    protected timeFieldDefault: string = 'time_at';
    protected searchableFields = ['code'];
}
