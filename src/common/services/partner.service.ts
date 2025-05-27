import { PartnerRepo } from '@common/repositories/partner.repo';
import { BaseService } from './base.service';
import { Partners, Prisma } from '.prisma/client';
import { IPartnerDebtQueryFilter, IPartner } from '@common/interfaces/partner.interface';
import {
    IIdResponse,
    IPaginationInput,
    IPaginationResponse,
    IUpdateChildAction,
} from '@common/interfaces/common.interface';
import { PartnerGroupRepo } from '@common/repositories/partner-group.repo';
import { EmployeeRepo } from '@common/repositories/employee.repo';
import { ClauseRepo } from '@common/repositories/clause.repo';
import {
    DEFAULT_EXCLUDED_FIELDS,
    InvoiceStatus,
    PaymentRequestStatus,
    PaymentRequestType,
    TransactionOrderType,
} from '@config/app.constant';
import { RepresentativeRepo } from '@common/repositories/representative.repo';
import { BankRepo } from '@common/repositories/bank.repo';
import { APIError } from '@common/error/api.error';
import { StatusCode, ErrorCode, ErrorKey } from '@common/errors';
import {
    ICommissionDebtDetail,
    ICommissionDebtResponse,
    IDebtDetail,
    IDebtResponse,
} from '@common/interfaces/debt.interface';
import { TransactionRepo } from '@common/repositories/transaction.repo';
import { PaymentRequestRepo } from '@common/repositories/payment-request.repo';
import { IPaymentRequest } from '@common/interfaces/payment-request.interface';
import { InvoiceRepo } from '@common/repositories/invoice.repo';
import { IInvoice } from '@common/interfaces/invoice.interface';

export class PartnerService extends BaseService<Partners, Prisma.PartnersSelect, Prisma.PartnersWhereInput> {
    private static instance: PartnerService;
    private employeeRepo: EmployeeRepo = new EmployeeRepo();
    private parterGroupRepo: PartnerGroupRepo = new PartnerGroupRepo();
    private clauseRepo: ClauseRepo = new ClauseRepo();
    private bankRepo: BankRepo = new BankRepo();
    private transactionRepo: TransactionRepo = new TransactionRepo();
    private representativeRepo: RepresentativeRepo = new RepresentativeRepo();
    private paymentRequestRepo: PaymentRequestRepo = new PaymentRequestRepo();
    private invoiceRepo: InvoiceRepo = new InvoiceRepo();

    private constructor() {
        super(new PartnerRepo());
    }

    public static getInstance(): PartnerService {
        if (!this.instance) {
            this.instance = new PartnerService();
        }
        return this.instance;
    }

    public async create(request: IPartner): Promise<IIdResponse> {
        let parterId = 0;

        await this.validateForeignKeys(request, {
            partner_group_id: this.parterGroupRepo,
            employee_id: this.employeeRepo,
            clause_id: this.clauseRepo,
        });

        await this.db.$transaction(async (tx) => {
            const { representatives, ...partnerData } = request;
            parterId = await this.repo.create(partnerData as Partial<IPartner>, tx);

            if (representatives && representatives.length > 0) {
                for (const ele of representatives) {
                    let { banks, key, ...representativeData } = ele;

                    representativeData.partner = parterId ? { connect: { id: parterId } } : undefined;

                    const representativeId = await this.representativeRepo.create(representativeData, tx);

                    const mappedDetails = banks?.map((item: any) => {
                        return {
                            ...item,
                            representative: representativeId ? { connect: { id: representativeId } } : undefined,
                        };
                    });

                    const filteredData = this.filterData(mappedDetails, DEFAULT_EXCLUDED_FIELDS, ['banks']);
                    await this.bankRepo.createMany(filteredData, tx);
                }
            }
        });

        return { id: parterId };
    }

    public async update(id: number, request: Partial<IPartner>): Promise<IIdResponse> {
        await this.findById(id);

        await this.isExist({ code: request.code, id }, true);

        await this.validateForeignKeys(request, {
            partner_group_id: this.parterGroupRepo,
            employee_id: this.employeeRepo,
            clause_id: this.clauseRepo,
        });

        const { delete: deteleItems, update, add, ...body } = request;

        await this.db.$transaction(async (tx) => {
            await this.repo.update({ id }, body as Partial<IPartner>, tx);

            const mappedDetails: IUpdateChildAction = {
                add: this.mapDetails(request.add || [], { partner_id: id }),
                update: this.mapDetails(request.update || [], { partner_id: id }),
                delete: request.delete,
            };

            const filteredData = {
                add: this.filterData(mappedDetails.add, DEFAULT_EXCLUDED_FIELDS, ['key']),
                update: this.filterData(mappedDetails.update, DEFAULT_EXCLUDED_FIELDS, ['key']),
                delete: mappedDetails.delete,
            };

            const hasAdd = filteredData.add.length > 0;
            const hasUpdate = filteredData.update.length > 0;
            const hasDelete = (filteredData.delete?.length || 0) > 0;

            if (hasAdd || hasUpdate || hasDelete) {
                if (hasAdd) {
                    for (const item of request.add || []) {
                        const { banks, key, ...repData } = item;
                        repData.partner_id = id;

                        const representative = await this.representativeRepo.create(repData, tx);

                        if (banks?.length > 0) {
                            for (const bank of banks) {
                                const { key, ...bankData } = bank;
                                bankData.representative = { connect: { id: representative } };
                                await this.bankRepo.create(bankData, tx);
                            }
                        }
                    }
                }

                if (hasUpdate) {
                    for (const item of request.update || []) {
                        await this.validateForeignKeys(item, {
                            id: this.representativeRepo,
                        });
                        const { banks, key, id, ...repData } = item;
                        await this.representativeRepo.update({ id }, repData, tx);

                        if (banks?.length > 0) {
                            await this.bankRepo.deleteMany({ representative_id: id }, tx);
                            const mappedDetails = banks.map((item: any) => {
                                return {
                                    ...item,
                                    representative: id ? { connect: { id } } : undefined,
                                };
                            });
                            await this.bankRepo.createMany(mappedDetails, tx);
                        }
                    }
                }

                if (hasDelete) {
                    for (const id of request.delete ?? []) {
                        const check = await this.representativeRepo.isExist({ id: Number(id) }, tx);
                        if (!check) {
                            throw new APIError({
                                message: `common.status.${StatusCode.BAD_REQUEST}`,
                                status: ErrorCode.BAD_REQUEST,
                                errors: [`id.${ErrorKey.NOT_FOUND}`],
                            });
                        }
                    }
                    await this.representativeRepo.deleteMany({ id: { in: request.delete } }, tx, false);
                }
            }
        });

        return { id };
    }

    private sortDebtDetail(details: IDebtDetail[]) {
        return details.sort((a, b) => {
            const aInvoiceId = a.invoice?.id || 0;
            const bInvoiceId = b.invoice?.id || 0;
            const aInvoiceTime = a.invoice?.time_at ? new Date(a.invoice.time_at as unknown as string).getTime() : 0;
            const bInvoiceTime = b.invoice?.time_at ? new Date(b.invoice.time_at as unknown as string).getTime() : 0;
            const aTime = a.time_at ? new Date(a.time_at as unknown as string).getTime() : 0;
            const bTime = b.time_at ? new Date(b.time_at as unknown as string).getTime() : 0;

            if (aInvoiceTime !== bInvoiceTime) {
                return aInvoiceTime - bInvoiceTime;
            }
            if (aInvoiceId !== bInvoiceId) {
                return aInvoiceId - bInvoiceId;
            }
            return aTime - bTime;
        });
    }

    public async getDebt(query: IPartnerDebtQueryFilter): Promise<IDebtResponse> {
        const { startAt, endAt, partnerId } = query;

        await this.validateForeignKeys(query, {
            partner_id: this.repo,
        });

        // beginning debt
        const beforeConditions = {
            AND: [{ time_at: { lte: startAt } }, { partner_id: partnerId }],
        };

        const beforeInvoices = await this.invoiceRepo.findMany(
            { status: InvoiceStatus.CONFIRMED, ...beforeConditions } as Prisma.InvoicesWhereInput,
            true,
        );
        const beforeTotal = this.enrichTotals({ data: beforeInvoices } as IPaginationResponse);
        const beginningDebt = beforeTotal.data.reduce((sum: any, item: any) => sum + Number(item.total_amount || 0), 0);

        const beforeTransactions = await this.transactionRepo.findMany(
            { order_type: TransactionOrderType.ORDER, ...beforeConditions } as Prisma.TransactionsWhereInput,
            true,
        );
        const reductionBefore = beforeTransactions.reduce((sum, item) => sum + Number(item.amount || 0), 0);

        let currentDebt = beginningDebt - reductionBefore;

        // debt during the period
        const timeCondition = { time_at: { lte: endAt, gte: startAt } };
        const conditions: Prisma.InvoicesWhereInput = {
            AND: [{ ...timeCondition }, { partner_id: partnerId }],
        };

        let increaseData = await this.invoiceRepo.findMany(
            { status: InvoiceStatus.CONFIRMED, ...conditions } as Prisma.InvoicesWhereInput,
            true,
        );

        const totalData = this.enrichTotals({ data: increaseData } as IPaginationResponse);
        let ending = currentDebt;
        let increase = 0;
        let reduction = 0;
        let totalReduction = 0;

        const combinedDetails: IDebtDetail[] = [];

        for (const ele of totalData.data) {
            const { details, bank, employee, contract, partner, organization, ...invoiceData } = ele as IInvoice;

            increase += ele.total_amount;

            const reductData = await this.transactionRepo.findMany(
                { invoice_id: invoiceData.id, ...timeCondition } as Prisma.TransactionsWhereInput,
                true,
            );

            const paymentRequest = await this.paymentRequestRepo.findMany(
                {
                    status: PaymentRequestStatus.CONFIRMED,
                    type: PaymentRequestType.ORDER,
                } as Prisma.PaymentRequestsWhereInput,
                true,
            );

            const paymentRequestDetails = paymentRequest.flatMap((item: any) => {
                const { details, ...parentInfo } = item;

                return details
                    .filter((detail: any) => detail.invoice && detail.invoice.id === invoiceData.id)
                    .map((detail: any) => ({
                        ...detail,
                        ...parentInfo,
                    }));
            });

            if (reductData.length > 0) {
                let reduction = 0;
                const groupedByInvoice: any = {};

                reductData.forEach((item: any) => {
                    const invoiceId = item.invoice?.id || 0;
                    if (!groupedByInvoice[invoiceId]) {
                        groupedByInvoice[invoiceId] = [];
                    }
                    groupedByInvoice[invoiceId].push(item);
                });

                Object.keys(groupedByInvoice).forEach((invoiceId) => {
                    const items = groupedByInvoice[invoiceId];

                    items.sort((a: any, b: any) => {
                        const aTime = a.time_at ? new Date(a.time_at as unknown as string).getTime() : 0;
                        const bTime = b.time_at ? new Date(b.time_at as unknown as string).getTime() : 0;
                        return aTime - bTime;
                    });

                    const totalAmount = items.reduce((sum: any, item: any) => sum + item.amount, 0);

                    items.forEach((item: any) => {
                        reduction += item.amount;
                        totalReduction += item.amount;

                        combinedDetails.push({
                            order: invoiceData.order,
                            invoice: invoiceData,
                            bank: item.bank,
                            time_at: item.time_at,
                            reduction: item.amount,
                            ending: totalAmount,
                            payment_requests: paymentRequestDetails,
                        });
                    });
                });
            } else if (reductData.length === 0) {
                combinedDetails.push({
                    order: invoiceData.order,
                    invoice: invoiceData,
                    ending: 0,
                    time_at: null,
                    reduction: 0,
                    bank: null,
                    payment_requests: paymentRequestDetails,
                });
            }
        }

        const sortedDetails = this.sortDebtDetail(combinedDetails);

        return {
            beginning_debt: currentDebt,
            debt_increase: increase,
            debt_reduction: reduction,
            ending_debt: totalReduction,
            details: sortedDetails,
        };
    }

    public async getCommissionDebt(query: IPartnerDebtQueryFilter): Promise<ICommissionDebtResponse> {
        const { startAt, endAt, partnerId } = query;

        await this.validateForeignKeys(query, {
            partner_id: this.repo,
        });

        // beginning commission debt
        const beforeConditions = {
            AND: [{ time_at: { lte: startAt } }, { partner_id: partnerId }],
        };

        const befortDataInvoice = await this.invoiceRepo.findMany(
            { status: InvoiceStatus.CONFIRMED, ...beforeConditions } as Prisma.InvoicesWhereInput,
            true,
        );

        const beforeInvoiceTotal = this.enrichTotals({ data: befortDataInvoice } as IPaginationResponse);

        const beginningDebt = beforeInvoiceTotal.data.reduce(
            (sum: any, item: any) => sum + Number(item.total_commission || 0),
            0,
        );

        const beforeReductions = await this.transactionRepo.findMany(
            { order_type: TransactionOrderType.COMMISSION, ...beforeConditions } as Prisma.TransactionsWhereInput,
            true,
        );
        const reductionBefore = beforeReductions.reduce((sum, item) => sum + Number(item.amount || 0), 0);

        let currentCommissionDebt = beginningDebt - reductionBefore;

        // commission debt during the period
        const conditions: Prisma.OrdersWhereInput = {
            AND: [{ time_at: { lte: endAt, gte: startAt } }, { partner_id: partnerId }],
        };

        const increaseInvoiceData = await this.invoiceRepo.findMany(
            { status: InvoiceStatus.CONFIRMED, ...conditions } as Prisma.InvoicesWhereInput,
            true,
        );

        const commissionTotalData = this.enrichTotals({ data: increaseInvoiceData } as IPaginationResponse);
        let ending = currentCommissionDebt;
        let increase = 0;
        let reduction = 0;
        let totalReduction = 0;

        const commissionDetails: ICommissionDebtDetail[] = [];

        for (const ele of commissionTotalData.data) {
            const { details, bank, employee, contract, partner, organization, ...invoiceData } = ele as IInvoice;

            increase += ele.total_commission;

            const reductData = await this.transactionRepo.findMany(
                { invoice_id: invoiceData.id, time_at: { lte: endAt, gte: startAt } } as Prisma.TransactionsWhereInput,
                true,
            );

            const paymentRequest = await this.paymentRequestRepo.findMany(
                {
                    status: PaymentRequestStatus.CONFIRMED,
                    type: PaymentRequestType.COMMISSION,
                } as Prisma.PaymentRequestsWhereInput,
                true,
            );

            const paymentRequestDetails = (paymentRequest as IPaymentRequest[]).flatMap((item) => item.details);

            if (reductData.length > 0) {
                let reduction = 0;
                const groupedByInvoice: any = {};

                reductData.forEach((item: any) => {
                    const invoiceId = item.invoice?.id || 0;
                    if (!groupedByInvoice[invoiceId]) {
                        groupedByInvoice[invoiceId] = [];
                    }
                    groupedByInvoice[invoiceId].push(item);
                });

                Object.keys(groupedByInvoice).forEach((invoiceId) => {
                    const items = groupedByInvoice[invoiceId];

                    items.sort((a: any, b: any) => {
                        const aTime = a.time_at ? new Date(a.time_at as unknown as string).getTime() : 0;
                        const bTime = b.time_at ? new Date(b.time_at as unknown as string).getTime() : 0;
                        return aTime - bTime;
                    });

                    const totalAmount = items.reduce((sum: any, item: any) => sum + item.amount, 0);

                    items.forEach((item: any) => {
                        reduction += item.amount;
                        totalReduction += item.amount;

                        commissionDetails.push({
                            order: invoiceData.order,
                            invoice: invoiceData,
                            ending: totalAmount,
                            time_at: item.time_at,
                            reduction: item.amount,
                            bank: item.bank,
                            payment_requests: paymentRequestDetails,
                            total_commission: 0,
                            comission: 0,
                        });
                    });
                });
            } else if (reductData.length === 0) {
                commissionDetails.push({
                    order: invoiceData.order,
                    invoice: invoiceData,
                    ending: 0,
                    time_at: null,
                    reduction: 0,
                    bank: null,
                    payment_requests: paymentRequestDetails,
                    total_commission: 0,
                    comission: 0,
                });
            }
        }

        const sortedDetails = this.sortDebtDetail(commissionDetails) as ICommissionDebtDetail[];

        return {
            beginning_debt: currentCommissionDebt,
            debt_increase: increase,
            debt_reduction: reduction,
            ending_debt: totalReduction,
            details: sortedDetails,
        };
    }

    public async paginate(query: IPaginationInput): Promise<IPaginationResponse> {
        const { isCommission, ...queryFilter } = query;
        const result = await this.repo.paginate(queryFilter, true);

        if (query.startAt && query.endAt) {
            const { startAt, endAt } = query;

            result.data = await Promise.all(
                result.data.map(async (partner: any) => {
                    const partnerId = partner.id;

                    const beforeConditions = {
                        AND: [{ time_at: { lte: startAt } }, { partner_id: partnerId }],
                    };

                    if (isCommission) {
                        // === COMMISSION DEBT ===

                        // 1. Tính công nợ đầu kỳ (hoa hồng)
                        const beforeInvoices = await this.invoiceRepo.findMany(
                            beforeConditions as Prisma.InvoicesWhereInput,
                            true,
                        );
                        const beforeInvoiceTotal = this.enrichTotals({ data: beforeInvoices } as IPaginationResponse);

                        const beginningDebt = beforeInvoiceTotal.data.reduce(
                            (sum: any, item: any) => sum + Number(item.total_commission || 0),
                            0,
                        );

                        const beforeReductions = await this.transactionRepo.findMany(
                            {
                                order_type: TransactionOrderType.COMMISSION,
                                ...beforeConditions,
                            } as Prisma.TransactionsWhereInput,
                            true,
                        );
                        const reductionBefore = beforeReductions.reduce(
                            (sum, item) => sum + Number(item.amount || 0),
                            0,
                        );

                        let currentCommissionDebt = beginningDebt - reductionBefore;

                        // 2. Trong kỳ
                        const duringConditions: Prisma.InvoicesWhereInput = {
                            AND: [{ time_at: { lte: endAt, gte: startAt } }, { partner_id: partnerId }],
                        };

                        const invoicesInPeriod = await this.invoiceRepo.findMany(
                            { status: InvoiceStatus.CONFIRMED, ...duringConditions },
                            true,
                        );

                        const enrichedCurrent = this.enrichTotals({ data: invoicesInPeriod } as IPaginationResponse);

                        let increase = 0;
                        let reduction = 0;

                        for (const ele of enrichedCurrent.data) {
                            increase += ele.total_commission;

                            const reductData = await this.transactionRepo.findMany(
                                {
                                    invoice_id: ele.id,
                                    order_type: TransactionOrderType.COMMISSION,
                                } as Prisma.TransactionsWhereInput,
                                true,
                            );

                            if (reductData.length > 0) {
                                reductData.forEach((tran: any) => {
                                    reduction += Number(tran.amount || 0);
                                });
                            }
                        }

                        const endingDebt = currentCommissionDebt + increase - reduction;
                        const paymentRequest = await this.paymentRequestRepo.findOne(
                            {
                                status: PaymentRequestStatus.PENDING,
                                partner_id: partnerId,
                                type: PaymentRequestType.COMMISSION,
                            } as Prisma.PaymentRequestsWhereInput,
                            false,
                        );
                        const totalAmount =
                            paymentRequest && (paymentRequest as IPaymentRequest).details
                                ? (paymentRequest as IPaymentRequest).details.reduce(
                                      (sum, item) => sum + Number(item.amount || 0),
                                      0,
                                  )
                                : 0;

                        const paymentRequestWithTotal = paymentRequest
                            ? { ...(paymentRequest as object), total_amount: totalAmount }
                            : null;

                        return {
                            ...partner,
                            beginning_debt: currentCommissionDebt,
                            debt_increase: increase,
                            debt_reduction: reduction,
                            ending_debt: endingDebt,
                            payment_request: paymentRequestWithTotal,
                        };
                    } else {
                        // === NORMAL ORDER DEBT ===

                        // 1. Tính công nợ đầu kỳ (đơn hàng thường)
                        const beforeInvoices = await this.invoiceRepo.findMany(
                            { status: InvoiceStatus.CONFIRMED, ...beforeConditions } as Prisma.InvoicesWhereInput,
                            true,
                        );
                        const enrichedBefore = this.enrichTotals({ data: beforeInvoices } as IPaginationResponse);
                        const beginningDebt = enrichedBefore.data.reduce(
                            (sum: any, item: any) => sum + Number(item.total_amount || 0),
                            0,
                        );

                        const beforeTransactions = await this.transactionRepo.findMany(
                            {
                                order_type: TransactionOrderType.ORDER,
                                ...beforeConditions,
                            } as Prisma.TransactionsWhereInput,
                            true,
                        );
                        const reductionBefore = beforeTransactions.reduce(
                            (sum, item) => sum + Number(item.amount || 0),
                            0,
                        );

                        let currentDebt = beginningDebt - reductionBefore;

                        // 2. Tính công nợ trong kỳ
                        const duringConditions: Prisma.InvoicesWhereInput = {
                            AND: [{ time_at: { lte: endAt, gte: startAt } }, { partner_id: partnerId }],
                        };

                        const currentInvoices = await this.invoiceRepo.findMany(
                            { status: InvoiceStatus.CONFIRMED, ...duringConditions },
                            true,
                        );
                        const enrichedCurrent = this.enrichTotals({ data: currentInvoices } as IPaginationResponse);

                        let increase = 0;
                        let reduction = 0;

                        for (const ele of enrichedCurrent.data) {
                            increase += ele.total_amount;

                            const reductData = await this.transactionRepo.findMany(
                                { invoice_id: ele.id } as Prisma.TransactionsWhereInput,
                                true,
                            );

                            if (reductData.length > 0) {
                                reductData.forEach((tran: any) => {
                                    reduction += Number(tran.amount || 0);
                                });
                            }
                        }

                        const endingDebt = currentDebt + increase - reduction;
                        let paymentRequests = await this.paymentRequestRepo.findMany(
                            {
                                status: PaymentRequestStatus.PENDING,
                                partner_id: partnerId,
                                type: PaymentRequestType.ORDER,
                            } as Prisma.PaymentRequestsWhereInput,
                            false,
                        );

                        paymentRequests = paymentRequests.map((item: any) => {
                            const { details, ...parentInfo } = item;
                            const totalAmount = details
                                ? details.reduce((sum: number, detail: any) => sum + Number(detail.amount || 0), 0)
                                : 0;
                            return {
                                ...parentInfo,
                                total_amount: totalAmount,
                                details: details || [],
                            };
                        });

                        return {
                            ...partner,
                            beginning_debt: currentDebt,
                            debt_increase: increase,
                            debt_reduction: reduction,
                            ending_debt: endingDebt,
                            payment_requests: paymentRequests,
                        };
                    }
                }),
            );
        }

        return result;
    }

    public async findByConditions(query: Prisma.PartnersWhereInput): Promise<Partial<Partners> | null> {
        const result = await this.repo.findOne(query);
        if (!result) {
            throw new APIError({
                message: `common.not-found`,
                status: ErrorCode.REQUEST_NOT_FOUND,
            });
        }
        return result;
    }
}
