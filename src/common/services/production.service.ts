import { ProductionRepo } from '@common/repositories/production.repo';
import { BaseService } from './base.service';
import { Productions, Prisma, Quotations } from '.prisma/client';
import { IIdResponse } from '@common/interfaces/common.interface';
import { IProduction } from '@common/interfaces/production.interface';
import { ProductionDetailRepo } from '@common/repositories/production-detail.repo';
import { EmployeeRepo } from '@common/repositories/employee.repo';
import { PartnerRepo } from '@common/repositories/partner.repo';
import { DEFAULT_EXCLUDED_FIELDS } from '@config/app.constant';
import { OrganizationRepo } from '@common/repositories/organization.repo';
import { ProductRepo } from '@common/repositories/product.repo';
import { APIError } from '@common/error/api.error';
import { StatusCode, ErrorCode, ErrorKey } from '@common/errors';

export class ProductionService extends BaseService<Productions, Prisma.ProductionsSelect, Prisma.ProductionsWhereInput> {
    private static instance: ProductionService;
    private productionDetailRepo: ProductionDetailRepo = new ProductionDetailRepo();
    private partnerRepo: PartnerRepo = new PartnerRepo();
    private employeeRepo: EmployeeRepo = new EmployeeRepo();
    private organizationRepo: OrganizationRepo = new OrganizationRepo();
    private productRepo: ProductRepo = new ProductRepo();

    private constructor() {
        super(new ProductionRepo());
    }

    public static getInstance(): ProductionService {
        if (!this.instance) {
            this.instance = new ProductionService();
        }
        return this.instance;
    }

    public async createProduction(request: Partial<IProduction>, tx?: Prisma.TransactionClient): Promise<IIdResponse> {
        const runTransaction = async (transaction: Prisma.TransactionClient) => {
            await this.isExist({ code: request.code }, false, transaction);

            await this.validateForeignKeys(
                request,
                {
                    partner_id: this.partnerRepo,
                    employee_id: this.employeeRepo,
                    organization_id: this.organizationRepo,
                },
                transaction,
            );

            const { details, ...productionData } = request;

            const productionId = await this.repo.create(productionData as Partial<Productions>, transaction);

            if (!details || details.length === 0) {
                throw new APIError({
                    message: `common.status.${StatusCode.BAD_REQUEST}`,
                    status: ErrorCode.BAD_REQUEST,
                    errors: [`details.${ErrorKey.INVALID}`],
                });
            }

            await this.validateForeignKeys(
                details,
                {
                    product_id: this.productRepo,
                },
                transaction,
            );

            const mappedDetails = details.map((item) => {
                const { product_id, unit_id, ...rest } = item;
                return {
                    ...rest,
                    production: productionId ? { connect: { id: productionId } } : undefined,
                    product: product_id ? { connect: { id: product_id } } : undefined,
                    unit: unit_id ? { connect: { id: unit_id } } : undefined,
                };
            });

            const filteredData = this.filterData(mappedDetails, DEFAULT_EXCLUDED_FIELDS, ['details']);

            await this.productionDetailRepo.createMany(filteredData, transaction);

            return { id: productionId };
        };

        return tx ? runTransaction(tx) : this.db.$transaction(runTransaction);
    }

    public async updateProduction(id: number, request: Partial<IProduction>): Promise<IIdResponse> {
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
                await this.productionDetailRepo.deleteMany({ production_id: id }, tx);

                if (details.length > 0) {
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
                            production: id ? { connect: { id } } : undefined,
                            product: product_id ? { connect: { id: product_id } } : undefined,
                            unit: unit_id ? { connect: { id: unit_id } } : undefined,
                        };
                    });

                    const filteredData = this.filterData(mappedDetails, DEFAULT_EXCLUDED_FIELDS, ['details']);

                    await this.productionDetailRepo.createMany(filteredData, tx);
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