import { ProductHistoryRepo } from '@common/repositories/product-history.repo';
import { BaseService } from './base.service';
import { ProductHistories, Prisma } from '.prisma/client';
import { IPaginationInput, IPaginationResponse } from '@common/interfaces/common.interface';

export class ProductHistoryService extends BaseService<
    ProductHistories,
    Prisma.ProductHistoriesSelect,
    Prisma.ProductHistoriesWhereInput
> {
    private static instance: ProductHistoryService;

    private constructor() {
        super(new ProductHistoryRepo());
    }

    public static getInstance(): ProductHistoryService {
        if (!this.instance) {
            this.instance = new ProductHistoryService();
        }
        return this.instance;
    }

    public async paginate(query: IPaginationInput): Promise<IPaginationResponse> {
        const { startAt, endAt, keyword, page, size, ...restQuery } = query;
        const totalRecords = await this.db.products.count({
            where: {
                ...restQuery,
                product_histories: {
                    some: {
                        time_at: {
                            gte: startAt,
                            lte: endAt,
                        },
                    },
                },
            },
        });
        const currentPage = Math.min(page || 1, totalRecords);
        const skip = (currentPage - 1) * (size || 20);

        const data = await this.db.products.findMany({
            where: {
                ...restQuery,
                product_histories: {
                    some: {
                        time_at: {
                            gte: startAt,
                            lte: endAt,
                        },
                    },
                },
            },
            include: {
                product_histories: {
                    where: {
                        time_at: {
                            gte: startAt,
                            lte: endAt,
                        },
                    },
                },
            },
            orderBy: { created_at: 'desc' },
            skip,
            take: size || 20,
        });

        return {
            data,
            pagination: {
                totalPages: totalRecords > 0 ? Math.ceil(totalRecords / (size || 20)) : 1,
                currentPage,
                size: size || 20,
                totalRecords: totalRecords,
            },
        };
    }
}
