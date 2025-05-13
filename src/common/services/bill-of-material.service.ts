import { BillOfMaterialRepo } from '@common/repositories/bom.repo';
import { BaseService } from './base.service';
import { BillOfMaterials, Prisma } from '.prisma/client';
import { IIdResponse } from '@common/interfaces/common.interface';
import { ProductRepo } from '@common/repositories/product.repo';
import { IBillOfMaterial } from '@common/interfaces/bill-of-material.interface';
import { BillOfMaterialDetailRepo } from '@common/repositories/bom-detail.repo';
import { APIError } from '@common/error/api.error';
import { StatusCode, ErrorCode, ErrorKey } from '@common/errors';
import { DEFAULT_EXCLUDED_FIELDS } from '@config/app.constant';
import { UnitRepo } from '@common/repositories/unit.repo';

export class BillOfMaterialService extends BaseService<
    BillOfMaterials,
    Prisma.BillOfMaterialsSelect,
    Prisma.BillOfMaterialsWhereInput
> {
    private static instance: BillOfMaterialService;
    private productRepo: ProductRepo = new ProductRepo();
    private billOfMaterialDetailRepo: BillOfMaterialDetailRepo = new BillOfMaterialDetailRepo();
    private unitRepo: UnitRepo = new UnitRepo();

    private constructor() {
        super(new BillOfMaterialRepo());
    }

    public static getInstance(): BillOfMaterialService {
        if (!this.instance) {
            this.instance = new BillOfMaterialService();
        }
        return this.instance;
    }

    public async createBom(request: Partial<IBillOfMaterial>, tx?: Prisma.TransactionClient): Promise<IIdResponse> {
        await this.validateForeignKeys(request, {
            product_id: this.productRepo,
        });

        let bomId = 0;

        const runTransaction = async (transaction: Prisma.TransactionClient) => {
            const { details, ...bomData } = request;

            bomId = await this.repo.create(bomData as Partial<BillOfMaterials>, transaction);

            if (details && details.length > 0) {
                await this.validateForeignKeys(
                    details,
                    {
                        material_id: this.productRepo,
                        unit_id: this.unitRepo,
                    },
                    transaction,
                );

                const mappedDetails = details.map((item) => {
                    const { material_id, unit_id, ...rest } = item;
                    return {
                        ...rest,
                        material: material_id ? { connect: { id: material_id } } : undefined,
                        unit: unit_id ? { connect: { id: unit_id } } : undefined,
                        bill_of_material: bomId ? { connect: { id: bomId } } : undefined,
                    };
                });

                const filteredData = this.filterData(mappedDetails, DEFAULT_EXCLUDED_FIELDS, ['details']);

                await this.billOfMaterialDetailRepo.createMany(filteredData, transaction);
            } else {
                throw new APIError({
                    message: `common.status.${StatusCode.BAD_REQUEST}`,
                    status: ErrorCode.BAD_REQUEST,
                    errors: [`details.${ErrorKey.INVALID}`],
                });
            }
        };

        if (tx) {
            await runTransaction(tx);
        } else {
            await this.db.$transaction(async (transaction) => {
                await runTransaction(transaction);
            });
        }

        return { id: bomId };
    }

    public async updateBom(id: number, request: Partial<IBillOfMaterial>): Promise<IIdResponse> {
        await this.findById(id);

        await this.validateForeignKeys(request, {
            product_id: this.productRepo,
        });

        await this.db.$transaction(async (tx) => {
            const { details, ...bomData } = request;

            await this.repo.update({ id }, bomData as Partial<BillOfMaterials>, tx);

            if (details) {
                await this.billOfMaterialDetailRepo.deleteMany({ bom_id: id }, tx);

                if (details.length > 0) {
                    await this.validateForeignKeys(
                        details,
                        {
                            material_id: this.productRepo,
                            unit_id: this.unitRepo,
                        },
                        tx,
                    );

                    const mappedDetails = details.map((item) => {
                        const { material_id, unit_id, ...rest } = item;
                        return {
                            ...rest,
                            material: material_id ? { connect: { id: material_id } } : undefined,
                            unit: unit_id ? { connect: { id: unit_id } } : undefined,
                            bill_of_material: id ? { connect: { id: id } } : undefined,
                        };
                    });

                    const filteredData = this.filterData(mappedDetails, DEFAULT_EXCLUDED_FIELDS, ['details']);

                    await this.billOfMaterialDetailRepo.createMany(filteredData, tx);
                }
            } else {
                throw new APIError({
                    message: `common.status.${StatusCode.BAD_REQUEST}`,
                    status: ErrorCode.BAD_REQUEST,
                    errors: [`details.${ErrorKey.INVALID}`],
                });
            }
        });

        return { id };
    }
}
