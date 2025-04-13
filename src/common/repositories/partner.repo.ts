import { Partners, Prisma } from '.prisma/client';
import { DatabaseAdapter } from '@common/infrastructure/database.adapter';
import { BaseRepo } from './base.repo';
import { EmployeeSelection } from './employee.repo';
import { PartnerGroupSelection } from './partner-group.repo';

export const PartnerSelection: Prisma.PartnersSelect = {
    id: true,
    name: true,
    type: true,
    phone: true,
    address: true,
    note: true,
    tax: true,
    payment_term: true,
    max_dept_amount: true,
    max_dept_day: true,
};
export const PartnerSelectionAll: Prisma.PartnersSelect = {
    ...PartnerSelection,
    sale_staff: {
        select: EmployeeSelection,
    },
    partner_group: {
        select: PartnerGroupSelection,
    },
    // emergency_contact: true,
};

export class PartnerRepo extends BaseRepo<Partners, Prisma.PartnersSelect, Prisma.PartnersWhereInput> {
    protected db = DatabaseAdapter.getInstance().partners;
    protected defaultSelect = PartnerSelection;
    protected detailSelect = PartnerSelectionAll;
}
