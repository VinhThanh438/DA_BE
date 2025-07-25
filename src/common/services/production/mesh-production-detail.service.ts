import { ICreateMeshProductionDetail, IUpdateMeshProductionDetail } from '@common/interfaces/production.interface';
import { MeshProductionDetailsRepo } from '@common/repositories/production.repo';
import { Prisma, MeshProductionDetails } from '.prisma/client';
import { BaseService } from '../master/base.service';
import logger from '@common/logger';

export class MeshProductionDetailService extends BaseService<
    MeshProductionDetails,
    Prisma.MeshProductionDetailsSelect,
    Prisma.MeshProductionDetailsWhereInput
> {
    private static instance: MeshProductionDetailService;

    private constructor() {
        super(new MeshProductionDetailsRepo());
    }

    static getInstance(): MeshProductionDetailService {
        if (!this.instance) {
            this.instance = new MeshProductionDetailService();
        }
        return this.instance;
    }

    async createMany(data?: ICreateMeshProductionDetail[], tx?: Prisma.TransactionClient) {
        if (!data || data.length === 0) return;

        await this.repo.createMany(data, tx);
        logger.info(`Created ${data.length} mesh production detail successfully.`);
    }

    async updateMany(data?: IUpdateMeshProductionDetail[], tx?: Prisma.TransactionClient) {
        if (!data || data.length === 0) return;

        for (const item of data) {
            await this.repo.update({ id: item.id }, item, tx);
        }
        logger.info(`Updated ${data.length} mesh production detail successfully.`);
    }

    async deleteMany(ids: number[], tx?: Prisma.TransactionClient): Promise<void> {
        if (!ids || ids.length === 0) return;

        await this.repo.deleteMany({ id: { in: ids } }, tx, false);
        logger.info(`Deleted ${ids.length} mesh production detail successfully.`);
    }
}
