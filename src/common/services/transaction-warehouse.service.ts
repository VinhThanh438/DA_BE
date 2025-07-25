import { TransactionWarehouseRepo } from '@common/repositories/transaction-warehouse.repo';
import { ICreateTransactionWarehouse, ITransactionWarehouse } from '@common/interfaces/transaction-warehouse.interface';
import { Prisma, TransactionWarehouses } from '.prisma/client';
import { BaseService } from './master/base.service';
import { OrderType, TransactionWarehouseType } from '@config/app.constant';
import logger from '@common/logger';
import { IOrder } from '@common/interfaces/order.interface';

export class TransactionWarehouseService extends BaseService<
    TransactionWarehouses,
    Prisma.TransactionWarehousesSelect,
    Prisma.TransactionWarehousesWhereInput
> {
    private static instance: TransactionWarehouseService;

    private constructor() {
        super(new TransactionWarehouseRepo());
    }

    static getInstance(): TransactionWarehouseService {
        if (!this.instance) {
            this.instance = new TransactionWarehouseService();
        }
        return this.instance;
    }

    async getAllByOrderDetailId(
        orderDetailIds: number[],
        type: TransactionWarehouseType = TransactionWarehouseType.OUT,
    ): Promise<Partial<ITransactionWarehouse>[]> {
        // const data = await this.repo.findMany({
        //     inventory_detail: {
        //         order_detail_id: { in: orderDetailIds }
        //     },
        // })
        // return data as ITransactionWarehouse[];
        const data = await this.db.transactionWarehouses.findMany({
            where: {
                inventory_detail: {
                    order_detail_id: { in: orderDetailIds },
                },
                type,
            },
            select: {
                inventory_detail: {
                    select: {
                        order_detail_id: true,
                    },
                },
                quantity: true,
                real_quantity: true,
                convert_quantity: true,
            },
        });
        return data as Partial<ITransactionWarehouse>[];
    }

    async getStockByProductIds(productIds: number[]) {
        const data = (await this.db.transactionWarehouses.findMany({
            where: {
                product_id: { in: productIds },
            },
            select: {
                product_id: true,
                convert_quantity: true,
                type: true,
            },
        })) as ITransactionWarehouse[];
        const stockMap = this.calculateStock(data);
        return stockMap;
    }

    private calculateStock(data: ITransactionWarehouse[]) {
        if (!data || data.length === 0) return;

        const stockMap = new Map<
            number,
            {
                product_id: number;
                in: number;
                out: number;
                stock: number;
            }
        >();

        data.forEach((item) => {
            if (!item.product_id) return;
            const productId = item.product_id;

            if (!stockMap.has(productId)) {
                stockMap.set(productId, {
                    product_id: productId,
                    in: 0,
                    out: 0,
                    stock: 0,
                });
            }

            const stock = stockMap.get(productId)!;

            if (item.type === 'in') {
                stock.in += item.convert_quantity || 0;
            } else if (item.type === 'out') {
                stock.out += item.convert_quantity || 0;
            }

            stock.stock = stock.in - stock.out;
        });

        return stockMap;
    }

    async createMany(body: ICreateTransactionWarehouse[], tx?: Prisma.TransactionClient): Promise<void> {
        if (!body || body.length === 0) return;
        const mapData = this.autoMapConnection(body);
        await this.repo.createMany(mapData, tx);
        logger.info(`Created ${mapData.length} transaction warehouse records`);
    }

    async sumQtyByOrder(order: IOrder, tx?: Prisma.TransactionClient) {
        const data = await this.repo.aggregate(
            { order_id: order.id, type: order.type === OrderType.PURCHASE ? 'in' : 'out' },
            {
                _sum: {
                    convert_quantity: true,
                },
            },
            tx,
        );
        return data._sum.convert_quantity || 0;
    }
}
