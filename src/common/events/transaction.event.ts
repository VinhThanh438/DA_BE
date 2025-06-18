import eventbus from '@common/eventbus';
import { IInvoice } from '@common/interfaces/invoice.interface';
import { IEventLoanCreated } from '@common/interfaces/loan.interface';
import { IPaymentCreatedEvent, ITransaction } from '@common/interfaces/transaction.interface';
import logger from '@common/logger';
import { InterestLogRepo } from '@common/repositories/interest-log.repo';
import { InvoiceRepo } from '@common/repositories/invoice.repo';
import { LoanRepo } from '@common/repositories/loan.repo';
import { OrderRepo } from '@common/repositories/order.repo';
import { TransactionRepo } from '@common/repositories/transaction.repo';
import { InvoiceService } from '@common/services/invoice.service';
import { TransactionService } from '@common/services/transaction.service';
import { TransactionOrderType, TransactionType } from '@config/app.constant';
import { EVENT_INTEREST_LOG_PAID, EVENT_LOAN_CREATED, EVENT_PAYMENT_CREATED } from '@config/event.constant';

export class TransactionEvent {
    /**
     * Register Transaction event
     */
    private static transactionService: TransactionService;
    private static invoiceService: InvoiceService;
    private static invoiceRepo: InvoiceRepo;
    private static orderRepo: OrderRepo;
    private static loanRepo: LoanRepo;
    private static interestLogRepo: InterestLogRepo;
    private static transactionRepo: TransactionRepo;

    static register(): void {
        this.transactionService = TransactionService.getInstance();
        this.invoiceService = InvoiceService.getInstance();
        this.invoiceRepo = new InvoiceRepo();
        this.orderRepo = new OrderRepo();
        this.loanRepo = new LoanRepo();
        this.interestLogRepo = new InterestLogRepo();
        this.transactionRepo = new TransactionRepo();

        eventbus.on(EVENT_PAYMENT_CREATED, this.paymentCreatedHandler.bind(this));
        eventbus.on(EVENT_LOAN_CREATED, this.loanCreatedHandler.bind(this));
    }

    private static async paymentCreatedHandler(data: IPaymentCreatedEvent): Promise<void> {
        try {
            const {
                new_bank_balance,
                bank_id,
                payment_request_detail_id,
                interest_log_id,
                order_type,
                ...transactionData
            } = data;
            if (payment_request_detail_id) {
                const transaction = await this.transactionService.createTransactionByPaymentRequestDetail(
                    payment_request_detail_id,
                    transactionData,
                );

                logger.info('TransactionEvent.paymentCreatedHandler: transaction created successfully');
                if (transaction && transaction.invoice_id) {
                    const invoice = await this.invoiceRepo.findOne({ id: transaction.invoice_id }, true);

                    if (invoice) {
                        const totalInvoice = await this.invoiceService.attachPaymentInfoToOrder(invoice as IInvoice);

                        if (totalInvoice.total_amount_debt && totalInvoice.total_amount_debt <= 0) {
                            // Update invoice status to PAID if total amount debt is 0 or less
                            await this.invoiceRepo.update({ id: invoice.id }, { is_payment_completed: true });
                            logger.info('TransactionEvent.paymentCreatedHandler: invoice status updated to PAID');
                        }

                        const totalInvoiceDebt = await this.invoiceService.attachPaymentInfoToOrder(
                            invoice as IInvoice,
                        );

                        await this.invoiceRepo.update(
                            { id: invoice.id },
                            {
                                total_amount_paid: totalInvoiceDebt.total_amount_paid,
                                total_amount_debt: totalInvoiceDebt.total_amount_debt,
                                total_commission_paid: totalInvoiceDebt.total_commission_paid,
                                total_commission_debt: totalInvoiceDebt.total_commission_debt,
                            },
                        );
                        logger.info('TransactionEvent.paymentCreatedHandler: debt updated successfully.');
                    }
                }
            } else if (interest_log_id) {
                const interesLog = await this.interestLogRepo.findOne({ id: interest_log_id }, true);

                if (!interesLog) {
                    logger.warn('TransactionEvent.paymentCreatedHandler: Interest log not found.');
                    return;
                }

                const loan = await this.loanRepo.findOne({ id: interesLog.loan_id }, true);
                if (!loan) {
                    logger.warn('TransactionEvent.paymentCreatedHandler: Loan not found.');
                    return;
                }

                const transactionDataWithInterest = {
                    ...transactionData,
                    type: TransactionType.OUT,
                    order_type,
                    bank: bank_id ? { connect: { id: bank_id } } : undefined,
                    invoice: loan.invoice_id ? { connect: { id: loan.invoice_id } } : undefined,
                    order: loan.order_id ? { connect: { id: loan.order_id } } : undefined,
                    partner: loan.partner_id ? { connect: { id: loan.partner_id } } : undefined,
                    loan: loan ? { connect: { id: loan.id } } : undefined,
                };

                await this.transactionRepo.create(transactionDataWithInterest);

                eventbus.emit(EVENT_INTEREST_LOG_PAID, {
                    interestLogId: interesLog.id,
                    isPaymented: true,
                });
                logger.info('TransactionEvent.paymentCreatedHandler: interest transaction created successfully.');
            } else {
                logger.warn('TransactionEvent.paymentCreatedHandler: No infomation found!');
            }
        } catch (error: any) {
            logger.error('TransactionEvent.paymentCreatedHandler:', error);
        }
    }

    private static async loanCreatedHandler(loan: IEventLoanCreated): Promise<void> {
        try {
            const { order_id, invoice_id, amount } = loan;

            const order = await this.orderRepo.findOne({ id: Number(order_id) });

            const transactionData: ITransaction = {
                order_id: order_id ? order_id : undefined,
                invoice_id: invoice_id ? invoice_id : undefined,
                amount: Number(amount),
                partner_id: Number(order?.partner_id),
                type: TransactionType.OUT,
                order_type: TransactionOrderType.LOAN,
                organization_id: Number(order?.organization_id),
            };

            await this.transactionService.create(transactionData as any);
            logger.info('TransactionEvent.loanCreatedHandler: transaction created successfully.');
        } catch (error: any) {
            logger.error('TransactionEvent.loanCreatedHandler:', error);
        }
    }
}
