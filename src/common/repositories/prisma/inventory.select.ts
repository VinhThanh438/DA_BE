import { Prisma } from '.prisma/client';
import { EmployeeSelection, EmployeeSelectionAll } from './employee.select';
import { PartnerSelection } from './partner.select';
import { InventoryDetailSelectionAll } from './inventory-detail.select';
import { WarehouseSelectionAll } from './warehouse.select';
import { OrderSelectionPartner } from './order.select';
import { ShippingPlanSelectionAll, ShippingPlanSelectionWithPartner } from './shipping-plan.select';
import { OrganizationSelection } from './base.select';

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
    organization_id: true,
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
    shipping_plan: {
        select: ShippingPlanSelectionAll,
    },
    warehouse: {
        select: WarehouseSelectionAll,
    },
    order: {
        // select: OrderSelectionPartner,
        select: {
            id: true,
            code: true,
            time_at: true,
            type: true,
            address: true,
            phone: true,
            status: true,
            payment_method: true,
            rejected_reason: true,
            files: true,
            note: true,
            partner_id: true,
            employee_id: true,
            organization: {
                select: OrganizationSelection,
            },
            delivery_progress: true,
            partner: {
                select: PartnerSelection,
            },
        },
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

export const InventoryForGetImportDetailSelection: Prisma.InventoriesSelect = {
    ...InventorySelection,
    warehouse: {
        select: WarehouseSelectionAll,
    },
};

export const InventorSelectionWithShipping: Prisma.InventoriesSelect = {
    ...InventorySelection,
    shipping_plan: {
        select: ShippingPlanSelectionWithPartner,
    },
};

export const InventorSelectionWithGateLog: Prisma.InventoriesSelect = {
    ...InventorySelection,
    shipping_plan: {
        select: ShippingPlanSelectionWithPartner,
    },
    warehouse: {
        select: WarehouseSelectionAll,
    },
    order: {
        select: {
            id: true,
            code: true,
            time_at: true,
            type: true,
            address: true,
            phone: true,
            status: true,
            payment_method: true,
            rejected_reason: true,
            files: true,
            note: true,
            partner_id: true,
            employee_id: true,
            delivery_progress: true,
            employee: {
                select: EmployeeSelection,
            },
            partner: {
                select: PartnerSelection,
            },
        },
    },
};
