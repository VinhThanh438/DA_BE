import {
    IEventProductHistoryUpdated,
    IProduct,
    IUpdateProduct,
    IWarehouseProduct,
} from '@common/interfaces/product.interface';
import { IIdResponse, IPaginationInput, IPaginationResponse } from '@common/interfaces/common.interface';
import { EVENT_PRODUCT_HISTORY_UPDATED } from '@config/event.constant';
import { ProductRepo } from '@common/repositories/product.repo';
import { UnitRepo } from '@common/repositories/unit.repo';
import { ErrorKey, StatusCode } from '@common/errors';
import { APIError } from '@common/error/api.error';
import { Prisma, Products } from '.prisma/client';
import { BaseService } from './master/base.service';
import eventbus from '@common/eventbus';
import { StockTrackingRepo } from '@common/repositories/stock-tracking.repo';
import { InventoryDetailRepo } from '@common/repositories/inventory-detail.repo';
import { InventoryRepo } from '@common/repositories/inventory.repo';
import { TransactionWarehouseRepo } from '@common/repositories/transaction-warehouse.repo';
import { TransactionType } from '@config/app.constant';
import { IStockTracking } from '@common/interfaces/stock-tracking.interface';

export class ProductService extends BaseService<Products, Prisma.ProductsSelect, Prisma.ProductsWhereInput> {
    private static instance: ProductService;
    private unitRepo: UnitRepo = new UnitRepo();
    private stockTrackingRepo: StockTrackingRepo = new StockTrackingRepo();
    private inventoryDetailRepo: InventoryDetailRepo = new InventoryDetailRepo();
    private inventoryRepo: InventoryRepo = new InventoryRepo();
    private transactionWarehouseRepo: TransactionWarehouseRepo = new TransactionWarehouseRepo();
    // private productDetailService: ProductDetailService = ProductDetailService.getInstance();

    private constructor() {
        super(new ProductRepo());
    }

    private validateUnit(unitNotFoundOrExisted: string[], message: string) {
        const formattedErrors: string[] = [];

        for (const item of unitNotFoundOrExisted) {
            if (item === '0') {
                formattedErrors.push(`${message}`);
            } else {
                formattedErrors.push(`${message}.${item}`);
            }
        }
        if (unitNotFoundOrExisted.length > 0) {
            throw new APIError({
                message: message,
                status: StatusCode.BAD_REQUEST,
                errors: formattedErrors,
            });
        }
    }

    public static getInstance(): ProductService {
        if (!this.instance) {
            this.instance = new ProductService();
        }
        return this.instance;
    }

    async updateProduct(id: number, body: IUpdateProduct): Promise<IIdResponse> {
        // await this.isExist({ code: body.code, id }, true);
        const unitNotFound: string[] = [];
        const unitExisted: string[] = [];
        const unit = await this.unitRepo.findOne({ id: id });
        if (!unit) {
            unitNotFound.push('0');
        }
        if (body?.add) {
            for (const unit of body.add) {
                const notFound = await this.unitRepo.findOne({ id: unit.unit_id });
                if (!notFound) {
                    unitExisted.push(unit.key);
                }
            }
        }
        if (body?.delete) {
            for (const unit of body.delete) {
                const notFound = await this.unitRepo.findOne({ id: unit.unit_id });
                if (!notFound) {
                    unitNotFound.push(String(unit.key));
                }
            }
        }
        if (body?.update) {
            for (const unit of body.update) {
                const notFound = await this.unitRepo.findOne({ id: unit.unit_id });
                if (!notFound) {
                    unitNotFound.push(String(unit.key));
                }
            }
        }

        let product = null;

        if (body.product_group_id) {
            product = await this.repo.findOne({ id: body.product_group_id });
            if (!product) {
                throw new APIError({
                    message: 'product_group.not_found',
                    status: StatusCode.BAD_REQUEST,
                    errors: [`product_group.${ErrorKey.NOT_FOUND}`],
                });
            }

            (body as any).product_group = { connect: { id: body.product_group_id } };
            delete body.product_group_id;
        }

        if (body.unit_id) {
            (body as any).unit = { connect: { id: body.unit_id } };
            delete body.unit_id;
        }

        if (unitNotFound && unitNotFound.length > 0) {
            this.validateUnit(unitExisted, 'unit_id.existed');
        }

        const output = await this.db.$transaction(async (tx) => {
            const { delete: del, add, update, ...mapperProduct } = body;
            const extra_units = { add, update, delete: body.delete };
            const updateProductId = await this.repo.update({ id: id }, mapperProduct, tx);

            // if have product details
            // await this.handleProductDetails(id, details_add, details_update, details_delete, tx);

            await this.handleParentProduct(id, body.code, tx);

            if (extra_units?.add && extra_units.add.length > 0) {
                const unitsToAdd = extra_units.add.map(({ key, ...mapper }) => {
                    return { product_id: updateProductId, ...mapper };
                });
                await tx.productUnits.createMany({ data: unitsToAdd });
            } else if (extra_units?.delete && extra_units.delete.length > 0) {
                for (const item of extra_units.delete) {
                    await tx.productUnits.delete({ where: { id: item.unit_id } });
                }
            } else if (extra_units?.update && extra_units.update.length > 0) {
                const unitsToUpdate = extra_units.update.map(({ key, ...mapper }) => {
                    return mapper;
                });
                for (const item of unitsToUpdate) {
                    await tx.productUnits.update({
                        where: { id: item.unit_id },
                        data: { conversion_rate: item.conversion_rate },
                    });
                }
            }
            return updateProductId;
        });

        if (product && body.current_price && body.current_price !== Number(product.current_price)) {
            eventbus.emit(EVENT_PRODUCT_HISTORY_UPDATED, {
                id: id,
                current_price: body.current_price,
            } as IEventProductHistoryUpdated);
        }

        return { id: output };
    }

    async createProduct(body: IProduct): Promise<IIdResponse> {
        const unitNotFound: string[] = [];
        const unit = await this.unitRepo.findOne({ id: body.unit_id });
        if (!unit) {
            unitNotFound.push('0');
        }
        if (body.extra_units) {
            for (const unit of body.extra_units) {
                const notFound = await this.unitRepo.findOne({ id: unit.unit_id });
                if (!notFound) {
                    unitNotFound.push(unit.key);
                }
            }
        }
        if (unitNotFound && unitNotFound.length > 0) {
            this.validateUnit(unitNotFound, 'unit_id.not_found');
        }

        const extra_units: any =
            body.extra_units && body.extra_units.length > 0
                ? {
                      create: body.extra_units.map((item) => ({
                          unit: { connect: { id: item.unit_id } },
                          conversion_rate: item.conversion_rate,
                      })),
                  }
                : [];
        const checkUnit = body.extra_units?.some((item) => {
            return item.unit_id === body.unit_id;
        });
        if (checkUnit) {
            throw new APIError({
                message: 'common.invalid',
                status: StatusCode.BAD_REQUEST,
                errors: [`extra_units.${ErrorKey.INVALID}`],
            });
        }
        if (extra_units.length === 0) {
            delete body.extra_units;
        } else {
            body.extra_units = extra_units;
        }

        const { ...restData } = body;
        const mapData = this.autoMapConnection([restData]);
        const productId = await this.repo.create(mapData[0]);

        // await this.productDetailService.createMany(details)

        // update product parent id
        await this.handleParentProduct(productId, body.code);

        eventbus.emit(EVENT_PRODUCT_HISTORY_UPDATED, {
            id: productId,
            current_price: body.current_price,
        } as IEventProductHistoryUpdated);

        return { id: productId };
    }

    private async handleParentProduct(productId: number, code?: string, tx?: Prisma.TransactionClient) {
        if (!code) return;
        const productParent = await this.repo.findOne({ code, id: { not: productId } }, false, tx);
        if (productParent) {
            await this.repo.update({ id: productId }, { parent_id: productParent.id }, tx);
        }
    }

    // public product
    public async search(query: IPaginationInput): Promise<IPaginationResponse> {
        const data = await this.repo.paginate(query, true);
        return data;
    }

    public async paginate(query: IPaginationInput): Promise<IPaginationResponse> {
        const result = await this.repo.paginate(query, true);
        result.data = this.transformProductDataStock(result.data, query.warehouseId);
        return result;
    }

    private transformProductDataStock(data: IProduct[], warehouseId: number): IProduct[] {
        return data.map((product) => {
            const value =
                (product.stock_trackings || []).length > 0 ? product.stock_trackings : product.stock_trackings_child;
            let stockTrackings: IStockTracking[] = value || [];
            if (warehouseId) {
                stockTrackings = stockTrackings.filter((x: IStockTracking) => x.warehouse_id === warehouseId);
            }

            const totalBalance = stockTrackings.reduce((sum, tracking) => {
                return sum + tracking.current_balance;
            }, 0);

            return {
                ...product,
                stock_trackings: stockTrackings,
                current_balance: totalBalance,
            };
        });
    }
}
