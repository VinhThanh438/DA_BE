import { CommonDetailRepo } from '@common/repositories/common-detail.repo';
import { BaseService } from './base.service';
import { CommonDetails, Prisma } from '.prisma/client';
import logger from '@common/logger';

export class CommonDetailService extends BaseService<
    CommonDetails,
    Prisma.CommonDetailsSelect,
    Prisma.CommonDetailsWhereInput
> {
    private static instance: CommonDetailService;

    private constructor() {
        super(new CommonDetailRepo());
    }

    public static getInstance(): CommonDetailService {
        if (!this.instance) {
            this.instance = new CommonDetailService();
        }
        return this.instance;
    }

    /**
     * Update the imported quantity for a order detail
     * @param where Query to find the order detail to update
     * @param data Object with type of update and quantity
     * @param tx Optional transaction client for atomic operations
     */
    async updateImportQuantity(
        where: Prisma.CommonDetailsWhereInput,
        data: {
            type: 'increase' | 'decrease' | 'update';
            quantity: number;
        },
        tx?: Prisma.TransactionClient,
    ) {
        const detail = await this.repo.findOne(where, false, tx);
        if (!detail) {
            logger.warn('Common detail not found for import quantity update');
            return;
        }

        const currentQty = detail.imported_quantity || 0;
        let newQty = currentQty;

        switch (data.type) {
            case 'increase':
                newQty += data.quantity;
                break;
            case 'decrease':
                newQty -= data.quantity;
                break;
            case 'update':
                if (data.quantity !== 0) newQty = newQty + (data.quantity - newQty);
                break;
        }

        await this.repo.update({ id: detail.id }, { imported_quantity: newQty }, tx);
        logger.info(`Updated import quantity for detail #${detail.id}: ${currentQty} → ${newQty}`);
        return { newQty, qty: detail.quantity || 0 };
    }
}
