import { QuotationRepo } from '@common/repositories/quotation.repo';
import { BaseService } from './base.service';
import { Quotations, Prisma } from '.prisma/client';
import { IQuotation } from '@common/interfaces/quotation.interface';
import { CommonDetailRepo } from '@common/repositories/common-detail.repo';
import { IIdResponse } from '@common/interfaces/common.interface';
import { ProductRepo } from '@common/repositories/product.repo';
import { DEFAULT_EXCLUDED_FIELDS } from '@config/app.constant';
import { PartnerRepo } from '@common/repositories/partner.repo';
import { EmployeeRepo } from '@common/repositories/employee.repo';
import { APIError } from '@common/error/api.error';
import { StatusCode, ErrorCode, ErrorKey } from '@common/errors';

export class QuotationService extends BaseService<Quotations, Prisma.QuotationsSelect, Prisma.QuotationsWhereInput> {
    private static instance: QuotationService;
    private quotatioDetailRepo: CommonDetailRepo = new CommonDetailRepo();
    private productRepo: ProductRepo = new ProductRepo();
    private partnerRepo: PartnerRepo = new PartnerRepo();
    private employeeRepo: EmployeeRepo = new EmployeeRepo();

    private constructor() {
        super(new QuotationRepo());
    }

    public static getInstance(): QuotationService {
        if (!this.instance) {
            this.instance = new QuotationService();
        }
        return this.instance;
    }

    public async createQuotation(request: Partial<IQuotation>): Promise<IIdResponse> {
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
                    const { product_id, ...rest } = item;
                    return {
                        ...rest,
                        quotation: quotationId ? { connect: { id: quotationId } } : undefined,
                        product: product_id ? { connect: { id: product_id } } : undefined,
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

    public async updateQuotation(id: number, request: Partial<IQuotation>): Promise<IIdResponse> {
        await this.findById(id);

        await this.isExist({ code: request.code, id }, true);

        await this.validateForeignKeys(request, {
            partner_id: this.partnerRepo,
            employee_id: this.employeeRepo,
        });

        await this.db.$transaction(async (tx) => {
            const { details, ...quotationData } = request;

            await this.repo.update({ id }, quotationData as Partial<Quotations>, tx);

            if (details) {
                await this.quotatioDetailRepo.deleteMany({ quotation_id: id }, tx);

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
                            quotation: id ? { connect: { id } } : undefined,
                            product: product_id ? { connect: { id: product_id } } : undefined,
                        };
                    });

                    const filteredData = this.filterData(mappedDetails, DEFAULT_EXCLUDED_FIELDS, ['details']);

                    await this.quotatioDetailRepo.createMany(filteredData, tx);
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
