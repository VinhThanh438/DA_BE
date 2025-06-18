import eventbus from '@common/eventbus';
import { IEventInvoiceCreated, IInvoice } from '@common/interfaces/invoice.interface';
import logger from '@common/logger';
import { InvoiceRepo } from '@common/repositories/invoice.repo';
import { InvoiceService } from '@common/services/invoice.service';
import { EVENT_INVOICE_CREATED } from '@config/event.constant';

export class InvoiceEvent {
    private static invoiceService: InvoiceService;
    private static invoiceRepo: InvoiceRepo;

    /**
     * Register Loan event
     */
    static register(): void {
        this.invoiceService = InvoiceService.getInstance();
        this.invoiceRepo = new InvoiceRepo();

        eventbus.on(EVENT_INVOICE_CREATED, this.invoiceCreatedHandler.bind(this));
    }

    private static async invoiceCreatedHandler(data: IEventInvoiceCreated): Promise<void> {
        try {
            const invoiceId = data.invoiceId;

            const invoice = await this.invoiceRepo.findOne({ id: invoiceId }, true);

            const totalInvoice = await this.invoiceService.handleInvoiceTotal(invoice as IInvoice);
            const totalInvoiceDebt = await this.invoiceService.attachPaymentInfoToOrder(invoice as IInvoice);

            await this.invoiceRepo.update(
                { id: invoiceId },
                {
                    total_amount_paid: totalInvoiceDebt.total_amount_paid,
                    total_amount_debt: totalInvoiceDebt.total_amount_debt,
                    total_commission_paid: totalInvoiceDebt.total_commission_paid,
                    total_commission_debt: totalInvoiceDebt.total_commission_debt,

                    total_amount: totalInvoice.total_amount,
                    total_vat: totalInvoice.total_vat,
                    total_commission: totalInvoice.total_commission,
                    total_money: totalInvoice.total_money,
                },
            );

            logger.warn('InvoiceEvent.handler: invoice updated successfully.');
        } catch (error: any) {
            logger.error('InvoiceEvent.handler:', error);
        }
    }
}
