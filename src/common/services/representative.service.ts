import { RepresentativeRepo } from '@common/repositories/representative.repo';
import { BaseService } from './base.service';
import { Representatives, Prisma } from '.prisma/client';
import { IPaginationInput, IPaginationResponse } from '@common/interfaces/common.interface';
import logger from '@common/logger';

export class RepresentativeService extends BaseService<
    Representatives,
    Prisma.RepresentativesSelect,
    Prisma.RepresentativesWhereInput
> {
    private static instance: RepresentativeService;

    private constructor() {
        super(new RepresentativeRepo());
    }

    public static getInstance(): RepresentativeService {
        if (!this.instance) {
            this.instance = new RepresentativeService();
        }
        return this.instance;
    }

    public async paginate(query: IPaginationInput): Promise<IPaginationResponse> {
        try {
            const data = await this.repo.paginate(query, true);
            const result = {
                ...data,
                data: data.data.map((item: any) => ({
                    ...item,
                    orders: item.orders.map((order: any) => {
                        const commission = order.details.reduce((sum: any, detail: any) => {
                            const quantity = detail.quantity || 0;
                            const price = detail.price || 0;
                            const commission = detail.commission || 0;

                            const amount = quantity * price;
                            const commissionValue = amount * (commission / 100);

                            return sum + commissionValue;
                        }, 0);

                        return {
                            ...order,
                            commission,
                        };
                    }),
                })),
            };
            return result
        } catch (error) {
            logger.error(`${this.constructor.name}.paginate: `, error);
            throw error;
        }
    }
}
