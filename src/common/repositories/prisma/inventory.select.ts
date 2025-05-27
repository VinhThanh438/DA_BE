import { Prisma } from '.prisma/client';
import { EmployeeSelection } from './employee.select';
import { OrganizationSelection } from './organization.select';
import { PartnerSelection } from './partner.select';
import { InventoryDetailSelectionAll } from './inventory-detail.select';
import { WarehouseSelectionAll } from './warehouse.select';
import { OrderSelection } from './order.select';

export const InventorySelection: Prisma.InventoriesSelect = {
    id: true,
    code: true,
    time_at: true,
    type: true,
    note: true,
    files: true,
    status: true,
    plate: true,
    vehicle: true,
    delivery_cost: true,
    identity_code: true,
    representative_name: true,
    order_id: true,
    warehouse_id: true,
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
        select: WarehouseSelectionAll,
    },
    order: {
        select: OrderSelection,
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
