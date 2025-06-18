import { Prisma, Products } from '.prisma/client';
import { APIError } from '@common/error/api.error';
import { ErrorKey, StatusCode } from '@common/errors';

import { IIdResponse } from '@common/interfaces/common.interface';
import { IEventProductHistoryUpdated, IProduct, IUpdateProduct } from '@common/interfaces/product.interface';
import { ProductRepo } from '@common/repositories/product.repo';
import { BaseService } from './base.service';
import { UnitRepo } from '@common/repositories/unit.repo';
import { DatabaseAdapter } from '@common/infrastructure/database.adapter';
import eventbus from '@common/eventbus';
import { EVENT_PRODUCT_HISTORY_UPDATED } from '@config/event.constant';

export class ProductService extends BaseService<Products, Prisma.ProductsSelect, Prisma.ProductsWhereInput> {
    private productRepo: ProductRepo = new ProductRepo();
    public unitRepo: UnitRepo = new UnitRepo();
    public db = DatabaseAdapter.getInstance();
    private static instance: ProductService;

    constructor() {
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
    async delete(id: number): Promise<IIdResponse> {
        const exist = await this.productRepo.findOne({ id: id });
        if (!exist) {
            throw new APIError({
                message: 'common.not_found',
                status: StatusCode.BAD_REQUEST,
                errors: [`id.${ErrorKey.NOT_FOUND}`],
            });
        }
        const output = await this.productRepo.delete({ id: id });
        return { id: output };
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
            product = await this.productRepo.findOne({ id: body.product_group_id });
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

        if (Object.prototype.hasOwnProperty.call(body, 'price')) {
            body.current_price = body.price;
            delete body.price;
        }

        if (unitNotFound && unitNotFound.length > 0) {
            this.validateUnit(unitExisted, 'unit_id.existed');
        }

        const output = await this.db.$transaction(async (prisma) => {
            const { delete: del, add, update, ...mapperProduct } = body;
            const extra_units = { add, update, delete: body.delete };
            const updateProductId = await this.productRepo.update({ id: id }, mapperProduct, prisma);
            await this.handleParentProduct(id, body.code || '', prisma);

            if (extra_units?.add && extra_units.add.length > 0) {
                const unitsToAdd = extra_units.add.map(({ key, ...mapper }) => {
                    return { product_id: updateProductId, ...mapper };
                });
                await prisma.productUnits.createMany({ data: unitsToAdd });
            } else if (extra_units?.delete && extra_units.delete.length > 0) {
                for (const item of extra_units.delete) {
                    await prisma.productUnits.delete({ where: { id: item.unit_id } });
                }
            } else if (extra_units?.update && extra_units.update.length > 0) {
                const unitsToUpdate = extra_units.update.map(({ key, ...mapper }) => {
                    return mapper;
                });
                for (const item of unitsToUpdate) {
                    await prisma.productUnits.update({
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
        if (body.price) {
            body.current_price = body.price;
            delete body.price;
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

        const { product_group_id, unit_id, ...productData } = body;
        const createdId = await this.productRepo.create({
            ...productData,
            product_group: { connect: { id: product_group_id } },
            unit: { connect: { id: unit_id } },
        });
        await this.handleParentProduct(createdId, body.code || '');

        eventbus.emit(EVENT_PRODUCT_HISTORY_UPDATED, {
            id: createdId,
            current_price: body.current_price,
        } as IEventProductHistoryUpdated);

        return { id: createdId };
    }

    private async handleParentProduct(productId: number, code: string, tx?: Prisma.TransactionClient) {
        const productParent = await this.repo.findOne({ code, id: { not: productId } }, false, tx);
        if (productParent) {
            await this.repo.update({ id: productId }, { parent_id: productParent.id }, tx);
        }
    }

    async getById(id: number): Promise<Partial<Products>> {
        const output = await this.productRepo.findOne({ id: id }, true);
        if (!output) {
            throw new APIError({
                message: 'common.not_found',
                status: StatusCode.BAD_REQUEST,
                errors: [`id.${ErrorKey.NOT_FOUND}`],
            });
        }
        return output;
    }
}
