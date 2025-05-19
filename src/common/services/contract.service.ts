import { BaseService } from './base.service';
import { Contracts, Prisma } from '.prisma/client';
import {
    IIdResponse,
    IPaginationInput,
    IPaginationResponse,
    IUpdateChildAction,
} from '@common/interfaces/common.interface';
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
import { UnitRepo } from '@common/repositories/unit.repo';
import { transformDecimal } from '@common/helpers/transform.util';

export class ContractService extends BaseService<Contracts, Prisma.ContractsSelect, Prisma.ContractsWhereInput> {
    private static instance: ContractService;
    private contractDetailRepo: CommonDetailRepo = new CommonDetailRepo();
    private partnerRepo: PartnerRepo = new PartnerRepo();
    private employeeRepo: EmployeeRepo = new EmployeeRepo();
    private organizationRepo: OrganizationRepo = new OrganizationRepo();
    private productRepo: ProductRepo = new ProductRepo();
    private unitRepo: UnitRepo = new UnitRepo();

    private constructor() {
        super(new ContractRepo());
    }

    public static getInstance(): ContractService {
        if (!this.instance) {
            this.instance = new ContractService();
        }
        return this.instance;
    }

    public async createContract(request: Partial<IContract>, tx?: Prisma.TransactionClient): Promise<IIdResponse> {
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
            const { details, ...contractData } = request;

            contractId = await this.repo.create(contractData as Partial<Contracts>, transaction);

            if (details && details.length > 0) {
                await this.validateForeignKeys(
                    details,
                    {
                        product_id: this.productRepo,
                        unit_id: this.unitRepo,
                    },
                    transaction,
                );

                const mappedDetails = details.map((item) => {
                    const { product_id, unit_id, ...rest } = item;
                    return {
                        ...rest,
                        contract: contractId ? { connect: { id: contractId } } : undefined,
                        product: product_id ? { connect: { id: product_id } } : undefined,
                        unit: unit_id ? { connect: { id: unit_id } } : undefined,
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
                            unit_id: this.unitRepo,
                        },
                        tx,
                    );

                    const mappedDetails = details.map((item) => {
                        const { product_id, unit_id, ...rest } = item;
                        return {
                            ...rest,
                            contract: id ? { connect: { id } } : undefined,
                            product: product_id ? { connect: { id: product_id } } : undefined,
                            unit: unit_id ? { connect: { id: unit_id } } : undefined,
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

    public async updateContractEntity(id: number, request: Partial<IContract>): Promise<IIdResponse> {
        await this.findById(id);

        await this.isExist({ code: request.code, id }, true);

        await this.validateForeignKeys(request, {
            partner_id: this.partnerRepo,
            employee_id: this.employeeRepo,
            organization_id: this.organizationRepo,
        });

        const { delete: deteleItems, update, add, ...body } = request;

        await this.db.$transaction(async (tx) => {
            await this.repo.update({ id }, body as Partial<IContract>, tx);

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
                add: this.mapDetails(request.add || [], { contract_id: id }),
                update: this.mapDetails(request.update || [], { contract_id: id }),
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
                await this.updateChildEntity(filteredData, this.contractDetailRepo, tx);
            }
        });

        return { id };
    }

    public async paginate(query: IPaginationInput): Promise<IPaginationResponse> {
        const result = await this.repo.paginate(query, true);
        const data = this.enrichOrderTotals(result);
        return transformDecimal(data);
    }
}
