import { ICreateRawMaterial, IUpdateRawMaterial } from '@common/interfaces/production.interface';
import { RawMaterialRepo } from '@common/repositories/raw-material.repo';
import { Prisma, RawMaterials } from '.prisma/client';
import { BaseService } from '../master/base.service';
import logger from '@common/logger';

export class RawMaterialService extends BaseService<
    RawMaterials,
    Prisma.RawMaterialsSelect,
    Prisma.RawMaterialsWhereInput
> {
    private static instance: RawMaterialService;

    private constructor() {
        super(new RawMaterialRepo());
    }

    static getInstance(): RawMaterialService {
        if (!this.instance) {
            this.instance = new RawMaterialService();
        }
        return this.instance;
    }

    async createMany(data?: ICreateRawMaterial[], tx?: Prisma.TransactionClient) {
        if (!data || data.length === 0) return;

        await this.repo.createMany(data, tx);
        logger.info(`Created ${data.length} raw material successfully.`);
    }

    async updateMany(data?: IUpdateRawMaterial[], tx?: Prisma.TransactionClient) {
        if (!data || data.length === 0) return;

        for (const item of data) {
            await this.repo.update({ id: item.id }, item, tx);
        }
        logger.info(`Updated ${data.length} raw material successfully.`);
    }

    async deleteMany(ids: number[], tx?: Prisma.TransactionClient): Promise<void> {
        if (!ids || ids.length === 0) return;

        await this.repo.deleteMany({ id: { in: ids } }, tx, false);
        logger.info(`Deleted ${ids.length} raw material successfully.`);
    }
}
