import { Prisma } from '.prisma/client';
import { EmployeeSelection } from './employee.select';
import { OrganizationSelection } from './organization.select';
import { PartnerSelection } from './partner.select';
import { InventoryDetailSelectionAll } from './inventory-detail.select';
import { WarehouseSelectionAll } from './warehouse.select';

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
        select: OrganizationSelection,
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
    warehouse: {
        select: WarehouseSelectionAll
    },
    details: {
        select: InventoryDetailSelectionAll,
    },
};

export const InventorySelectionDetails: Prisma.InventoriesSelect = {
    ...InventorySelection,
    details: {
        select: InventoryDetailSelectionAll,
    },
};
