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
                        product_id: this.productRepo,
                    },
                    tx,
                );

                const mappedDetails = details.map((item) => {
                    const { product_id, ...rest } = item;
                    return {
                        ...rest,
                        purchase_request: purchaseRequestId ? { connect: { id: purchaseRequestId } } : undefined,
                        product: product_id ? { connect: { id: product_id } } : undefined,
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
        await this.findById(id);

        await this.isExist({ code: request.code, id }, true);

        await this.validateForeignKeys(request, {
            employee_id: this.employeeRepo,
        });

        await this.db.$transaction(async (tx) => {
            const { details, ...quotationData } = request;

            await this.repo.update({ id }, quotationData as Partial<Quotations>, tx);

            if (details) {
                await this.purchaseRequestDetailRepo.deleteMany({ purchase_request_id: id }, tx);

                if (details.length > 0) {
                    await this.validateForeignKeys(
                        details,
                        {
                            product_id: this.productRepo,
                        },
                        tx,
                    );

                    const mappedDetails = details.map((item) => {
                        const { product_id, ...rest } = item;
                        return {
                            ...rest,
                            purchase_request: id ? { connect: { id } } : undefined,
                            product: product_id ? { connect: { id: product_id } } : undefined,
                        };
                    });

                    const filteredData = this.filterData(mappedDetails, DEFAULT_EXCLUDED_FIELDS, ['details']);

                    await this.purchaseRequestDetailRepo.createMany(filteredData, tx);
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
