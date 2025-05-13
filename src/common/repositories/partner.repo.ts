import { Partners, Prisma } from '.prisma/client';
import { DatabaseAdapter } from '@common/infrastructure/database.adapter';
import { BaseRepo } from './base.repo';
import { PartnerGroupSelection } from './partner-group.repo';
import { ClauseSelection } from './clause.repo';
import { RepresentativeSelectionAll } from './representative.repo';
import { EmployeeSelection } from './employee.repo';

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
        select: RepresentativeSelectionAll
    },
    employee: {
        select: EmployeeSelection
    }
};

export class PartnerRepo extends BaseRepo<Partners, Prisma.PartnersSelect, Prisma.PartnersWhereInput> {
    protected db = DatabaseAdapter.getInstance().partners;
    protected defaultSelect = PartnerSelection;
    protected detailSelect = PartnerSelectionAll;
    protected modelKey: keyof Prisma.TransactionClient = 'partners';
    protected searchableFields = ['name', 'code'];
}
