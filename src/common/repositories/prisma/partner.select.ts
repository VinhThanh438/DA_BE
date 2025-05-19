import { Prisma } from '.prisma/client';
import { ClauseSelection } from './clause.select';
import { EmployeeSelection } from './employee.select';
import { PartnerGroupSelection } from './partner-group.select';
import { RepresentativeSelectionAll } from './representative.select';

export const PartnerSelection: Prisma.PartnersSelect = {
    id: true,
    code: true,
    name: true,
    type: true,
    phone: true,
    address: true,
    email: true,
    note: true,
    tax: true,
    representative_name: true,
    representative_phone: true,
    representative_email: true,
    representative_position: true,
};
export const PartnerSelectionAll: Prisma.PartnersSelect = {
    ...PartnerSelection,
    partner_group: {
        select: PartnerGroupSelection,
    },
    clause: {
        select: ClauseSelection,
    },
    representatives: {
        select: RepresentativeSelectionAll,
    },
    employee: {
        select: EmployeeSelection,
    },
};
