import { QuotationRepo } from '@common/repositories/quotation.repo';
import { BaseService } from './base.service';
import { Quotations, Prisma } from '.prisma/client';
import {
    IApproveRequest,
    IQueryQuotation,
    IQuotation,
    ISupplierQuotationRequest,
} from '@common/interfaces/quotation.interface';
import { CommonDetailRepo } from '@common/repositories/common-detail.repo';
import { IIdResponse, IPaginationResponse, IUpdateChildAction } from '@common/interfaces/common.interface';
import { ProductRepo } from '@common/repositories/product.repo';
import { CodeType, DEFAULT_EXCLUDED_FIELDS, PartnerType, QuotationStatus, QuotationType } from '@config/app.constant';
import { PartnerRepo } from '@common/repositories/partner.repo';
import { EmployeeRepo } from '@common/repositories/employee.repo';
import { APIError } from '@common/error/api.error';
import { StatusCode, ErrorCode, ErrorKey } from '@common/errors';
import { PurchaseRequestRepo } from '@common/repositories/purchase-request.repo';
import { CommonService } from './common.service';
import { PurchaseRequestDetailRepo } from '@common/repositories/purchase-request-details.repo';

export class QuotationService extends BaseService<Quotations, Prisma.QuotationsSelect, Prisma.QuotationsWhereInput> {
    private static instance: QuotationService;
    private quotatioDetailRepo: CommonDetailRepo = new CommonDetailRepo();
    private purchaseRequestDetailRepo: PurchaseRequestDetailRepo = new PurchaseRequestDetailRepo();
    private productRepo: ProductRepo = new ProductRepo();
    private partnerRepo: PartnerRepo = new PartnerRepo();
    private employeeRepo: EmployeeRepo = new EmployeeRepo();
    private purchaseRequestRepo: PurchaseRequestRepo = new PurchaseRequestRepo();

    private constructor() {
        super(new QuotationRepo());
    }

    public static getInstance(): QuotationService {
        if (!this.instance) {
            this.instance = new QuotationService();
        }
        return this.instance;
    }

    public async createSupplierQuotation(request: Partial<ISupplierQuotationRequest>): Promise<IIdResponse> {
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

                await this.quotatioDetailRepo.createMany(newDetailData, tx);
            }
        });

        return { id: quotationId };
    }

    public async createCustomerQuotation(request: Partial<IQuotation>): Promise<IIdResponse> {
        let quotationId: number = 0;

        await this.isExist({ code: request.code });

        await this.validateForeignKeys(request, {
            partner_id: this.partnerRepo,
            employee_id: this.employeeRepo,
        });

        await this.db.$transaction(async (tx) => {
            const { details, ...quotationData } = request;

            quotationId = await this.repo.create(quotationData as Partial<Quotations>, tx);

            if (details && details.length > 0) {
                await this.validateForeignKeys(
                    details,
                    {
                        product_id: this.productRepo,
                    },
                    tx,
                );

                const mappedDetails = details.map((item) => {
                    const { product_id, unit_id, ...rest } = item;
                    return {
                        ...rest,
                        quotation: quotationId ? { connect: { id: quotationId } } : undefined,
                        product: product_id ? { connect: { id: product_id } } : undefined,
                        unit: unit_id ? { connect: { id: unit_id } } : undefined,
                    };
                });

                const filteredData = this.filterData(mappedDetails, DEFAULT_EXCLUDED_FIELDS, ['details']);
                await this.quotatioDetailRepo.createMany(filteredData, tx);
            } else {
                throw new APIError({
                    message: `common.status.${StatusCode.BAD_REQUEST}`,
                    status: ErrorCode.BAD_REQUEST,
                    errors: [`details.${ErrorKey.INVALID}`],
                });
            }
        });

        return { id: quotationId };
    }

    public async updateQuotationEntity(id: number, request: Partial<IQuotation>): Promise<IIdResponse> {
        await this.findById(id);

        await this.isExist({ code: request.code, id }, true);

        await this.validateForeignKeys(request, {
            partner_id: this.partnerRepo,
            employee_id: this.employeeRepo,
        });

        const { delete: deteleItems, update, add, ...body } = request;

        await this.db.$transaction(async (tx) => {
            await this.repo.update({ id }, body as Partial<IQuotation>, tx);

            const detailItems = [...(request.add || []), ...(request.update || [])];
            if (detailItems.length > 0) {
                await this.validateForeignKeys(
                    detailItems,
                    {
                        product_id: this.productRepo,
                        unit_id: this.productRepo,
                    },
                    tx,
                );
            }

            const mappedDetails: IUpdateChildAction = {
                add: this.mapDetails(request.add || [], { quotation_id: id }),
                update: this.mapDetails(request.update || [], { quotation_id: id }),
                delete: request.delete,
            };

            const filteredData = {
                add: this.filterData(mappedDetails.add, DEFAULT_EXCLUDED_FIELDS, ['key']),
                update: this.filterData(mappedDetails.update, DEFAULT_EXCLUDED_FIELDS, ['key']),
                delete: mappedDetails.delete,
            };

            if (
                filteredData.add.length > 0 ||
                filteredData.update.length > 0 ||
                (filteredData.delete?.length || 0) > 0
            ) {
                await this.updateChildEntity(filteredData, this.quotatioDetailRepo, tx);
            }
        });

        return { id };
    }

    public async paginate(query: IQueryQuotation): Promise<IPaginationResponse> {
        const { isMain, type, ...otherQuery } = query;
        const where: any = { ...otherQuery };

        if (type === QuotationType.SUPPLIER) {
            where.type = type;

            if (isMain === true) {
                where.NOT = { purchase_request_id: null };
            } else if (isMain === false) {
                where.purchase_request_id = null;
            }
        }

        const data = await this.repo.paginate(where, true);
        return data;
    }

    public async approve(id: number, request: IApproveRequest): Promise<IIdResponse> {
        const quotation = await this.repo.findOne({ id });
        if (!quotation) {
            throw new APIError({
                message: 'common.not_found',
                status: ErrorCode.BAD_REQUEST,
                errors: [`id.${ErrorKey.NOT_FOUND}`],
            });
        } else if (quotation.status !== QuotationStatus.PENDING) {
            throw new APIError({
                message: 'common.not_found',
                status: ErrorCode.BAD_REQUEST,
                errors: [`status.${ErrorKey.INVALID}`],
            });
        }
        await this.repo.update({ id }, request);
        return { id };
    }
}
