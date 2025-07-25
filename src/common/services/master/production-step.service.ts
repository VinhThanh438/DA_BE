import { IPaginationInput, IPaginationResponse } from '@common/interfaces/common.interface';
import { ProductionStepRepo } from '@common/repositories/production-step.repo';
import { Prisma, ProductionStep } from '.prisma/client';
import { BaseService } from './base.service';

export class ProductionStepService extends BaseService<
    ProductionStep,
    Prisma.ProductionStepSelect,
    Prisma.ProductionStepWhereInput
> {
    private static instance: ProductionStepService;

    private constructor() {
        super(new ProductionStepRepo());
    }

    static getInstance(): ProductionStepService {
        if (!this.instance) {
            this.instance = new ProductionStepService();
        }
        return this.instance;
    }

    public async paginate(query: IPaginationInput): Promise<IPaginationResponse> {
        delete query.organizationId;
        delete query.OR;
        return this.repo.paginate(query);
    }
}
