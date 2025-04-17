import { Partners, Prisma } from '.prisma/client';
import { DatabaseAdapter } from '@common/infrastructure/database.adapter';
import { BaseRepo } from './base.repo';
import { EmployeeSelection } from './employee.repo';
import { PartnerGroupSelection } from './partner-group.repo';
import { PartnerType } from '@config/app.constant';
import { IPaginationResponse } from '@common/interfaces/common.interface';
import { IPaginationInputPartner } from '@common/interfaces/partner.interface';
import { ClauseSelection } from './clause.repo';

export const PartnerSelection: Prisma.PartnersSelect = {
    id: true,
    name: true,
    type: true,
    phone: true,
    address: true,
    note: true,
    tax: true,
    max_dept_amount: true,
    max_dept_day: true,
};
export const PartnerSelectionAll: Prisma.PartnersSelect = {
    ...PartnerSelection,
    sale_staff: true,
    partner_group: {
        select: PartnerGroupSelection,
    },
    clause: {
        select: ClauseSelection,
    },
    // emergency_contact: true,
};

export class PartnerRepo extends BaseRepo<Partners, Prisma.PartnersSelect, Prisma.PartnersWhereInput> {
    protected db = DatabaseAdapter.getInstance().partners;
    protected defaultSelect = PartnerSelection;
    protected detailSelect = PartnerSelectionAll;

    public async getAll(
        body: IPaginationInputPartner,
        includeRelations: boolean,
        type: PartnerType | '',
        organization_id: number | null,
    ): Promise<IPaginationResponse> {
        const s_query = {
            type: type,
            organization_id: organization_id,
        };
        return super.paginate(body, includeRelations, s_query);
    }
}
