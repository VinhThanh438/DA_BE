import { BaseService } from './master/base.service';
import { PaymentRequestDetails, Prisma } from '.prisma/client';
import { IPaginationInput, IPaginationResponse } from '@common/interfaces/common.interface';
import { PaymentRequestDetailRepo } from '@common/repositories/payment-request-details.repo';

export class PaymentRequestDetailService extends BaseService<
    PaymentRequestDetails,
    Prisma.PaymentRequestDetailsSelect,
    Prisma.PaymentRequestDetailsWhereInput
> {
    private static instance: PaymentRequestDetailService;

    private constructor() {
        super(new PaymentRequestDetailRepo());
    }

    public static getInstance(): PaymentRequestDetailService {
        if (!this.instance) {
            this.instance = new PaymentRequestDetailService();
        }
        return this.instance;
    }

    public async paginate(query: IPaginationInput): Promise<IPaginationResponse> {
        if (query.OR) {
            delete query.OR;
        }

        let totalAmount = 0;
        const { status, paymentMethod, ...rest } = query;
        const aggregateConditions = status ? ({ status } as any) : {};

        if (paymentMethod) {
            const orderConditions = {
                payment_method: paymentMethod,
            } as Prisma.OrdersWhereInput;

            aggregateConditions.order = orderConditions;
            query.order = orderConditions;
            delete query.paymentMethod;
        }

        const aggregateResult = await this.repo.aggregate(aggregateConditions, {
            _sum: { amount: true },
        });

        totalAmount = Number(aggregateResult._sum?.amount || 0);

        const result = await this.repo.paginate(aggregateConditions, true);

        if (!result.summary) result.summary = {} as any;

        result.summary.total_amount = totalAmount;

        return result;
    }
}
