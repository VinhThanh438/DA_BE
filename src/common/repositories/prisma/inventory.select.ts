import { Prisma } from '.prisma/client';
import { CommonDetailSelectionAll } from './common-detail.select';
import { EmployeeSelection } from './employee.select';
import { OrganizationSelection } from './organization.select';
import { PartnerSelection } from './partner.select';

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
    details: {
        select: CommonDetailSelectionAll,
    },
};
