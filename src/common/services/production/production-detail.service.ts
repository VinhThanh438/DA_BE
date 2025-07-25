import { ICreateProductionDetail, IUpdateProductionDetail } from '@common/interfaces/production-detail.interface';
import { ProductionDetailRepo } from '@common/repositories/production-detail.repo';
import { Prisma, ProductionDetails } from '.prisma/client';
import { BaseService } from '../master/base.service';
import logger from '@common/logger';

export class ProductionDetailService extends BaseService<ProductionDetails, Prisma.ProductionDetailsSelect, Prisma.ProductionDetailsWhereInput> {
    private static instance: ProductionDetailService;

    private constructor() {
        super(new ProductionDetailRepo());
    }

    static getInstance(): ProductionDetailService {
        if (!this.instance) {
            this.instance = new ProductionDetailService();
        }
        return this.instance;
    }

    async createMany(data?: ICreateProductionDetail[], tx?: Prisma.TransactionClient) {
        if (!data || data.length === 0) return;

        await this.repo.createMany(data, tx);
        logger.info(`Created ${data.length} production details successfully.`);
    }

    async updateMany(data?: IUpdateProductionDetail[], tx?: Prisma.TransactionClient) {
        if (!data || data.length === 0) return;

        for (const item of data) {
            await this.repo.update({ id: item.id }, item, tx);
        }
        logger.info(`Updated ${data.length} production details successfully.`);
    }

    async deleteMany(ids: number[], tx?: Prisma.TransactionClient): Promise<void> {
        if (!ids || ids.length === 0) return;

        await this.repo.deleteMany({ id: { in: ids } }, tx, false);
        logger.info(`Deleted ${ids.length} production details successfully.`);
    }
}
