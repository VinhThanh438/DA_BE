import { PartnerRepo } from '@common/repositories/partner.repo';
import { BaseService } from './base.service';
import { Partners, Prisma } from '.prisma/client';
import { IPartnerDebtQueryFilter, IPartner } from '@common/interfaces/partner.interface';
import { IIdResponse, IPaginationInput, IPaginationResponse } from '@common/interfaces/common.interface';
import { PartnerGroupRepo } from '@common/repositories/partner-group.repo';
import { EmployeeRepo } from '@common/repositories/employee.repo';
import { ClauseRepo } from '@common/repositories/clause.repo';
import {
    DEFAULT_EXCLUDED_FIELDS,
    InvoiceStatus,
    OrderStatus,
    PaymentRequestStatus,
    PaymentRequestType,
    TransactionOrderType,
    TransactionType,
} from '@config/app.constant';
import { RepresentativeRepo } from '@common/repositories/representative.repo';
import { BankRepo } from '@common/repositories/bank.repo';
import { APIError } from '@common/error/api.error';
import { StatusCode, ErrorCode, ErrorKey } from '@common/errors';
import { IDebtDetail, IDebtResponse } from '@common/interfaces/debt.interface';
import { TransactionRepo } from '@common/repositories/transaction.repo';
import { PaymentRequestRepo } from '@common/repositories/payment-request.repo';
import { IPaymentRequest } from '@common/interfaces/payment-request.interface';
import { InvoiceRepo } from '@common/repositories/invoice.repo';
import { InvoiceService } from './invoice.service';
import { ITransaction } from '@common/interfaces/transaction.interface';
import { OrderRepo } from '@common/repositories/order.repo';
import { LoanRepo } from '@common/repositories/loan.repo';
import { TimeHelper } from '@common/helpers/time.helper';
import { IOrder } from '@common/interfaces/order.interface';

export class PartnerService extends BaseService<Partners, Prisma.PartnersSelect, Prisma.PartnersWhereInput> {
    private static instance: PartnerService;
    private employeeRepo: EmployeeRepo = new EmployeeRepo();
    private partnerGroupRepo: PartnerGroupRepo = new PartnerGroupRepo();
    private clauseRepo: ClauseRepo = new ClauseRepo();
    private bankRepo: BankRepo = new BankRepo();
    private transactionRepo: TransactionRepo = new TransactionRepo();
    private representativeRepo: RepresentativeRepo = new RepresentativeRepo();
    private paymentRequestRepo: PaymentRequestRepo = new PaymentRequestRepo();
    private invoiceRepo: InvoiceRepo = new InvoiceRepo();
    private orderRepo: OrderRepo = new OrderRepo();
    private invoiceService: InvoiceService = InvoiceService.getInstance();
    private loanRepo: LoanRepo = new LoanRepo();

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
        let partnerId = 0;

        await this.validateForeignKeys(request, {
            partner_group_id: this.partnerGroupRepo,
            employee_id: this.employeeRepo,
            clause_id: this.clauseRepo,
        });

        await this.db.$transaction(async (tx) => {
            const { representatives, banks, ...partnerData } = request;
            partnerId = await this.repo.create(partnerData as Partial<IPartner>, tx);

            if (banks && banks.length > 0) {
                for (const bank of banks) {
                    const { key, ...bankData } = bank;
                    bankData.partner = partnerId ? { connect: { id: partnerId } } : undefined;
                    await this.bankRepo.create(bankData, tx);
                }
            }

            if (representatives && representatives.length > 0) {
                for (const ele of representatives) {
                    let { banks, key, ...representativeData } = ele;

                    representativeData.partner = partnerId ? { connect: { id: partnerId } } : undefined;

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

        return { id: partnerId };
    }

    public async update(id: number, request: Partial<IPartner>): Promise<IIdResponse> {
        await this.findById(id);

        await this.isExist({ code: request.code, id }, true);

        await this.validateForeignKeys(request, {
            partner_group_id: this.partnerGroupRepo,
            employee_id: this.employeeRepo,
            clause_id: this.clauseRepo,
        });

        const { delete: deteleItems, update, add, banks_add, banks_update, banks_delete, ...body } = request;

        await this.db.$transaction(async (tx) => {
            await this.repo.update({ id }, body as Partial<IPartner>, tx);

            const mappedDetails: Partial<IPartner> = {
                add: this.mapDetails(add || [], { partner_id: id }),
                update: this.mapDetails(update || [], { partner_id: id }),
                delete: deteleItems || [],

                banks_add: this.mapDetails(banks_add || [], { partner_id: id }),
                banks_update: this.mapDetails(banks_update || [], { partner_id: id }),
                banks_delete: banks_delete || [],
            };

            const filteredData = {
                add: this.filterData(mappedDetails.add, DEFAULT_EXCLUDED_FIELDS, ['key']),
                update: this.filterData(mappedDetails.update, DEFAULT_EXCLUDED_FIELDS, ['key']),
                delete: mappedDetails.delete,

                banks_add: this.filterData(mappedDetails.banks_add, DEFAULT_EXCLUDED_FIELDS, ['key']),
                banks_update: this.filterData(mappedDetails.banks_update, DEFAULT_EXCLUDED_FIELDS, ['key']),
                banks_delete: mappedDetails.banks_delete,
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

            const hasBankAdd = filteredData.banks_add.length > 0;
            const hasBankUpdate = filteredData.banks_update.length > 0;
            const hasBankDelete = (filteredData.banks_delete?.length || 0) > 0;

            if (hasBankAdd || hasBankUpdate || hasBankDelete) {
                if (hasBankAdd) {
                    for (const item of banks_add || []) {
                        const { key, ...bankData } = item;
                        bankData.partner_id = id;

                        await this.bankRepo.create(bankData, tx);
                    }
                }

                if (hasBankUpdate) {
                    for (const item of banks_update || []) {
                        await this.validateForeignKeys(item, {
                            id: this.bankRepo,
                        });

                        const { key, id, ...bankData } = item;

                        await this.bankRepo.update({ id }, bankData, tx);
                    }
                }

                if (hasBankDelete) {
                    for (const id of banks_delete ?? []) {
                        const check = await this.bankRepo.isExist({ id: Number(id) }, tx);
                        if (!check) {
                            throw new APIError({
                                message: `common.status.${StatusCode.BAD_REQUEST}`,
                                status: ErrorCode.BAD_REQUEST,
                                errors: [`id.${ErrorKey.NOT_FOUND}`],
                            });
                        }
                    }
                    await this.bankRepo.deleteMany({ id: { in: banks_delete } }, tx, false);
                }
            }
        });

        return { id };
    }
    public async getDebt(query: IPartnerDebtQueryFilter, isCommission = false): Promise<IDebtResponse> {
        let { startAt, endAt, partnerId } = query;
        endAt = TimeHelper.parseEndOfDayDate(endAt as string).toISOString();

        query.partner_id = partnerId;
        delete query.partnerId;

        await this.validateForeignKeys(query, {
            partner_id: this.repo,
        });

        let beginningDebt = 0;
        let debtIncrease = 0;
        let debtReduction = 0;
        let currentDebt = 0;
        let transformDetails: IDebtDetail[] = [];

        const orderType = isCommission ? TransactionOrderType.COMMISSION : TransactionOrderType.ORDER;

        const beforeInvoices = await this.invoiceRepo.findMany(
            {
                is_payment_completed: false,
                status: InvoiceStatus.CONFIRMED,
                partner_id: partnerId,
                invoice_date: { lt: startAt },
            },
            true,
        ); // Include relations for commission calculations

        const beforeOrders = await this.orderRepo.findMany(
            {
                status: OrderStatus.CONFIRMED,
                time_at: { lt: startAt },
                partner_id: partnerId,
            },
            true,
        );

        const beforeLoans = await this.loanRepo.findMany(
            {
                order_id: {
                    in: beforeOrders.map((order) => order.id).filter((id): id is number => typeof id === 'number'),
                },
                disbursement_date: { lt: startAt },
            },
            true,
        );

        // Calculate beginning debt from loans
        const loanDebt = beforeLoans.reduce((sum, loan) => sum + Number(loan.amount || 0), 0);

        // For commission debt, we need to enrich invoices with commission totals
        let enrichedBeforeInvoices = beforeInvoices;

        if (isCommission) {
            const enrichedResponse = await this.invoiceService.enrichInvoiceTotals({
                data: beforeInvoices,
            } as IPaginationResponse);
            enrichedBeforeInvoices = enrichedResponse.data;
        }

        const increaseBefore = enrichedBeforeInvoices.reduce((sum, item) => {
            const amount = isCommission ? Number(item.total_commission || 0) : Number(item.total_amount || 0);
            return sum + amount;
        }, 0);

        let beforeInvoiceIds = beforeInvoices.map((inv) => inv.id).filter((id): id is number => typeof id === 'number');
        const beforeInvoiceCondition = beforeInvoiceIds.length > 0 ? { in: beforeInvoiceIds } : null;

        // === 2. Giao dịch trước kỳ ===
        const transactionBefore = await this.transactionRepo.findMany(
            {
                order_type: orderType,
                type: TransactionType.OUT,
                invoice_id: beforeInvoiceCondition,
                time_at: { lt: startAt },
                partner_id: partnerId,
            },
            true,
        );

        const reductionBefore = transactionBefore.reduce((sum, item) => sum + Number(item.amount || 0), 0);

        beginningDebt = increaseBefore - reductionBefore + loanDebt;
        currentDebt = beginningDebt;
        const invoicesInPeriod = await this.invoiceRepo.findMany(
            {
                status: InvoiceStatus.CONFIRMED,
                invoice_date: { gte: startAt, lte: endAt },
                partner_id: partnerId,
            },
            true,
        );

        // For commission debt, enrich invoices with commission totals
        let enrichedInvoicesInPeriod = invoicesInPeriod;
        if (isCommission) {
            const enrichedResponse = await this.invoiceService.enrichInvoiceTotals({
                data: invoicesInPeriod,
            } as IPaginationResponse);
            enrichedInvoicesInPeriod = enrichedResponse.data;
        }

        const invoiceIdConditions = invoicesInPeriod
            .map((inv) => inv.id)
            .filter((id): id is number => typeof id === 'number');
        const invoiceFilter = invoiceIdConditions.length > 0 ? { in: invoiceIdConditions } : null;

        const transactionDuring = await this.transactionRepo.findMany(
            {
                order_type: orderType,
                type: TransactionType.OUT,
                time_at: { gte: startAt, lte: endAt },
                partner_id: partnerId,
            },
            true,
        );

        const groupedTxByInvoice = new Map<number, ITransaction[]>();

        for (const tx of transactionDuring) {
            const txAmount = Number(tx.amount || 0);
            debtReduction += txAmount;

            const txItem = {
                id: tx.id,
                time_at: tx.time_at ? tx.time_at.toISOString() : undefined,
                amount: txAmount,
                bank: (tx as any).bank,
                type: tx.type,
            } as ITransaction;

            if (!tx.invoice_id) continue;

            if (!groupedTxByInvoice.has(tx.invoice_id)) {
                groupedTxByInvoice.set(tx.invoice_id, []);
            }
            groupedTxByInvoice.get(tx.invoice_id)?.push(txItem);
        } // === 5. Xử lý hóa đơn trong kỳ ===
        for (let i = 0; i < invoicesInPeriod.length; i++) {
            const invoice = invoicesInPeriod[i];
            const enrichedInvoice = isCommission ? enrichedInvoicesInPeriod[i] : invoice;

            const { order, ...invoiceData } = invoice as any;
            const totalAmount = isCommission
                ? Number(enrichedInvoice.total_commission || 0)
                : Number(invoiceData.total_amount || 0);

            debtIncrease += totalAmount;

            const txList = invoiceData.id !== undefined ? groupedTxByInvoice.get(invoiceData.id) || [] : [];
            const totalReduction = txList.reduce((sum, tx) => sum + Number(tx.amount), 0);
            const endingDebt = totalAmount - totalReduction;

            currentDebt += totalAmount - totalReduction;

            // Luôn thêm hóa đơn trong kỳ vào details để theo dõi công nợ
            transformDetails.push({
                invoice: invoiceData,
                order,
                beginning_debt: 0, // Hóa đơn trong kỳ có beginning_debt = 0
                ending_debt: endingDebt,
                transactions: txList,
            });
        } // === 6. Xử lý tất cả hóa đơn kỳ trước chưa thanh toán hoàn toàn ===
        // Lấy tất cả hóa đơn kỳ trước chưa thanh toán hoàn toàn (bao gồm cả những hóa đơn không có giao dịch trong kỳ)
        const allPreviousUnpaidInvoices = await this.invoiceRepo.findMany(
            {
                is_payment_completed: false,
                status: InvoiceStatus.CONFIRMED,
                partner_id: partnerId,
                invoice_date: { lt: startAt }, // Hóa đơn kỳ trước
            },
            true, // Include relations for commission calculations
        );

        // For commission debt, enrich all previous invoices with commission totals
        let enrichedAllPreviousInvoices = allPreviousUnpaidInvoices;
        if (isCommission) {
            const enrichedResponse = await this.invoiceService.enrichInvoiceTotals({
                data: allPreviousUnpaidInvoices,
            } as IPaginationResponse);
            enrichedAllPreviousInvoices = enrichedResponse.data;
        }

        // Xử lý từng hóa đơn kỳ trước
        for (let i = 0; i < allPreviousUnpaidInvoices.length; i++) {
            const invoice = allPreviousUnpaidInvoices[i];
            const enrichedInvoice = isCommission ? enrichedAllPreviousInvoices[i] : invoice;

            // Kiểm tra xem hóa đơn này đã được thêm vào details chưa (từ việc xử lý hóa đơn trong kỳ)
            if (transformDetails.some((detail) => detail.invoice?.id === invoice.id)) {
                continue; // Đã được xử lý rồi, bỏ qua
            }

            const { order, ...invoiceData } = invoice as any;
            const totalAmount = isCommission
                ? Number(enrichedInvoice.total_commission || 0)
                : Number(invoiceData.total_amount || 0);

            // Lấy các giao dịch thanh toán trước kỳ cho hóa đơn này
            const previousPayments = await this.transactionRepo.findMany(
                {
                    order_type: orderType,
                    type: TransactionType.OUT,
                    invoice_id: invoice.id,
                    time_at: { lt: startAt },
                    partner_id: partnerId,
                },
                true,
            );

            const previousPaymentAmount = previousPayments.reduce((sum, tx) => sum + Number(tx.amount || 0), 0);
            const beginningDebtForInvoice = totalAmount - previousPaymentAmount;

            // Lấy giao dịch trong kỳ cho hóa đơn này (nếu có)
            const txList = groupedTxByInvoice.get(invoice.id!) || [];
            const currentPeriodPayment = txList.reduce((sum, tx) => sum + Number(tx.amount), 0);
            const itemEndingDebt = beginningDebtForInvoice - currentPeriodPayment; // Chỉ thêm vào details nếu có số dư đầu kỳ > 0 hoặc có giao dịch trong kỳ hoặc có số dư cuối kỳ > 0
            // Điều này đảm bảo tất cả hóa đơn có liên quan đến công nợ đều được hiển thị
            if (beginningDebtForInvoice > 0 || txList.length > 0 || itemEndingDebt > 0) {
                transformDetails.push({
                    invoice: invoiceData,
                    order,
                    beginning_debt: beginningDebtForInvoice,
                    ending_debt: itemEndingDebt,
                    transactions: txList,
                });
            }
        } // === 7. Đơn hàng trong kỳ ===
        const ordersInPeriod = await this.orderRepo.findMany(
            {
                status: OrderStatus.CONFIRMED,
                time_at: { gte: startAt, lte: endAt },
                partner_id: partnerId,
            },
            true,
        );

        const orderIds = ordersInPeriod.map((order) => order.id).filter((id): id is number => typeof id === 'number');
        const loans = await this.loanRepo.findMany(
            {
                order_id: {
                    in: orderIds,
                },
                disbursement_date: { gte: startAt, lte: endAt },
            },
            true,
        );
        const newDetails: IDebtDetail[] = [];

        for (const loan of loans) {
            const loanAmount = Number(loan.amount || 0);
            const loanTransaction: ITransaction = {
                id: loan.id,
                time_at: loan.disbursement_date ? loan.disbursement_date.toISOString() : undefined,
                amount: loanAmount,
                type: TransactionType.OUT,
                bank: (loan as any).bank,
            };

            let matched = false;

            for (const detail of transformDetails) {
                if (detail.order?.id === loan.order_id) {
                    detail.transactions.push(loanTransaction);
                    detail.ending_debt -= loanAmount; // Giảm số dư cuối kỳ do khoản vay
                    debtReduction += loanAmount; // Tính vào tổng số tiền giảm nợ
                    matched = true;
                    break; // Đã tìm thấy order, không cần kiểm tra tiếp
                }
            }

            if (!matched) {
                newDetails.push({
                    order: (loan as any).order as IOrder,
                    beginning_debt: 0,
                    ending_debt: -loanAmount, // Âm vì là khoản vay chưa có invoice
                    transactions: [loanTransaction],
                });
                debtReduction += loanAmount; // Khoản vay không gắn với invoice vẫn tính giảm nợ
            }
        }

        transformDetails = transformDetails.concat(newDetails);

        const sortedDetails = transformDetails.sort((a, b) => {
            const timeA = new Date((a as any).invoice?.invoice_date ?? (a as any).invoice?.time_at ?? 0).getTime();
            const timeB = new Date((b as any).invoice?.invoice_date ?? (b as any).invoice?.time_at ?? 0).getTime();
            return timeA - timeB;
        });

        const finalEndingDebt = beginningDebt + debtIncrease - debtReduction;
        return {
            beginning_debt: beginningDebt,
            debt_increase: debtIncrease,
            debt_reduction: debtReduction,
            ending_debt: finalEndingDebt,
            details: sortedDetails,
        };
    }

    public async paginate(query: IPaginationInput): Promise<IPaginationResponse> {
        const { isCommission, startAt, endAt, ...queryFilter } = query;
        const result = await this.repo.paginate(queryFilter, true);

        if (startAt && endAt) {
            result.data = await Promise.all(
                result.data.map(async (partner: IPartner) => {
                    const partnerId = partner.id;

                    // === 1. Lấy dữ liệu trước kỳ ===
                    const beforeInvoices = await this.invoiceRepo.findMany({
                        is_payment_completed: false,
                        status: InvoiceStatus.CONFIRMED,
                        partner_id: partnerId,
                        invoice_date: { lt: startAt },
                    });

                    const beforeOrders = await this.orderRepo.findMany({
                        status: OrderStatus.CONFIRMED,
                        time_at: { lt: startAt },
                        partner_id: partnerId,
                    });

                    const beforeLoans = await this.loanRepo.findMany({
                        order_id: { in: beforeOrders.map((order: any) => order.id) },
                        disbursement_date: { lt: startAt },
                    });

                    const loanDebt = beforeLoans.reduce((sum, loan) => sum + Number(loan.amount || 0), 0);

                    let enrichedBeforeInvoices = beforeInvoices;
                    if (isCommission) {
                        const enrichedResponse = await this.invoiceService.enrichInvoiceTotals({
                            data: beforeInvoices,
                        } as IPaginationResponse);
                        enrichedBeforeInvoices = enrichedResponse.data;
                    }

                    const increaseBeginning = enrichedBeforeInvoices.reduce(
                        (sum: number, item: any) =>
                            sum + Number(isCommission ? item.total_commission : item.total_amount || 0),
                        0,
                    );

                    let beforeInvoiceCondition: any = beforeInvoices.map((inv: any) => inv.id).filter(Boolean);
                    if (beforeInvoiceCondition.length === 0) {
                        beforeInvoiceCondition = null;
                    } else {
                        beforeInvoiceCondition = { in: beforeInvoiceCondition };
                    }

                    const transactionBefore = await this.transactionRepo.findMany(
                        {
                            order_type: isCommission ? TransactionOrderType.COMMISSION : TransactionOrderType.ORDER,
                            type: TransactionType.OUT,
                            invoice_id: beforeInvoiceCondition,
                            time_at: { lt: startAt },
                            partner_id: partnerId,
                        } as Prisma.TransactionsWhereInput,
                        true,
                    );

                    const reductionBefore = transactionBefore.reduce((sum, item) => sum + Number(item.amount || 0), 0);

                    const beginningDebt = increaseBeginning - reductionBefore + loanDebt;

                    // === 3. Trong kỳ ===
                    let reduction = 0;
                    const invoicesInPeriod = await this.invoiceRepo.findMany(
                        {
                            status: InvoiceStatus.CONFIRMED,
                            invoice_date: { gte: startAt, lte: endAt },
                            partner_id: partnerId,
                        },
                        true,
                    );

                    let increase = invoicesInPeriod.reduce(
                        (sum: number, item: any) =>
                            sum + Number(isCommission ? item.total_commission : item.total_amount || 0),
                        0,
                    );

                    const ordersInPeriod = await this.orderRepo.findMany(
                        {
                            status: InvoiceStatus.CONFIRMED,
                            time_at: { gte: startAt, lte: endAt },
                            partner_id: partnerId,
                        },
                        true,
                    );

                    const loans = await this.loanRepo.findMany(
                        {
                            order_id: { in: ordersInPeriod.map((order: any) => order.id) },
                            disbursement_date: { gte: startAt, lte: endAt },
                        },
                        true,
                    );

                    reduction += loans.reduce((sum: number, loan: any) => sum + Number(loan.amount || 0), 0);

                    let invoiceIdConditions: any = invoicesInPeriod.map((inv: any) => inv.id).filter(Boolean);
                    if (invoiceIdConditions.length === 0) {
                        invoiceIdConditions = null;
                    } else {
                        invoiceIdConditions = { in: invoiceIdConditions };
                    } // Giao dịch giảm trong kỳ - lấy tất cả giao dịch thanh toán trong kỳ
                    const transactionDuring = await this.transactionRepo.findMany(
                        {
                            order_type: isCommission ? TransactionOrderType.COMMISSION : TransactionOrderType.ORDER,
                            type: TransactionType.OUT,
                            time_at: { gte: startAt, lte: endAt },
                            partner_id: partnerId,
                            // Bỏ điều kiện invoice_id để lấy tất cả giao dịch thanh toán trong kỳ
                        } as Prisma.TransactionsWhereInput,
                        true,
                    );

                    reduction += transactionDuring.reduce((sum, item) => sum + Number(item.amount || 0), 0);

                    const endingDebt = beginningDebt + increase - reduction;

                    // === 4. Lấy payment request ===
                    const paymentRequests = async (): Promise<Partial<IPaymentRequest>[]> => {
                        const statuses = [PaymentRequestStatus.PENDING];
                        for (const status of statuses) {
                            const found = await this.paymentRequestRepo.findFirst(
                                {
                                    partner_id: partnerId,
                                    type: isCommission ? PaymentRequestType.COMMISSION : PaymentRequestType.ORDER,
                                    status,
                                    details: {
                                        some: {
                                            invoice_id: {
                                                not: null,
                                            },
                                        },
                                    },
                                } as Prisma.PaymentRequestsWhereInput,
                                false,
                            );
                            if (found) return [found as Partial<IPaymentRequest>];
                        }
                        return [];
                    };

                    return {
                        ...partner,
                        beginning_debt: beginningDebt,
                        debt_increase: increase,
                        debt_reduction: reduction,
                        ending_debt: endingDebt,
                        payment_requests: await paymentRequests(),
                    };
                }),
            );

            result.data = result.data.filter((item: any) => {
                const { beginning_debt, debt_increase, debt_reduction, ending_debt } = item;
                const isAllZero =
                    Number(beginning_debt) === 0 &&
                    Number(debt_increase) === 0 &&
                    Number(debt_reduction) === 0 &&
                    Number(ending_debt) === 0;
                return !isAllZero;
            });
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
