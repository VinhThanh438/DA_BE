import { IPaginationInput, IPaginationResponse } from '@common/interfaces/common.interface';
import { ICreateStockTracking, IUpdateStockTracking } from '@common/interfaces/stock-tracking.interface';
import { StockTrackingRepo } from '@common/repositories/stock-tracking.repo';
import { StockTrackings, Prisma } from '.prisma/client';
import { BaseService } from './base.service';
import logger from '@common/logger';

export class StockTrackingService extends BaseService<
    StockTrackings,
    Prisma.StockTrackingsSelect,
    Prisma.StockTrackingsWhereInput
> {
    private static instance: StockTrackingService;

    private constructor() {
        super(new StockTrackingRepo());
    }

    static getInstance(): StockTrackingService {
        if (!this.instance) {
            this.instance = new StockTrackingService();
        }
        return this.instance;
    }

    async paginate(query: IPaginationInput): Promise<IPaginationResponse> {
        const { isDone, ...otherQuery } = query;
        const where: any = { ...otherQuery };

        const data = await this.repo.paginate(where, true);
        return data;
    }

    async createMany(body: ICreateStockTracking[], tx?: Prisma.TransactionClient): Promise<void> {
        const mapData = this.autoMapConnection(body)
        await this.repo.createMany(mapData, tx);
        logger.info(`Created ${mapData.length} stock trackings`);
    }

    async deleteMany(ids: number[], tx?: Prisma.TransactionClient): Promise<void> {
        if (!ids || ids.length === 0) return;
        await this.repo.deleteMany({ id: { in: ids } }, tx, false);
        logger.info('Deleted stock trackings with ids:', ids);
    }

    async updateItem(id: number, data: IUpdateStockTracking, tx?: Prisma.TransactionClient): Promise<void> {
        await this.repo.update({ id }, data, tx);
        logger.info('Updated stock tracking with id:', id);
    }
}
