import { BaseService } from './base.service';
import { Contracts, Prisma } from '.prisma/client';
import { IIdResponse } from '@common/interfaces/common.interface';
import { ContractRepo } from '@common/repositories/contract.repo';
import { IContract } from '@common/interfaces/contract.interface';
import { CommonDetailRepo } from '@common/repositories/common-detail.repo';
import { ProductRepo } from '@common/repositories/product.repo';
import { EmployeeRepo } from '@common/repositories/employee.repo';
import { OrganizationRepo } from '@common/repositories/organization.repo';
import { PartnerRepo } from '@common/repositories/partner.repo';
import { DEFAULT_EXCLUDED_FIELDS } from '@config/app.constant';
import { APIError } from '@common/error/api.error';
import { StatusCode, ErrorCode, ErrorKey } from '@common/errors';

export class ContractService extends BaseService<Contracts, Prisma.ContractsSelect, Prisma.ContractsWhereInput> {
    private static instance: ContractService;
    private contractDetailRepo: CommonDetailRepo = new CommonDetailRepo();
    private partnerRepo: PartnerRepo = new PartnerRepo();
    private employeeRepo: EmployeeRepo = new EmployeeRepo();
    private organizationRepo: OrganizationRepo = new OrganizationRepo();
    private productRepo: ProductRepo = new ProductRepo();

    private constructor() {
        super(new ContractRepo());
    }

    public static getInstance(): ContractService {
        if (!this.instance) {
            this.instance = new ContractService();
        }
        return this.instance;
    }

    public async createContract(
        request: Partial<IContract>,
        tx?: Prisma.TransactionClient,
    ): Promise<IIdResponse> {
        let contractId: number = 0;

        await this.isExist({ code: request.code });

        await this.validateForeignKeys(
            request,
            {
                partner_id: this.partnerRepo,
                employee_id: this.employeeRepo,
                organization_id: this.organizationRepo,
            },
            tx,
        );

        const runTransaction = async (transaction: Prisma.TransactionClient) => {
            const { details, ...quotationData } = request;

            contractId = await this.repo.create(quotationData as Partial<Contracts>, transaction);

            if (details && details.length > 0) {
                await this.validateForeignKeys(
                    details,
                    {
                        product_id: this.productRepo,
                    },
                    transaction,
                );

                const mappedDetails = details.map((item) => {
                    const { product_id, ...rest } = item;
                    return {
                        ...rest,
                        contract: contractId ? { connect: { id: contractId } } : undefined,
                        product: product_id ? { connect: { id: product_id } } : undefined,
                    };
                });

                const filteredData = this.filterData(mappedDetails, DEFAULT_EXCLUDED_FIELDS, ['details']);

                await this.contractDetailRepo.createMany(filteredData, transaction);
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

        return { id: contractId };
    }

    public async updateContract(id: number, request: Partial<IContract>): Promise<IIdResponse> {
        await this.findById(id);

        await this.isExist({ code: request.code, id }, true);

        await this.validateForeignKeys(request, {
            partner_id: this.partnerRepo,
            employee_id: this.employeeRepo,
            organization_id: this.organizationRepo,
        });

        await this.db.$transaction(async (tx) => {
            const { details, ...quotationData } = request;

            await this.repo.update({ id }, quotationData as Partial<Contracts>, tx);

            if (details) {
                await this.contractDetailRepo.deleteMany({ contract_id: id }, tx);

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
                            contract: id ? { connect: { id } } : undefined,
                            product: product_id ? { connect: { id: product_id } } : undefined,
                        };
                    });

                    const filteredData = this.filterData(mappedDetails, DEFAULT_EXCLUDED_FIELDS, ['details']);

                    await this.contractDetailRepo.createMany(filteredData, tx);
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
