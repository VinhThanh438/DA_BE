import { ICreateWorkPricing, IUpdateWorkPricing } from '@common/interfaces/work-pricing.interface';
import { WorkPricingRepo } from '@common/repositories/work-pricing.repo';
import { Prisma, WorkPricings } from '.prisma/client';
import { BaseService } from './master/base.service';
import logger from '@common/logger';

export class WorkPricingService extends BaseService<WorkPricings, Prisma.WorkPricingsSelect, Prisma.WorkPricingsWhereInput> {
    private static instance: WorkPricingService;

    private constructor() {
        super(new WorkPricingRepo());
    }

    static getInstance(): WorkPricingService {
        if (!this.instance) {
            this.instance = new WorkPricingService();
        }
        return this.instance;
    }

    async createMany(data?: ICreateWorkPricing[], tx?: Prisma.TransactionClient) {
        if (!data || data.length === 0) return;

        await this.repo.createMany(data, tx);
        logger.info(`Created ${data.length} work pricing successfully.`);
    }

    async updateMany(data?: IUpdateWorkPricing[], tx?: Prisma.TransactionClient) {
        if (!data || data.length === 0) return;

        for (const item of data) {
            await this.repo.update({ id: item.id }, item, tx);
        }
        logger.info(`Updated ${data.length} work pricing successfully.`);
    }

    async deleteMany(ids: number[], tx?: Prisma.TransactionClient): Promise<void> {
        if (!ids || ids.length === 0) return;

        await this.repo.deleteMany({ id: { in: ids } }, tx, false);
        logger.info(`Deleted ${ids.length} work pricing successfully.`);
    }
}
