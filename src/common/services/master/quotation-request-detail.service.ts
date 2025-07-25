import { IQuotationRequestDetailRequest } from '@common/interfaces/quotation-request-detail.interface';
import { QuotationRequestDetailRepo } from '@common/repositories/quotation-request-detail.repo';
import { ProductRepo } from '@common/repositories/product.repo';
import { QuotationRequestDetails, Prisma } from '.prisma/client';
import { UnitRepo } from '@common/repositories/unit.repo';
import { BaseService } from './base.service';

export class QuotationRequestDetailService extends BaseService<
    QuotationRequestDetails,
    Prisma.QuotationRequestDetailsSelect,
    Prisma.QuotationRequestDetailsWhereInput
> {
    private static instance: QuotationRequestDetailService;
    private productRepo: ProductRepo = new ProductRepo();
    private unitRepo: UnitRepo = new UnitRepo();

    private constructor() {
        super(new QuotationRequestDetailRepo());
    }

    public static getInstance(): QuotationRequestDetailService {
        if (!this.instance) {
            this.instance = new QuotationRequestDetailService();
        }
        return this.instance;
    }

    getRepo() {
        return this.repo;
    }

    async createMany(quotationId: number, data: IQuotationRequestDetailRequest[], tx?: Prisma.TransactionClient) {
        await this.validateForeignKeys(
            data,
            {
                product_id: this.productRepo,
                unit_id: this.unitRepo,
            },
            tx,
        );

        const mapData = this.autoMapConnection(data, { quotation_request_id: quotationId })
        await this.repo.createMany(mapData, tx);
    }

    async updateMany(data: IQuotationRequestDetailRequest[], tx?: Prisma.TransactionClient) {
        await this.validateForeignKeys(
            data,
            {
                id: this.repo,
                product_id: this.productRepo,
                unit_id: this.unitRepo,
            },
            tx,
        );

        const mapData = this.autoMapConnection(data)
        await this.repo.updateMany(mapData, tx);
    }

    async deleteMany(ids: number[], tx?: Prisma.TransactionClient) {
        await this.repo.deleteMany({ id: { in: ids } }, tx);
    }
}
