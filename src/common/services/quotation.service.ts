import { QuotationRepo } from '@common/repositories/quotation.repo';
import { BaseService } from './master/base.service';
import { Quotations, Prisma } from '.prisma/client';
import {
    ICreateOrderFromQuotation,
    IQueryQuotation,
    IQuotation,
    ISupplierQuotationRequest,
} from '@common/interfaces/quotation.interface';
import { CommonDetailRepo } from '@common/repositories/common-detail.repo';
import { IApproveRequest, ICommonDetails, IIdResponse, IPaginationResponse } from '@common/interfaces/common.interface';
import { ProductRepo } from '@common/repositories/product.repo';
import {
    CodeType,
    CommonApproveStatus,
    OrderStatus,
    OrderType,
    PartnerType,
    QuotationStatus,
    QuotationType,
} from '@config/app.constant';
import { PartnerRepo } from '@common/repositories/partner.repo';
import { EmployeeRepo } from '@common/repositories/employee.repo';
import { APIError } from '@common/error/api.error';
import { ErrorCode, ErrorKey } from '@common/errors';
import { PurchaseRequestRepo } from '@common/repositories/purchase-request.repo';
import { CommonService } from './common.service';
import { PurchaseRequestDetailRepo } from '@common/repositories/purchase-request-details.repo';
import { UnitRepo } from '@common/repositories/unit.repo';
import { handleFiles } from '@common/helpers/handle-files';
import { QuotationRequestDetailRepo } from '@common/repositories/quotation-request-detail.repo';
import { ICommission } from '@common/interfaces/commission.interface';
import { CommissionService } from './commission.service';
import { OrderRepo } from '@common/repositories/order.repo';
import logger from '@common/logger';
import { ShippingPlanRepo } from '@common/repositories/shipping-plan.repo';
import { FacilityOrderRepo } from '@common/repositories/facility-order.repo';
import { QueueService } from './queue.service';
import { CREATE_ORDER_FROM_QUOTATION_JOB } from '@config/job.constant';
import eventbus from '@common/eventbus';
import { EVENT_DELETE_UNUSED_FILES } from '@config/event.constant';

export class QuotationService extends BaseService<Quotations, Prisma.QuotationsSelect, Prisma.QuotationsWhereInput> {
    private static instance: QuotationService;
    private quotationDetailRepo: CommonDetailRepo = new CommonDetailRepo();
    private purchaseRequestDetailRepo: PurchaseRequestDetailRepo = new PurchaseRequestDetailRepo();
    private productRepo: ProductRepo = new ProductRepo();
    private unitRepo: UnitRepo = new UnitRepo();
    private partnerRepo: PartnerRepo = new PartnerRepo();
    private employeeRepo: EmployeeRepo = new EmployeeRepo();
    private purchaseRequestRepo: PurchaseRequestRepo = new PurchaseRequestRepo();
    private quotationRequestDetailRepo: QuotationRequestDetailRepo = new QuotationRequestDetailRepo();
    private commissionService: CommissionService = CommissionService.getInstance();
    private orderRepo: OrderRepo = new OrderRepo();
    private shippingPlanRepo: ShippingPlanRepo = new ShippingPlanRepo();
    private facilityOrderRepo: FacilityOrderRepo = new FacilityOrderRepo();

    private constructor() {
        super(new QuotationRepo());
    }

    static getInstance(): QuotationService {
        if (!this.instance) {
            this.instance = new QuotationService();
        }
        return this.instance;
    }

    async createSupplierQuotation(request: Partial<ISupplierQuotationRequest>): Promise<IIdResponse> {
        let quotationId: number = 0;

        await this.validateForeignKeys(request, {
            purchase_request_id: this.purchaseRequestRepo,
            employee_id: this.employeeRepo,
        });

        await this.db.$transaction(async (tx) => {
            let supplier = (await this.partnerRepo.findOne({ tax: request.tax, type: PartnerType.SUPPLIER }, false, tx))
                ?.id;
            if (!supplier) {
                const supplierCode = await CommonService.getCode(CodeType.SUPPLIER.toUpperCase());
                supplier = await this.partnerRepo.create(
                    {
                        code: supplierCode,
                        tax: request.tax,
                        name: request.organization_name,
                        address: request.address,
                        representative_phone: request.phone,
                        type: request.type,
                        representative_name: request.name,
                    },
                    tx,
                );
            } else {
                const existQuotation = await this.repo.findOne(
                    { purchase_request_id: request.purchase_request_id ?? null },
                    false,
                    tx,
                );
                let files = null,
                    quotationFiles = null;
                if (existQuotation) {
                    if (
                        (request.files && request.files.length > 0) ||
                        (request.quotation_files && request.quotation_files.length > 0)
                    ) {
                        files = this.parseJsonArray(existQuotation.files);
                        quotationFiles = this.parseJsonArray(existQuotation.quotation_files);
                        request.files?.forEach((file) => {
                            files.push(file);
                        });
                        request.quotation_files?.forEach((file) => {
                            quotationFiles.push(file);
                        });
                    }
                    await this.repo.update(
                        { id: existQuotation.id },
                        {
                            message: (existQuotation.message ?? '') + (request.message ?? ''),
                            files: files ?? existQuotation.files,
                            quotation_files: quotationFiles ?? existQuotation.quotation_files,
                        },
                        tx,
                    );

                    return { id: existQuotation.id };
                }
            }

            const {
                detail_ids: detailIds,
                address,
                phone,
                employee_id,
                tax,
                name,
                email,
                purchase_request_id,
                ...quotationData
            } = request;

            Object.assign(quotationData, {
                code: await CommonService.getCode(CodeType.QUOTATION_SUPPLIER.toUpperCase()),
                employee: employee_id ? { connect: { id: employee_id } } : undefined,
                partner: supplier ? { connect: { id: supplier } } : undefined,
                purchase_request: purchase_request_id ? { connect: { id: purchase_request_id } } : undefined,
            });

            quotationId = await this.repo.create(quotationData as Partial<Quotations>, tx);

            if (detailIds && detailIds.length > 0) {
                const newDetailData = await Promise.all(
                    detailIds.map(async (idItem) => {
                        const purchaseRequest = await this.purchaseRequestDetailRepo.findOne({ id: idItem });
                        if (!purchaseRequest) {
                            throw new APIError({
                                message: 'common.not-found',
                                status: ErrorCode.BAD_REQUEST,
                                errors: [`id_${idItem}.${ErrorKey.NOT_FOUND}`],
                            });
                        }
                        const { id, unit_id, material_id, ...details } = purchaseRequest;
                        Object.assign(details, {
                            product: { connect: { id: material_id } },
                            unit: { connect: { id: unit_id } },
                            quotation: { connect: { id: quotationId } },
                        });
                        return details;
                    }),
                );

                await this.quotationDetailRepo.createMany(newDetailData, tx);
            }
        });

        return { id: quotationId };
    }

    async createCustomerQuotation(empId: number, request: IQuotation): Promise<IIdResponse> {
        let quotationId: number = 0;

        try {
            await this.db.$transaction(async (tx) => {
                // await this.isExist({ code: request.code }, false, tx);
                await this.validateForeignKeys(
                    request,
                    {
                        partner_id: this.partnerRepo,
                        employee_id: this.employeeRepo,
                    },
                    tx,
                );

                const {
                    details,
                    files_add,
                    files_delete,
                    shipping_plans,
                    facility_orders,
                    facility_order_add,
                    facility_order_update,
                    facility_order_delete,
                    add,
                    update,
                    delete: deletedIds,
                    shipping_plans_add,
                    shipping_plans_delete,
                    shipping_plans_update,
                    ...quotationData
                } = request;
                const mainData = this.autoMapConnection([{ ...quotationData, employee_id: empId || null }]);
                quotationId = await this.repo.create(mainData[0], tx);

                await this.validateForeignKeys(
                    details,
                    {
                        product_id: this.productRepo,
                        unit_id: this.unitRepo,
                        material_id: this.productRepo,
                    },
                    tx,
                );

                // handle details
                let bulkCommissions: ICommission[] = [];
                for (const detail of details) {
                    const { commissions, commissions_add, commissions_update, commissions_delete, ...restDetail } =
                        detail;
                    const mapDetail = this.autoMapConnection([restDetail], { quotation_id: quotationId });
                    const detailId = await this.quotationDetailRepo.create(mapDetail[0], tx);
                    const tempCommissions = (commissions || []).map((x) => ({
                        ...x,
                        quotation_request_detail_id: restDetail.quotation_request_detail_id,
                        quotation_detail_id: detailId,
                    }));
                    bulkCommissions.push(...tempCommissions);
                }

                // insert bulk commission
                const mapCommissions = this.autoMapConnection(bulkCommissions);
                await this.commissionService.createMany(mapCommissions, tx);

                // shipping plan
                if (shipping_plans && shipping_plans.length > 0) {
                    const mapShippingPlans = this.autoMapConnection(shipping_plans, { quotation_id: quotationId });
                    await this.shippingPlanRepo.createMany(mapShippingPlans, tx);
                }

                // facility orders
                if (facility_orders && facility_orders.length > 0) {
                    await this.validateForeignKeys(
                        facility_orders,
                        {
                            facility_id: this.productRepo,
                        },
                        tx,
                    );

                    const facilityOrders = facility_orders.map((order) => {
                        const { commissions, commissions_add, commissions_update, commissions_delete, ...restOrder } =
                            order;
                        return {
                            ...restOrder,
                        };
                    });
                    // Tạo facility orders
                    const mapFacilityOrders = this.autoMapConnection(facilityOrders, { quotation_id: quotationId });
                    const createdIds = await this.facilityOrderRepo.createMany(mapFacilityOrders, tx);

                    // Xử lý commissions cho từng facility order
                    let bulkCommissions: ICommission[] = [];
                    facility_orders.forEach((order, idx) => {
                        if (order.commissions && Array.isArray(order.commissions) && createdIds[idx]) {
                            const facilityOrderId =
                                typeof createdIds[idx] === 'object' && createdIds[idx]?.id
                                    ? createdIds[idx].id
                                    : createdIds[idx];
                            const commissionsWithOrderId = order.commissions.map((c: any) => ({
                                ...c,
                                facility_order_id: facilityOrderId,
                            }));
                            bulkCommissions.push(...commissionsWithOrderId);
                        }
                    });
                    if (bulkCommissions.length > 0) {
                        await this.commissionService.createMany(bulkCommissions, tx);
                    }
                }
            });

            return { id: quotationId };
        } catch (error) {
            eventbus.emit(EVENT_DELETE_UNUSED_FILES, request.files);
            throw error;
        }
    }

    private validateCommissionItems(commissions: ICommission[] | undefined): void {
        if (!commissions || commissions.length === 0) return;

        const firstItem = commissions[0];
        const hasPrice = firstItem.price != null && firstItem.price !== 0;
        const hasQuantity = firstItem.quantity != null && firstItem.quantity !== 0;

        if (hasPrice && hasQuantity) {
            logger.warn('Rule 1: If first item has both price and quantity, only allow 1 item');
            if (commissions.length > 1) {
                throw new APIError({
                    message: 'common.error',
                    status: ErrorCode.BAD_REQUEST,
                    errors: [`commissions.${ErrorKey.INVALID}`],
                });
            }
            return;
        }

        if (hasPrice) {
            for (let i = 1; i < commissions.length; i++) {
                if (commissions[i].price == null) {
                    logger.warn(`Rule 2: Missing price for commission item ${commissions[i].key}`);
                    throw new APIError({
                        message: 'common.error',
                        status: ErrorCode.BAD_REQUEST,
                        errors: [`price.${ErrorKey.REQUIRED}.${commissions[i].key}`],
                    });
                }
            }
        }

        if (hasQuantity) {
            for (let i = 1; i < commissions.length; i++) {
                if (commissions[i].quantity == null) {
                    logger.warn(`Rule 3: Missing quantity for commission item ${commissions[i].key}`);
                    throw new APIError({
                        message: 'common.error',
                        status: ErrorCode.BAD_REQUEST,
                        errors: [`quantity.${ErrorKey.REQUIRED}.${commissions[i].key}`],
                    });
                }
            }
        }

        if (!hasPrice && !hasQuantity) {
            logger.warn('Rule 4: If first item has neither price nor quantity, all items must have both');
            throw new APIError({
                message: 'common.error',
                status: ErrorCode.BAD_REQUEST,
                errors: [`commissions.${ErrorKey.INVALID}`],
            });
        }
    }

    public async updateQuotation(id: number, request: IQuotation): Promise<IIdResponse> {
        const {
            delete: deleteIds,
            update,
            add,
            files_add,
            files_delete,
            details,
            shipping_plans_add,
            shipping_plans_delete,
            shipping_plans_update,
            shipping_plans,
            facility_orders,
            facility_order_add,
            facility_order_update,
            facility_order_delete,
            ...restData
        } = request;

        try {
            const itemExist = await this.findById(id);
            if (!itemExist) return { id };

            await this.db.$transaction(async (tx) => {
                await this.isExist({ code: request.code, id }, true, tx);

                const isCheck = !!(restData.partner_id && restData.partner_id !== itemExist.partner_id);
                await this.validateForeignKeys(
                    request,
                    {
                        partner_id: this.partnerRepo,
                    },
                    tx,
                    isCheck,
                );

                let filesUpdate = handleFiles(files_add, files_delete, itemExist.files);
                const mainData = this.autoMapConnection([
                    { ...restData, ...(filesUpdate !== null && { files: filesUpdate }) },
                ]);
                await this.repo.update({ id }, mainData[0], tx);

                await this.handleAdd(id, add, tx);

                await this.handleUpdate(itemExist, update, tx);

                if (deleteIds && deleteIds.length > 0) {
                    await this.quotationDetailRepo.deleteMany({ id: { in: deleteIds } }, tx);
                }

                // [add] shippings
                if (shipping_plans_add && shipping_plans_add.length > 0) {
                    const mapShippingPlans = this.autoMapConnection(shipping_plans_add, { quotation_id: id });
                    await this.shippingPlanRepo.createMany(mapShippingPlans, tx);
                }

                // [update] shippings
                if (shipping_plans_update && shipping_plans_update.length > 0) {
                    await this.validateForeignKeys(
                        shipping_plans_update,
                        {
                            id: this.shippingPlanRepo,
                        },
                        tx,
                    );

                    const mapShippingPlans = this.autoMapConnection(shipping_plans_update);

                    for (const item of mapShippingPlans) {
                        const { id, ...restItem } = item;
                        await this.shippingPlanRepo.update({ id }, restItem, tx);
                    }
                }

                // [delete] shippings
                if (shipping_plans_delete && shipping_plans_delete.length > 0) {
                    await this.shippingPlanRepo.deleteMany({ id: { in: shipping_plans_delete } }, tx, false);
                }

                // [add] facility orders
                if (facility_order_add && facility_order_add.length > 0) {
                    await this.validateForeignKeys(
                        facility_order_add,
                        {
                            facility_id: this.productRepo,
                        },
                        tx,
                    );
                    const mapFacilityOrders = this.autoMapConnection(facility_order_add, { quotation_id: id });
                    await this.facilityOrderRepo.createMany(mapFacilityOrders, tx);
                }

                // [update] facility orders
                if (facility_order_update && facility_order_update.length > 0) {
                    await this.validateForeignKeys(
                        facility_order_update,
                        {
                            id: this.quotationDetailRepo,
                            facility_id: this.productRepo,
                        },
                        tx,
                    );
                    const mapFacilityOrders = this.autoMapConnection(facility_order_update);

                    for (const item of mapFacilityOrders) {
                        const { id, ...restItem } = item;
                        await this.facilityOrderRepo.update({ id }, restItem, tx);
                    }
                }

                // [delete] facility orders
                if (facility_order_delete && facility_order_delete.length > 0) {
                    await this.facilityOrderRepo.deleteMany({ id: { in: facility_order_delete } }, tx, false);
                }
            });

            // clean up file
            eventbus.emit(EVENT_DELETE_UNUSED_FILES, files_delete);

            return { id };
        } catch (error) {
            eventbus.emit(EVENT_DELETE_UNUSED_FILES, files_add);
            throw error;
        }
    }

    private async handleAdd(quotationId: number, add?: ICommonDetails[], tx?: Prisma.TransactionClient): Promise<void> {
        if (!add || add.length === 0) return;

        await this.validateForeignKeys(
            add,
            {
                product_id: this.productRepo,
                unit_id: this.productRepo,
            },
            tx,
        );
        let bulkCommissions: ICommission[] = [];
        for (const item of add) {
            const { commissions, commissions_add, commissions_update, commissions_delete, ...restItem } = item;
            const mapDetail = this.autoMapConnection([restItem], { quotation_id: quotationId });
            const detailId = await this.quotationDetailRepo.create(mapDetail[0], tx);

            const tempCommissions = (commissions || []).map((x) => ({
                ...x,
                quotation_request_detail_id: restItem.quotation_request_detail_id,
                quotation_detail_id: detailId,
            }));
            bulkCommissions.push(...tempCommissions);
        }

        await this.commissionService.createMany(bulkCommissions, tx);
    }

    private async handleUpdate(
        itemExist: Partial<Quotations>,
        update?: ICommonDetails[],
        tx?: Prisma.TransactionClient,
    ): Promise<void> {
        if (!update || update.length === 0) return;

        const isCheck = this.canCheckForeignKeys(update, itemExist, [
            'product_id',
            'unit_id',
            'quotation_request_detail_id',
        ]);
        await this.validateForeignKeys(
            update,
            {
                id: this.quotationDetailRepo,
                product_id: this.productRepo,
                unit_id: this.productRepo,
                quotation_request_detail_id: this.quotationRequestDetailRepo,
            },
            tx,
            isCheck,
        );

        let bulkCommissionAdd: ICommission[] = [];
        let bulkCommissionUpdate: ICommission[] = [];
        let bulkCommissionDelete: number[] = [];
        for (const item of update) {
            const {
                id,
                commissions,
                commissions_add = [],
                commissions_update = [],
                commissions_delete = [],
                ...restItem
            } = item;
            const mapDetail = this.autoMapConnection([restItem], { quotation_id: itemExist.id });
            await this.quotationDetailRepo.update({ id }, mapDetail[0], tx);

            const tempCommissions = (commissions_add || []).map((x) => ({
                ...x,
                quotation_request_detail_id: restItem.quotation_request_detail_id,
                quotation_detail_id: item.id,
            }));
            bulkCommissionAdd.push(...tempCommissions);
            bulkCommissionUpdate.push(...commissions_update);
            bulkCommissionDelete.push(...commissions_delete);
        }

        if (bulkCommissionAdd.length > 0) {
            await this.commissionService.createMany(bulkCommissionAdd, tx);
        } else if (bulkCommissionUpdate.length > 0) {
            await this.commissionService.updateMany(bulkCommissionUpdate, tx);
        } else if (bulkCommissionDelete.length > 0) {
            await this.commissionService.deleteMany(bulkCommissionDelete, tx);
        }
    }

    public async paginate(query: IQueryQuotation): Promise<IPaginationResponse> {
        const { isMain, type, ...otherQuery } = query;
        const where: any = { ...otherQuery, type };

        if (type === QuotationType.SUPPLIER) {
            where.type = type;

            if (isMain === true) {
                where.NOT = { purchase_request_id: null };
            } else if (isMain === false) {
                where.purchase_request_id = null;
                delete where.organization_id;
            }
        }

        const data = await this.repo.paginate(where, true);
        return data;
    }

    public async updateQuotationSupplier(id: number, body: IApproveRequest): Promise<IIdResponse> {
        await this.update(id, {
            status: body.status as unknown as QuotationStatus,
            rejected_reason: body.rejected_reason,
        });
        return { id };
    }

    public async approve(id: number, body: IApproveRequest): Promise<IIdResponse> {
        const quotation = await this.repo.findFirst({ id }, true);
        if (!quotation || !quotation.status) return { id };

        if (quotation.type === QuotationType.SUPPLIER) {
            return this.updateQuotationSupplier(id, body);
        }

        const statusMap: any = {
            confirmed: {
                pending: 'customer_pending',
                customer_pending: 'confirmed',
            },
            rejected: {
                pending: 'rejected',
                customer_pending: 'customer_rejected',
            },
        };

        if (!statusMap[body.status][quotation.status]) {
            throw new APIError({
                message: 'common.error',
                status: ErrorCode.BAD_REQUEST,
                errors: [`status.${ErrorKey.INVALID}`],
            });
        }

        const { files, ...restData } = body;
        let dataToUpdate: any = { ...restData };
        if (files && files.length > 0) {
            let filesUpdate = handleFiles(files, [], quotation?.files || []);
            dataToUpdate.files = filesUpdate;
        }
        await this.repo.update({ id }, { ...dataToUpdate, status: statusMap[body.status][quotation.status!] });

        if (statusMap[body.status][quotation.status!] === CommonApproveStatus.CONFIRMED) {
            logger.info('create new order commercial');
            // nếu khách hàng đồng ý => tạo đơn hàng thương mại
            await (
                await QueueService.getQueue(CREATE_ORDER_FROM_QUOTATION_JOB)
            ).add(CREATE_ORDER_FROM_QUOTATION_JOB, { id });
        }

        return { id };
    }

    public async createOrderFromQuotation(id: number): Promise<void> {
        const quotation = await this.repo.findFirst({ id }, true);
        if (!quotation) {
            logger.error(`Quotation with id ${id} not found`);
            return;
        }

        await this.db.$transaction(async (tx) => {
            const orderData: any = {
                type: OrderType.COMMERCIAL,
                code: await CommonService.getCode(CodeType.ORDER.toUpperCase()),
                status: OrderStatus.CONFIRMED,
                partner_id: quotation.partner_id ?? undefined,
                organization_id: quotation.organization_id ?? undefined,
                employee_id: quotation.employee_id ?? undefined,
                files: quotation?.files || [],
                product_quality: quotation?.product_quality,
                delivery_location: quotation?.delivery_location,
                delivery_method: quotation?.delivery_method,
                delivery_time: quotation?.delivery_time,
                payment_note: quotation?.payment_note,
                additional_note: quotation?.additional_note,
            };

            const mapOrderData = this.autoMapConnection([orderData]);
            const orderId = await this.orderRepo.create(mapOrderData[0], tx);

            // order details
            const dataDetails = (quotation as any)?.details?.map((x: any) => {
                return {
                    id: x.id,
                    order_id: orderId,
                };
            });
            await this.quotationDetailRepo.updateMany(dataDetails, tx);

            // shipping plans
            const dataShippingPlans = (quotation as any)?.shipping_plans?.map((x: any) => {
                return {
                    id: x.id,
                    order_id: orderId,
                };
            });

            // facility orders
            const dataFacilityOrders = (quotation as any)?.facility_orders?.map((x: any) => {
                return {
                    id: x.id,
                    order_id: orderId,
                };
            });
            await this.facilityOrderRepo.updateMany(dataFacilityOrders, tx);

            await this.shippingPlanRepo.updateMany(dataShippingPlans, tx);
        });
    }
}
