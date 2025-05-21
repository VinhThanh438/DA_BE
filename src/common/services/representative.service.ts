import { RepresentativeRepo } from '@common/repositories/representative.repo';
import { BaseService } from './base.service';
import { Representatives, Prisma } from '.prisma/client';
import { IPaginationInput, IPaginationResponse } from '@common/interfaces/common.interface';
import { IDebtResponse } from '@common/interfaces/debt.interface';
import { IRepresenDebtQueryFilter } from '@common/interfaces/representative.interface';
import { OrderStatus, TransactionOrderType } from '@config/app.constant';
import { OrderRepo } from '@common/repositories/order.repo';
import { TransactionRepo } from '@common/repositories/transaction.repo';

export class RepresentativeService extends BaseService<
    Representatives,
    Prisma.RepresentativesSelect,
    Prisma.RepresentativesWhereInput
> {
    private static instance: RepresentativeService;
    private orderRepo: OrderRepo = new OrderRepo();
    private transactionRepo: TransactionRepo = new TransactionRepo();

    private constructor() {
        super(new RepresentativeRepo());
    }

    public static getInstance(): RepresentativeService {
        if (!this.instance) {
            this.instance = new RepresentativeService();
        }
        return this.instance;
    }

    public async paginate({ type, ...query }: IPaginationInput): Promise<IPaginationResponse> {
        const data = await this.repo.paginate(query, true);

        const result = {
            ...data,
            data: data.data.map((item: any) => ({
                ...item,
                orders: Array.isArray(item.orders)
                    ? item.orders.map((order: any) => {
                          const commission = Array.isArray(order.details)
                              ? order.details.reduce((sum: number, detail: any) => {
                                    const quantity = detail.quantity || 0;
                                    const price = detail.price || 0;
                                    const commission = detail.commission || 0;

                                    const amount = quantity * price;
                                    const commissionValue = amount * (commission / 100);

                                    return sum + commissionValue;
                                }, 0)
                              : 0;

                          return {
                              ...order,
                              commission,
                          };
                      })
                    : [],
            })),
        };
        return result;
    }

    public async getDebt(query: IRepresenDebtQueryFilter): Promise<IDebtResponse> {
        const { startAt, endAt, representativeId } = query;

        await this.validateForeignKeys(query, {
            partner_id: this.repo,
        });

        // beginning debt
        const beforeConditions = {
            AND: [{ time_at: { lte: startAt } }, { representative_id: representativeId }],
        };

        const beforeOrders = await this.orderRepo.findMany(
            { status: OrderStatus.CONFIRMED, ...beforeConditions } as Prisma.OrdersWhereInput,
            true,
        );
        const beforeEnriched = this.enrichOrderTotals({ data: beforeOrders } as IPaginationResponse);
        const beginningDebt = beforeEnriched.data.reduce(
            (sum: any, item: any) => sum + Number(item.total_amount || 0),
            0,
        );

        const beforeTransactions = await this.transactionRepo.findMany(
            { order_type: TransactionOrderType.COMMISSION, ...beforeConditions } as Prisma.TransactionsWhereInput,
            true,
        );
        const reductionBefore = beforeTransactions.reduce((sum, item) => sum + Number(item.amount || 0), 0);

        let currentDebt = beginningDebt - reductionBefore;

        // debt during the period
        const conditions: Prisma.OrdersWhereInput = {
            AND: [{ time_at: { lte: endAt, gte: startAt } }, { representative_id: representativeId }],
        };

        let reductData = await this.transactionRepo.findMany(
            { order_type: TransactionOrderType.ORDER, ...conditions } as Prisma.TransactionsWhereInput,
            true,
        );

        let increaseData = await this.orderRepo.findMany(
            { status: OrderStatus.CONFIRMED, ...conditions } as Prisma.OrdersWhereInput,
            true,
        );

        const enrichedData = this.enrichOrderTotals({ data: increaseData } as IPaginationResponse);
        let ending = currentDebt;
        let increase = 0;
        let reduction = 0;
        let stt = 1;

        const combinedDetails: any[] = [];

        for (const ele of enrichedData.data) {
            const {
                details,
                order_expenses,
                productions,
                contracts,
                invoices,
                inventories,
                employee,
                bank,
                partner,
                representative,
                organization,
                ...orderData
            } = ele;

            ending += ele.total_amount;
            increase += ele.total_amount;

            combinedDetails.push({
                stt: stt++,
                order: orderData,
                time_at: ele.time_at,
                increase: ele.total_amount,
                reduction: 0,
                ending,
            });
        }

        for (const tran of reductData) {
            const reductionAmount = Number(tran.amount) || 0;
            reduction += reductionAmount;
            ending -= reductionAmount;

            combinedDetails.push({
                stt: stt++,
                order: null,
                time_at: tran.time_at,
                increase: 0,
                reduction: reductionAmount,
                ending,
            });
        }

        combinedDetails.sort((a, b) => new Date(a.time_at).getTime() - new Date(b.time_at).getTime());

        return {
            beginning_debt: currentDebt,
            debt_increase: increase,
            debt_reduction: reduction,
            ending_debt: currentDebt + increase - reduction,
            details: combinedDetails,
        };
    }
}
