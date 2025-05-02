import { Partners, Prisma } from '.prisma/client';
import { DatabaseAdapter } from '@common/infrastructure/database.adapter';
import { BaseRepo } from './base.repo';
import { EmployeeSelection } from './employee.repo';
import { PartnerGroupSelection } from './partner-group.repo';
import { PartnerType } from '@config/app.constant';
import { IPaginationResponse } from '@common/interfaces/common.interface';
import { IPaginationInputPartner } from '@common/interfaces/partner.interface';
import { ClauseSelection } from './clause.repo';
import { BankAccountSelection } from './bank.repo';

export const PartnerSelection: Prisma.PartnersSelect = {
    id: true,
    code: true,
    name: true,
    type: true,
    phone: true,
    addresses: true,
    representatives: true,
    email: true,
    note: true,
    tax: true,
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
    bank_accounts: {
        select: BankAccountSelection,
    },
    // emergency_contact: true,
};

export class PartnerRepo extends BaseRepo<Partners, Prisma.PartnersSelect, Prisma.PartnersWhereInput> {
    protected db = DatabaseAdapter.getInstance().partners;
    protected defaultSelect = PartnerSelection;
    protected detailSelect = PartnerSelectionAll;
    protected modelKey = 'partners' as const;

    public async getAll(
        body: IPaginationInputPartner,
        includeRelations: boolean,
        type: PartnerType | '',
        organization_id: number | null,
        // ) {
    ): Promise<IPaginationResponse> {
        let s_query = {
            organization_id: organization_id,
        } as any;
        if (type.length > 0) {
            s_query = { ...s_query, type: type };
        }
        const output = await super.paginate(body, includeRelations, s_query);
        return output;
    }
}
