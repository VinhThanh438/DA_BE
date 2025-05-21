import { PurchaseRequestRepo } from '@common/repositories/purchase-request.repo';
import { BaseService } from './base.service';
import { PurchaseRequests, Prisma, Quotations } from '.prisma/client';
import { APIError } from '@common/error/api.error';
import { StatusCode, ErrorCode, ErrorKey } from '@common/errors';
import { IIdResponse } from '@common/interfaces/common.interface';
import { DEFAULT_EXCLUDED_FIELDS } from '@config/app.constant';
import { IPurchaseRequest } from '@common/interfaces/purchase-request.interface';
import { EmployeeRepo } from '@common/repositories/employee.repo';
import { OrganizationRepo } from '@common/repositories/organization.repo';
import { ProductRepo } from '@common/repositories/product.repo';
import { PurchaseRequestDetailRepo } from '@common/repositories/purchase-request-details.repo';
import { ProductionRepo } from '@common/repositories/production.repo';
import { OrderRepo } from '@common/repositories/order.repo';
import { handleFiles } from '@common/helpers/handle-files';
import { UnitRepo } from '@common/repositories/unit.repo';
import { deleteFileSystem } from '@common/helpers/delete-file-system';

export class PurchaseRequestService extends BaseService<
    PurchaseRequests,
    Prisma.PurchaseRequestsSelect,
    Prisma.PurchaseRequestsWhereInput
> {
    private static instance: PurchaseRequestService;
    private purchaseRequestDetailRepo: PurchaseRequestDetailRepo = new PurchaseRequestDetailRepo();
    private employeeRepo: EmployeeRepo = new EmployeeRepo();
    private organizationRepo: OrganizationRepo = new OrganizationRepo();
    private productRepo: ProductRepo = new ProductRepo();
    private productionRepo: ProductionRepo = new ProductionRepo();
    private orderRepo: OrderRepo = new OrderRepo();
    private unitRepo: UnitRepo = new UnitRepo();

    private constructor() {
        super(new PurchaseRequestRepo());
    }

    public static getInstance(): PurchaseRequestService {
        if (!this.instance) {
            this.instance = new PurchaseRequestService();
        }
        return this.instance;
    }

    public async createPurchaseRequest(request: Partial<IPurchaseRequest>): Promise<IIdResponse> {
        let purchaseRequestId: number = 0;

        await this.isExist({ code: request.code });

        await this.validateForeignKeys(request, {
            employee_id: this.employeeRepo,
            production_id: this.productionRepo,
            order_id: this.orderRepo,
            organization_id: this.organizationRepo,
        });

        await this.db.$transaction(async (tx) => {
            const { details, ...quotationData } = request;

            purchaseRequestId = await this.repo.create(quotationData as Partial<Quotations>, tx);

            if (details && details.length > 0) {
                await this.validateForeignKeys(
                    details,
                    {
                        material_id: this.productRepo,
                    },
                    tx,
                );

                const mappedDetails = details.map((item) => {
                    const { material_id, unit_id, ...rest } = item;
                    return {
                        ...rest,
                        purchase_request: purchaseRequestId ? { connect: { id: purchaseRequestId } } : undefined,
                        material: material_id ? { connect: { id: material_id } } : undefined,
                        unit: unit_id ? { connect: { id: unit_id } } : undefined,
                    };
                });

                const filteredData = this.filterData(mappedDetails, DEFAULT_EXCLUDED_FIELDS, ['details']);
                await this.purchaseRequestDetailRepo.createMany(filteredData, tx);
            } else {
                throw new APIError({
                    message: `common.status.${StatusCode.BAD_REQUEST}`,
                    status: ErrorCode.BAD_REQUEST,
                    errors: [`details.${ErrorKey.INVALID}`],
                });
            }
        });

        return { id: purchaseRequestId };
    }

    public async updatePurchaseRequest(id: number, request: Partial<IPurchaseRequest>): Promise<IIdResponse> {
        const purchaseReqExist = await this.findById(id);

        await this.isExist({ code: request.code, id }, true);

        const { add, update, delete: deleteIds, files_add, files_delete, ...purchaseRequestData } = request;

        await this.validateForeignKeys(request, {
            employee_id: this.employeeRepo,
        });

        try {
            await this.db.$transaction(async (tx) => {
                // handle files
                let filesUpdate = handleFiles(files_add, files_delete, purchaseReqExist?.files);
                await this.repo.update(
                    { id },
                    {
                        ...purchaseRequestData,
                        ...(filesUpdate !== null && { files: filesUpdate }),
                    } as Partial<PurchaseRequests>,
                    tx,
                );

                // [add] purchase request details
                if (add && add.length > 0) {
                    await this.validateForeignKeys(
                        add,
                        {
                            material_id: this.productRepo,
                            unit_id: this.unitRepo,
                        },
                        tx,
                    );

                    const data = add.map((item) => {
                        const { key, ...rest } = item;
                        return { ...rest, purchase_request_id: id };
                    });
                    await this.purchaseRequestDetailRepo.createMany(data, tx);
                }

                // [update] purchase request details
                if (update && update.length > 0) {
                    await this.validateForeignKeys(
                        update,
                        {
                            id: this.purchaseRequestDetailRepo,
                            product_id: this.productRepo,
                            unit_id: this.unitRepo,
                        },
                        tx,
                    );

                    const data = update.map((item) => {
                        const { key, ...rest } = item;
                        return rest;
                    });
                    await this.purchaseRequestDetailRepo.updateMany(data, tx);
                }

                // [delete] order details
                if (deleteIds && deleteIds.length > 0) {
                    await this.purchaseRequestDetailRepo.deleteMany({ id: { in: deleteIds } }, tx, false);
                }
            });

            // clean up file
            if (files_delete && files_delete.length > 0) {
                deleteFileSystem(files_delete);
            }

            return { id };
        } catch (error) {
            if (files_add && files_add.length > 0) {
                deleteFileSystem(files_add);
            }
            throw error;
        }
    }
}
