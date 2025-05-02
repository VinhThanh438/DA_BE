import { Prisma, Products } from '.prisma/client';
import { APIError } from '@common/error/api.error';
import { ErrorKey, StatusCode } from '@common/errors';
import { generateUniqueCode } from '@common/helpers/generate-unique-code.helper';

import { IIdResponse, IPaginationInput, IPaginationResponse } from '@common/interfaces/common.interface';
import { ICreateProduct, IProducts, IUpdateProduct } from '@common/interfaces/product.interface';
import { ProductRepo } from '@common/repositories/product.repo';
import { BaseService } from './base.service';
import { UnitService } from './unit.service';
import { UnitRepo } from '@common/repositories/unit.repo';
import { number } from 'joi/lib';
import { DatabaseAdapter } from '@common/infrastructure/database.adapter';

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
        await this.isExist({ code: body.code, id }, true);
        const unitNotFound: string[] = [];
        const unitExisted: string[] = [];
        const unit = await this.unitRepo.findOne({ id: id });
        if (!unit) {
            unitNotFound.push('0');
        }
        if (body.extra_units?.add) {
            for (const unit of body.extra_units.add) {
                const notFound = await this.unitRepo.findOne({ id: unit.unit_id });
                if (!notFound) {
                    unitExisted.push(unit.key);
                }
            }
        }
        if (body.extra_units?.delete) {
            for (const unit of body.extra_units.delete) {
                const notFound = await this.unitRepo.findOne({ id: unit.unit_id });
                if (!notFound) {
                    unitNotFound.push(String(unit.key));
                }
            }
        }
        if (body.extra_units?.update) {
            for (const unit of body.extra_units.update) {
                const notFound = await this.unitRepo.findOne({ id: unit.unit_id });
                if (!notFound) {
                    unitNotFound.push(String(unit.key));
                }
            }
        }
        if (unitNotFound && unitNotFound.length > 0) {
            this.validateUnit(unitNotFound, 'unit_id.not_found');
            this.validateUnit(unitExisted, 'unit_id.existed');
        }
        const output = this.db.$transaction(async (prisma) => {
            const { extra_units, ...mapperProduct } = body;

            const updateProduct = await this.productRepo.update({ id: id }, mapperProduct, prisma);
            if (extra_units?.add && extra_units.add.length > 0) {
                const unitsToAdd = extra_units.add.map(({ key, ...mapper }) => {
                    return { product_id: updateProduct, ...mapper };
                });
                await this.unitRepo.createMany(unitsToAdd, prisma);
            } else if (extra_units?.delete && extra_units.delete.length > 0) {
                for (const item of extra_units.delete) {
                    await this.unitRepo.delete({ id: item.unit_id }, prisma);
                }
            } else if (extra_units?.update && extra_units.update.length > 0) {
                const unitsToUpdate = extra_units.update.map(({ key, ...mapper }) => {
                    return mapper;
                });
                for (const item of unitsToUpdate) {
                    await this.unitRepo.update({ id: item.unit_id }, { conversion_rate: item.conversion_rate }, prisma);
                }
            }
            return updateProduct;
        });
        return { id: Number(output) };
    }

    async createProduct(body: ICreateProduct): Promise<IIdResponse> {
        await this.isExist({ code: body.code });
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

        const extra_units =
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

        const output = await this.productRepo.create({ ...body, extra_units });
        return { id: output };
    }

    async getAllProduct(body: IPaginationInput): Promise<IPaginationResponse> {
        const output = await this.productRepo.paginate(body, true);
        return output;
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
