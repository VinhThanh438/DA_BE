import { OrganizationSelection } from './base.select';
import { EmployeeShortSelection } from './employee.select';
import { InventorSelectionWithGateLog, InventorSelectionWithShipping } from './inventory.select';
import { Prisma } from '.prisma/client';

export const GateLogSelection: Prisma.GateLogsSelect = {
    id: true,
    time_at: true,
    status: true,
    entry_note: true,
    exit_note: true,
    inventory_id: true,
    organization_id: true,
    employee_id: true,
    entry_time: true,
    entry_plate_image: true,
    entry_container_image: true,
    exit_time: true,
    exit_plate_image: true,
    exit_container_image: true,
    created_at: true,
    updated_at: true,
    files: true,
    rejected_reason: true,
    idx: true,
};

export const GateLogSelectionAll: Prisma.GateLogsSelect = {
    ...GateLogSelection,
    inventory: {
        select: InventorSelectionWithGateLog,
    },
    employee: {
        select: EmployeeShortSelection,
    },
    organization: {
        select: OrganizationSelection,
    },
};
