import { BaseService } from './master/base.service';
import { PaymentRequests, Prisma } from '.prisma/client';
import {
    IApproveRequest,
    IIdResponse,
    IPaginationInput,
    IPaginationResponse,
} from '@common/interfaces/common.interface';
import { IPaymentRequest } from '@common/interfaces/payment-request.interface';
import { EmployeeRepo } from '@common/repositories/employee.repo';
import { PaymentRequestRepo } from '@common/repositories/payment-request.repo';
import { DEFAULT_EXCLUDED_FIELDS, PaymentRequestDetailStatus, PaymentRequestStatus } from '@config/app.constant';
import { PaymentRequestDetailRepo } from '@common/repositories/payment-request-details.repo';
import { OrderRepo } from '@common/repositories/order.repo';
import { InvoiceRepo } from '@common/repositories/invoice.repo';
import { PartnerRepo } from '@common/repositories/partner.repo';
import { generateUniqueCode } from '@common/helpers/generate-unique-code.helper';
import { LoanRepo } from '@common/repositories/loan.repo';
import { InterestLogRepo } from '@common/repositories/interest-log.repo';
import PrismaSearchBuilder from '@common/helpers/searchBuilder';
import { BankRepo } from '@common/repositories/bank.repo';

export class PaymentRequestService extends BaseService<
    PaymentRequests,
    Prisma.PaymentRequestsSelect,
    Prisma.PaymentRequestsWhereInput
> {
    private static instance: PaymentRequestService;
    private paymentRequestDetails: PaymentRequestDetailRepo = new PaymentRequestDetailRepo();
    private employeeRepo: EmployeeRepo = new EmployeeRepo();
    private orderRepo: OrderRepo = new OrderRepo();
    private invoiceRepo: InvoiceRepo = new InvoiceRepo();
    private partnerRepo: PartnerRepo = new PartnerRepo();
    private loanRepo: LoanRepo = new LoanRepo();
    private bankRepo: BankRepo = new BankRepo();
    private interestLogRepo: InterestLogRepo = new InterestLogRepo();

    private constructor() {
        super(new PaymentRequestRepo());
    }

    public static getInstance(): PaymentRequestService {
        if (!this.instance) {
            this.instance = new PaymentRequestService();
        }
        return this.instance;
    }

    public async createPaymentRequest(
        request: Partial<IPaymentRequest>,
        tx?: Prisma.TransactionClient,
    ): Promise<IIdResponse> {
        let paymentRequestId: number = 0;
        await this.validateForeignKeys(
            request,
            {
                employee_id: this.employeeRepo,
                approver_id: this.employeeRepo,
                partner_id: this.partnerRepo,
                bank_id: this.bankRepo,
            },
            tx,
        );

        const runTransaction = async (transaction: Prisma.TransactionClient) => {
            const {
                details,
                partner_id,
                employee_id,
                approver_id,
                organization_id,
                bank_id,
                representative_id,
                ...paymentRequestData
            } = request as any;

            paymentRequestData.partner = partner_id ? { connect: { id: partner_id } } : undefined;
            paymentRequestData.employee = employee_id ? { connect: { id: employee_id } } : undefined;
            paymentRequestData.approver = approver_id ? { connect: { id: approver_id } } : undefined;
            paymentRequestData.organization = organization_id ? { connect: { id: organization_id } } : undefined;
            paymentRequestData.bank = bank_id ? { connect: { id: bank_id } } : undefined;
            paymentRequestData.representative = representative_id ? { connect: { id: representative_id } } : undefined;

            paymentRequestId = await this.repo.create(paymentRequestData as Partial<PaymentRequest>, transaction);

            if (details && details.length > 0) {
                await this.validateForeignKeys(
                    details,
                    {
                        order_id: this.orderRepo,
                        invoice_id: this.invoiceRepo,
                        loan_id: this.loanRepo,
                        interest_log_id: this.interestLogRepo,
                    },
                    transaction,
                );

                const mappedDetails = details.map((item: any) => {
                    const { order_id, invoice_id, loan_id, interest_log_id, ...rest } = item;
                    return {
                        ...rest,
                        code: generateUniqueCode({ lastCode: null, prefix: paymentRequestData.code, maxLength: 2 }),
                        order: order_id ? { connect: { id: order_id } } : undefined,
                        invoice: invoice_id ? { connect: { id: invoice_id } } : undefined,
                        payment_request: paymentRequestId ? { connect: { id: paymentRequestId } } : undefined,
                        loan: loan_id ? { connect: { id: loan_id } } : undefined,
                        interest_log: interest_log_id ? { connect: { id: interest_log_id } } : undefined,
                    };
                });

                const filteredData = this.filterData(mappedDetails, DEFAULT_EXCLUDED_FIELDS, ['details']);

                await this.paymentRequestDetails.createMany(filteredData, transaction);
            }
        };

        if (tx) {
            await runTransaction(tx);
        } else {
            await this.db.$transaction(async (transaction) => {
                await runTransaction(transaction);
            });
        }

        return { id: paymentRequestId };
    }

    public async updatePaymentRequest(id: number, request: Partial<IPaymentRequest>): Promise<IIdResponse> {
        await this.isExist({ code: request.code, id }, true);

        await this.validateForeignKeys(request, {
            employee_id: this.employeeRepo,
            approver_id: this.employeeRepo,
        });

        const updatedId = await this.repo.update({ id }, request);

        return { id: updatedId };
    }

    public async paginate(query: IPaginationInput): Promise<IPaginationResponse> {
        const { page, size, keyword, startAt, endAt, types, ...o } = query;
        let condition: any = { ...o };
        if (query.partnerId) {
            query.partner_id = query.partnerId;
            condition = { ...condition, partner_id: query.partnerId };
            delete query.partnerId;
        }
        if (query.types) {
            query.type = { in: query.types };
            condition = { ...condition, type: { in: query.types } };
            delete query.types;
        }

        const result = await this.repo.paginate(query, true);

        const searchConditions = PrismaSearchBuilder.buildSearch(query.keyword, [
            { path: ['code'] },
            { path: ['partner', 'name'] },
            { path: ['details', 'invoice', 'code'], isArray: true },
        ]);

        const whereSumCondition: Prisma.PaymentRequestDetailsWhereInput = {
            payment_request: {
                time_at: {
                    ...(startAt && { gte: startAt }),
                    ...(endAt && { lte: endAt }),
                },
                ...condition,
                ...searchConditions,
            },
        };

        const sumAmountData = await this.db.paymentRequestDetails.aggregate({
            where: whereSumCondition,
            _sum: {
                amount: true,
            },
        });

        if (!result.summary) result.summary = {} as any;

        result.summary.total_amount = sumAmountData._sum.amount || 0;

        return result;
    }

    public async approve(id: number, body: IApproveRequest): Promise<IIdResponse> {
        await this.validateStatusApprove(id);

        const updatedId = await this.repo.update({ id }, { status: body.status });

        await this.paymentRequestDetails.updateManyByCondition(
            { payment_request_id: updatedId },
            {
                status: PaymentRequestDetailStatus.PENDING,
            },
        );

        return { id };
    }
}
