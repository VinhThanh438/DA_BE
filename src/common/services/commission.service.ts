import { CommissionRepo } from '@common/repositories/commission.repo';
import { ICommission } from '@common/interfaces/commission.interface'
import { Commissions, Prisma } from '.prisma/client';
import { BaseService } from './master/base.service';
import { QuotationRequestDetailRepo } from '@common/repositories/quotation-request-detail.repo';
import { RepresentativeRepo } from '@common/repositories/representative.repo';
import logger from '@common/logger';

export class CommissionService extends BaseService<
    Commissions,
    Prisma.CommissionsSelect,
    Prisma.CommissionsWhereInput
> {
    private static instance: CommissionService;
    private representativeRepo: RepresentativeRepo = new RepresentativeRepo();
    private quotationRequestDetailRepo: QuotationRequestDetailRepo = new QuotationRequestDetailRepo();

    private constructor() {
        super(new CommissionRepo());
    }

    public static getInstance(): CommissionService {
        if (!this.instance) {
            this.instance = new CommissionService();
        }
        return this.instance;
    }

    getRepo() {
        return this.repo;
    }

    // parentId có thể là `quotation_request_id` hoặc `order_detail_id`
    async createMany(data: ICommission[] | undefined, tx?: Prisma.TransactionClient, additionalFields: any = {}) {
        if (!data || data.length === 0) return
        await this.validateForeignKeys(
            data,
            {
                representative_id: this.representativeRepo,
                quotation_request_detail_id: this.quotationRequestDetailRepo,
            },
            tx,
        );
        const mapData = this.autoMapConnection(data, additionalFields)
        await this.repo.createMany(mapData, tx);
    }

    async updateMany(data: ICommission[], tx?: Prisma.TransactionClient): Promise<void> {
        if (!data || data.length === 0) return;

        await this.validateForeignKeys(
            data,
            {
                id: this.repo,
                representative_id: this.representativeRepo,
                quotation_request_detail_id: this.quotationRequestDetailRepo,
            },
            tx,
        );

        const mapData = this.autoMapConnection(data)

        for (const item of mapData) {
            const { id, ...updateData } = item;
            await this.repo.update({ id }, updateData, tx);
        }
    }

    async deleteMany(ids: number[], tx?: Prisma.TransactionClient): Promise<void> {
        if (!ids || ids.length === 0) return;
        await this.repo.deleteMany({ id: { in: ids } }, tx, false);
        logger.info('[commission.service] Deleted ids:', ids);
    }
}
