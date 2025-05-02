import { BaseService } from './base.service';
import { Invoices, Prisma } from '.prisma/client';
import { IIdResponse } from '@common/interfaces/common.interface';
import { CommonDetailRepo } from '@common/repositories/common-detail.repo';
import { InvoiceRepo } from '@common/repositories/invoice.repo';
import { IInvoice } from '@common/interfaces/invoice.interface';
import { EmployeeRepo } from '@common/repositories/employee.repo';
import { PartnerRepo } from '@common/repositories/partner.repo';
import { ProductRepo } from '@common/repositories/product.repo';
import { DEFAULT_EXCLUDED_FIELDS } from '@config/app.constant';
import { BankRepo } from '@common/repositories/bank.repo';
import { ContractRepo } from '@common/repositories/contract.repo';
import { APIError } from '@common/error/api.error';
import { StatusCode, ErrorCode, ErrorKey } from '@common/errors';

export class InvoiceService extends BaseService<Invoices, Prisma.InvoicesSelect, Prisma.InvoicesWhereInput> {
    private static instance: InvoiceService;
    private invoiceDetailRepo: CommonDetailRepo = new CommonDetailRepo();
    private productRepo: ProductRepo = new ProductRepo();
    private partnerRepo: PartnerRepo = new PartnerRepo();
    private employeeRepo: EmployeeRepo = new EmployeeRepo();
    private bankRepo: BankRepo = new BankRepo();
    private contractRepo: ContractRepo = new ContractRepo();

    private constructor() {
        super(new InvoiceRepo());
    }

    public static getInstance(): InvoiceService {
        if (!this.instance) {
            this.instance = new InvoiceService();
        }
        return this.instance;
    }

    public async createInvoice(request: Partial<IInvoice>, tx?: Prisma.TransactionClient): Promise<IIdResponse> {
        let invoiceId: number = 0;

        await this.isExist({ code: request.code });

        await this.validateForeignKeys(
            request,
            {
                partner_id: this.partnerRepo,
                employee_id: this.employeeRepo,
                bank_id: this.bankRepo,
                contract_id: this.contractRepo,
            },
            tx,
        );

        const runTransaction = async (transaction: Prisma.TransactionClient) => {
            const { details, ...invoiceData } = request;

            invoiceId = await this.repo.create(invoiceData as Partial<Invoices>, transaction);

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
                        invoice: invoiceId ? { connect: { id: invoiceId } } : undefined,
                        product: product_id ? { connect: { id: product_id } } : undefined,
                    };
                });

                const filteredData = this.filterData(mappedDetails, DEFAULT_EXCLUDED_FIELDS, ['details']);
                await this.invoiceDetailRepo.createMany(filteredData, transaction);
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

        return { id: invoiceId };
    }

    public async updateInvoice(id: number, request: Partial<IInvoice>): Promise<IIdResponse> {
        await this.findById(id);

        await this.isExist({ code: request.code, id }, true);

        await this.validateForeignKeys(request, {
            partner_id: this.partnerRepo,
            employee_id: this.employeeRepo,
            bank_id: this.bankRepo,
            contract_id: this.contractRepo,
        });

        await this.db.$transaction(async (tx) => {
            const { details, ...invoiceData } = request;

            await this.repo.update({ id }, invoiceData as Partial<Invoices>, tx);

            if (details) {
                await this.invoiceDetailRepo.deleteMany({ invoice_id: id }, tx);

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
                            invoice: id ? { connect: { id } } : undefined,
                            product: product_id ? { connect: { id: product_id } } : undefined,
                        };
                    });

                    const filteredData = this.filterData(mappedDetails, DEFAULT_EXCLUDED_FIELDS, ['details']);

                    await this.invoiceDetailRepo.createMany(filteredData, tx);
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
