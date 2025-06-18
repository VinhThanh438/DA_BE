import { BaseService } from './base.service';
import { Prisma, Loans } from '.prisma/client';
import {
    IApproveRequest,
    IIdResponse,
    IPaginationInput,
    IPaginationResponse,
} from '@common/interfaces/common.interface';
import { LoanRepo } from '@common/repositories/loan.repo';
import { PartnerRepo } from '@common/repositories/partner.repo';
import { OrganizationRepo } from '@common/repositories/organization.repo';
import { InvoiceRepo } from '@common/repositories/invoice.repo';
import { ILoan, IInterestLog } from '@common/interfaces/loan.interface';
import { OrderRepo } from '@common/repositories/order.repo';
import { transformDecimal } from '@common/helpers/transform.util';
import { TimeHelper } from '@common/helpers/time.helper';
import { InterestLogRepo } from '@common/repositories/interest-log.repo';
import { handleFiles } from '@common/helpers/handle-files';
import { calculateInterestAmount } from '@common/helpers/canculate-interest-amount.helper';
import { PaymentRequestDetailRepo } from '@common/repositories/payment-request-details.repo';
import { PaymentRepo } from '@common/repositories/payment.repo';
import logger from '@common/logger';
import { PaymentRequestType, TransactionOrderType, TransactionType } from '@config/app.constant';
import {
    IEventInterestLogPaymented,
    IPaymentCreatedEvent,
    ITransaction,
} from '@common/interfaces/transaction.interface';
import { PaymentRequestRepo } from '@common/repositories/payment-request.repo';
import { BankRepo } from '@common/repositories/bank.repo';
import moment from 'moment';
import { TransactionRepo } from '@common/repositories/transaction.repo';
import { EVENT_INTEREST_LOG_PAID, EVENT_LOAN_CREATED } from '@config/event.constant';
import eventbus from '@common/eventbus';

export class LoanService extends BaseService<Loans, Prisma.LoansSelect, Prisma.LoansWhereInput> {
    private static instance: LoanService;
    private partnerRepo: PartnerRepo = new PartnerRepo();
    private bankRepo: BankRepo = new BankRepo();
    private organizationRepo: OrganizationRepo = new OrganizationRepo();
    private orderRepo: OrderRepo = new OrderRepo();
    private paymentRequesDetailRepo: PaymentRequestDetailRepo = new PaymentRequestDetailRepo();
    private paymentRepo: PaymentRepo = new PaymentRepo();
    private invoiceRepo: InvoiceRepo = new InvoiceRepo();
    private interestLogRepo: InterestLogRepo = new InterestLogRepo();
    private paymentRequestDetailRepo: PaymentRequestDetailRepo = new PaymentRequestDetailRepo();
    private paymentRequestRepo: PaymentRequestRepo = new PaymentRequestRepo();
    private transactionRepo: TransactionRepo = new TransactionRepo();

    private constructor() {
        super(new LoanRepo());
    }

    public static getInstance(): LoanService {
        if (!this.instance) {
            this.instance = new LoanService();
        }
        return this.instance;
    }

    public generateAutoInterestSchedule(loan: Partial<ILoan>): IInterestLog[] {
        const rows: IInterestLog[] = [];

        let currentDebt = loan.amount;
        const disbursementDate = TimeHelper.parse(loan.disbursement_date as Date);
        const endDate = TimeHelper.parse(TimeHelper.getCurrentDate() as Date);
        const paymentDay = loan.payment_day;

        let closingDate = disbursementDate.clone().date(paymentDay as number);
        if (disbursementDate.isAfter(closingDate)) {
            closingDate = closingDate.add(1, 'month');
        }

        const sortedLogs = [...(loan.interest_logs || [])].sort(
            (a: IInterestLog, b: IInterestLog) =>
                TimeHelper.parse(a.time_at as Date).valueOf() - TimeHelper.parse(b.time_at as Date).valueOf(),
        );

        let currentDate = disbursementDate.clone();

        while (closingDate.isSameOrBefore(endDate)) {
            const payment = sortedLogs.find((p: IInterestLog) => {
                const paymentDate = TimeHelper.parse(p.time_at as Date);
                return paymentDate.isAfter(currentDate) && paymentDate.isSameOrBefore(closingDate);
            });

            const rawClosingDate = payment ? TimeHelper.parse(payment.time_at as Date) : closingDate.clone();
            const actualClosingDate = rawClosingDate.clone().add(1, 'day');

            const interestDays = actualClosingDate.diff(currentDate, 'day');
            const interestAmount = calculateInterestAmount(
                Number(currentDebt),
                Number(loan.interest_rate),
                interestDays,
            );

            rows.push({
                loan_id: loan.id,
                ...(loan.organization_id != null ? { organization_id: loan.organization_id } : {}),
                debt_before_payment: Number(currentDebt),
                time_at: actualClosingDate.toDate(),
                interest_rate: loan.interest_rate,
                interest_days: interestDays,
                interest_amount: interestAmount,
            });

            currentDate = actualClosingDate.clone();
            closingDate = closingDate.clone().add(1, 'month');
        }

        return rows;
    }

    public async paginate(query: IPaginationInput): Promise<IPaginationResponse> {
        const result = await this.repo.paginate(query, true);

        let totalInterestAmount = 0;
        let totalPaymentAmount = 0;
        let totalCurrentDebt = 0;

        result.data = await Promise.all(
            result.data.map(async (loan: Partial<ILoan>) => {
                if (!loan) return loan;

                let interestLogs = Array.isArray(loan.interest_logs) ? [...loan.interest_logs] : [];
                const today = TimeHelper.now().startOf('day');

                if (interestLogs.length > 0) {
                    interestLogs.sort((a, b) => {
                        const timeA = new Date(a.time_at || 0).getTime();
                        const timeB = new Date(b.time_at || 0).getTime();
                        return timeA - timeB;
                    });

                    const defaultDebt = Number(loan.current_debt) || 0;
                    const defaultRate = Number(loan.interest_rate) || 0;

                    const lastInterestLog = interestLogs[interestLogs.length - 1];
                    const interestDay = TimeHelper.getDistanceToNearestPastDay(
                        TimeHelper.parseToDate(today.toISOString()),
                        lastInterestLog.time_at as Date,
                    );
                    const interestAmount = calculateInterestAmount(
                        Number(lastInterestLog.debt_before_payment),
                        Number(loan.interest_rate),
                        interestDay,
                    );

                    interestLogs.push({
                        time_at: '',
                        interest_days: interestDay,
                        interest_amount: interestAmount,
                        debt_before_payment: defaultDebt,
                        interest_rate: defaultRate,
                        amount: 0,
                    });

                    totalCurrentDebt += defaultDebt;

                    const lastPayment = interestLogs[interestLogs.length - 1];

                    for (let log of interestLogs) {
                        totalInterestAmount += Number(log.interest_amount) || 0;
                        totalPaymentAmount += Number(log.amount) || 0;
                        if (log.is_paymented) {
                            let payment = null;
                            const paymentRequestDetail = await this.paymentRequesDetailRepo.findOne({
                                interest_log_id: log.id,
                            });
                            if (paymentRequestDetail) {
                                payment = await this.paymentRepo.findOne({
                                    payment_request_detail_id: paymentRequestDetail.id,
                                });
                            } else {
                                payment = await this.paymentRepo.findOne({
                                    interest_log_id: log.id,
                                });
                            }
                            log = payment ? Object.assign(log, { payment }) : log;
                        }
                    }

                    const lastDate = TimeHelper.parse(lastPayment.time_at as Date).startOf('day');

                    if (today.isAfter(lastDate)) {
                        const interestDays = today.diff(lastDate, 'day');
                        const interestAmount = calculateInterestAmount(
                            Number(lastPayment.debt_before_payment),
                            Number(lastPayment.interest_rate),
                            interestDays,
                        );

                        totalInterestAmount += interestAmount;
                        totalCurrentDebt += Number(lastPayment.debt_before_payment) || 0;

                        interestLogs.push({
                            ...lastPayment,
                            amount: 0,
                            time_at: '',
                            interest_days: interestDays,
                            interest_amount: interestAmount,
                        });
                    }
                } else {
                    const lastDate = TimeHelper.parse(loan.disbursement_date as Date).startOf('day');
                    const interestDays = today.diff(lastDate, 'day');
                    const interestAmount = calculateInterestAmount(
                        Number(loan.current_debt),
                        Number(loan.interest_rate),
                        interestDays,
                    );

                    totalInterestAmount += interestAmount;
                    totalCurrentDebt += Number(loan.current_debt) || 0;
                    interestLogs.push({
                        debt_before_payment: Number(loan.current_debt),
                        interest_rate: loan.interest_rate,
                        amount: 0,
                        time_at: '',
                        interest_days: interestDays,
                        interest_amount: interestAmount,
                    });
                }

                return {
                    ...loan,
                    interest_logs: interestLogs,
                };
            }),
        );

        result.summary = {
            total_amount: 12052003,
            total_payment_amount: totalPaymentAmount,
            total_current_debt: totalCurrentDebt,
            total_interest_amount: totalInterestAmount,
        };

        return transformDecimal(result);
    }

    public async create(request: Partial<ILoan>, tx?: Prisma.TransactionClient): Promise<IIdResponse> {
        await this.validateForeignKeys(
            request,
            {
                partner_id: this.partnerRepo,
                invoice_id: this.invoiceRepo,
                order_id: this.orderRepo,
                organization_id: this.organizationRepo,
                bank_id: this.bankRepo,
            },
            tx,
        );

        const { order, bank_id, order_id, invoice_id, ...rest } = request;
        rest.current_debt = rest.amount;

        const loanId = await this.repo.create({
            ...rest,
            ...(bank_id && { bank: { connect: { id: bank_id } } }),
            ...(order_id && { order: { connect: { id: order_id } } }),
            ...(invoice_id && { invoice: { connect: { id: invoice_id } } }),
        } as Partial<ILoan>);

        // Create transaction
        const transactionOUT = {
            time_at: moment().toISOString(),
            amount: Number(request.amount),
            type: TransactionType.OUT,
            organization_id: request.organization_id as number,
            order_type: TransactionOrderType.LOAN,
            partner: request.order?.partner_id ? { connect: { id: request.order?.partner_id } } : undefined,
            order: request.order_id ? { connect: { id: request.order_id } } : undefined,
            invoice: request.invoice_id ? { connect: { id: request.invoice_id } } : undefined,
            loan: loanId ? { connect: { id: loanId } } : undefined,
        };
        await this.transactionRepo.create(transactionOUT, tx);

        if (loanId) {
            const loan = await this.repo.findOne({ id: loanId }, false, tx);
            const interestLogs = this.generateAutoInterestSchedule(loan as ILoan);
            await this.interestLogRepo.createMany(interestLogs, tx);
        }

        return { id: loanId };
    }

    public async approve(id: number, body: IApproveRequest): Promise<IIdResponse> {
        const loanData = await this.validateStatusApprove(id);

        const { files, ...restData } = body;
        let dataToUpdate: any = { ...restData };
        if (files && files.length > 0) {
            let filesUpdate = handleFiles(files, [], loanData.files || []);
            dataToUpdate.files = filesUpdate;
        }
        const updatedId = await this.repo.update({ id }, dataToUpdate);

        eventbus.emit(EVENT_LOAN_CREATED, loanData);

        return { id: updatedId };
    }

    public async autoCreateInterestLogsEverySingleDay(): Promise<void> {
        const loans = await this.repo.findMany();
        for (const loan of loans) {
            const lastInterestLogRecord = await this.interestLogRepo.findFirst({ loan_id: loan.id });
            if (lastInterestLogRecord) {
                const currentDate = TimeHelper.getCurrentDate();
                const currentDay = TimeHelper.getDayOfMonth(currentDate);

                if (currentDay === Number(loan.payment_day) + 1) {
                    const interestDays = TimeHelper.getDistanceToNearestPastDay(
                        currentDate,
                        lastInterestLogRecord.time_at as Date,
                    );
                    const interestAmount = calculateInterestAmount(
                        Number(loan.current_debt),
                        Number(loan.interest_rate),
                        interestDays,
                    );
                    await this.interestLogRepo.create({
                        loan_id: loan.id,
                        debt_before_payment: loan.current_debt,
                        time_at: currentDate,
                        interest_rate: loan.interest_rate,
                        interest_days: interestDays,
                        interest_amount: interestAmount,
                    });
                }
            }
        }
    }

    private async updateCurrentDebt(loanId: number, currentDebt: number, amount: number): Promise<void> {
        const newCurrentDebt = currentDebt - amount;
        await this.repo.update(
            { id: loanId },
            {
                current_debt: newCurrentDebt,
            },
        );
    }

    public async handleLoanPayment(data: IPaymentCreatedEvent): Promise<void> {
        try {
            const { payment_request_detail_id, ...paymentData } = data;

            const paymentRequestDetail = await this.paymentRequestDetailRepo.findOne({
                id: payment_request_detail_id,
            });

            if (!paymentRequestDetail) {
                throw new Error('No payment request details found.');
            }

            const paymentRequest = await this.paymentRequestRepo.findOne({
                id: Number(paymentRequestDetail.payment_request_id),
            });

            const loan = await this.repo.findOne({ id: Number(paymentRequestDetail.loan_id) });

            const { loan_id, interest_log_id } = paymentRequestDetail;

            if (paymentRequest?.type === PaymentRequestType.LOAN && loan && loan_id) {
                await this.processLoanPayment({
                    loan_id,
                    amount: Number(paymentRequestDetail.amount),
                    paymentData,
                });
            } else if (paymentRequest?.type === PaymentRequestType.INTEREST && interest_log_id) {
                eventbus.emit(EVENT_INTEREST_LOG_PAID, {
                    id: interest_log_id,
                    isPaymented: true,
                } as unknown as IEventInterestLogPaymented);
            } else {
                throw new Error('cannot do something: lost info');
            }
        } catch (error: any) {
            throw error;
        }
    }

    public async processLoanPayment(params: {
        loan_id: number;
        amount: number;
        paymentData: Omit<IPaymentCreatedEvent, 'payment_request_detail_id'>;
    }): Promise<void> {
        const { loan_id, amount, paymentData } = params;

        const interestLastRecord = await this.interestLogRepo.findFirst({ loan_id: Number(loan_id) });
        const loan = await this.repo.findOne({ id: Number(loan_id) });

        if (!interestLastRecord) {
            throw new Error('interest log records not found!');
        }

        const distance = TimeHelper.getDistanceToNearestPastDay(
            paymentData.time_at as string,
            interestLastRecord.time_at as Date,
        );

        const interestAmount = calculateInterestAmount(
            Number(loan?.current_debt),
            Number(interestLastRecord?.interest_rate),
            distance,
        );

        const interestLogCreateData: IInterestLog = {
            loan: { connect: { id: loan_id } },
            organization: paymentData.organization,
            debt_before_payment: Number(loan?.current_debt),
            time_at: paymentData.payment_date,
            interest_rate: loan?.interest_rate,
            interest_days: distance,
            interest_amount: interestAmount,
            amount,
        };

        const newInterestLogId = await this.interestLogRepo.create(interestLogCreateData);

        if (newInterestLogId) {
            await this.updateCurrentDebt(Number(loan_id), Number(loan?.current_debt), amount);
        }

        logger.info(`Job: interest log created successfully!, id: ${newInterestLogId}`);
    }

    public async updateInterestLogStatus(id: number, isPaymented: boolean): Promise<void> {
        const interestLog = await this.interestLogRepo.findOne({ id });

        if (!interestLog) {
            throw new Error('Interest log not found!');
        }

        const updatedId = await this.interestLogRepo.update(
            { id },
            {
                is_paymented: isPaymented,
            },
        );
        logger.info(`Job: interest log updated successfully!, id: ${updatedId}`);
    }

    public async addInvoiceInfo(orderId: number, invoiceId: number): Promise<void> {
        const loan = await this.repo.findOne({ order_id: orderId });

        if (!loan) {
            throw new Error('Loan not found!');
        }

        if (loan.invoice_id) {
            throw new Error('Invoice existed!');
        }

        await this.repo.update(
            { id: loan.id },
            {
                invoice: { connect: { id: invoiceId } },
            },
        );
    }
}
