import { ICreateBomDetail, IUpdateBomDetail } from '@common/interfaces/bom-detail.interface';
import { BomDetailRepo } from '@common/repositories/bom-detail.repo';
import { Prisma, BomDetails } from '.prisma/client';
import { BaseService } from './base.service';
import logger from '@common/logger';

export class BomDetailService extends BaseService<BomDetails, Prisma.BomDetailsSelect, Prisma.BomDetailsWhereInput> {
    private static instance: BomDetailService;

    private constructor() {
        super(new BomDetailRepo());
    }

    static getInstance(): BomDetailService {
        if (!this.instance) {
            this.instance = new BomDetailService();
        }
        return this.instance;
    }

    async createMany(data?: ICreateBomDetail[], tx?: Prisma.TransactionClient) {
        if (!data || data.length === 0) return;

        await this.repo.createMany(data, tx);
        logger.info(`Created ${data.length} bom details successfully.`);
    }

    async updateMany(data?: IUpdateBomDetail[], tx?: Prisma.TransactionClient) {
        if (!data || data.length === 0) return;

        for (const item of data) {
            await this.repo.update({ id: item.id }, item, tx);
        }
        logger.info(`Updated ${data.length} bom details successfully.`);
    }

    async deleteMany(ids: number[], tx?: Prisma.TransactionClient): Promise<void> {
        if (!ids || ids.length === 0) return;

        await this.repo.deleteMany({ id: { in: ids } }, tx, false);
        logger.info(`Deleted ${ids.length} bom details successfully.`);
    }
}
