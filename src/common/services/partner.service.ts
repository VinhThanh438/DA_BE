import { PartnerRepo } from '@common/repositories/partner.repo';
import { BaseService } from './base.service';
import { Partners, Prisma } from '.prisma/client';
import { IPartnerDebtQueryFilter, IPartner } from '@common/interfaces/partner.interface';
import { IIdResponse, IPaginationResponse, IUpdateChildAction } from '@common/interfaces/common.interface';
import { PartnerGroupRepo } from '@common/repositories/partner-group.repo';
import { EmployeeRepo } from '@common/repositories/employee.repo';
import { ClauseRepo } from '@common/repositories/clause.repo';
import {
    DEFAULT_EXCLUDED_FIELDS,
    OrderStatus,
    PaymentRequestStatus,
    PaymentRequestType,
    TransactionOrderType,
} from '@config/app.constant';
import { RepresentativeRepo } from '@common/repositories/representative.repo';
import { BankRepo } from '@common/repositories/bank.repo';
import { APIError } from '@common/error/api.error';
import { StatusCode, ErrorCode, ErrorKey } from '@common/errors';
import { OrderRepo } from '@common/repositories/order.repo';
import { IDebtDetail, IDebtResponse } from '@common/interfaces/debt.interface';
import { TransactionRepo } from '@common/repositories/transaction.repo';
import { PaymentRequestRepo } from '@common/repositories/payment-request.repo';
import { IPaymentRequest } from '@common/interfaces/payment-request.interface';

export class PartnerService extends BaseService<Partners, Prisma.PartnersSelect, Prisma.PartnersWhereInput> {
    private static instance: PartnerService;
    private employeeRepo: EmployeeRepo = new EmployeeRepo();
    private parterGroupRepo: PartnerGroupRepo = new PartnerGroupRepo();
    private clauseRepo: ClauseRepo = new ClauseRepo();
    private bankRepo: BankRepo = new BankRepo();
    private orderRepo: OrderRepo = new OrderRepo();
    private transactionRepo: TransactionRepo = new TransactionRepo();
    private representativeRepo: RepresentativeRepo = new RepresentativeRepo();
    private paymentRequestRepo: PaymentRequestRepo = new PaymentRequestRepo();

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
        await this.isExist({ representative_phone: request.representative_phone });
        for (const item of request.representatives) {
            const checkPhone = await this.representativeRepo.findOne({ phone: item.phone });
            const checkEmail = await this.representativeRepo.findOne({ email: item.email });
            if (checkPhone) {
                throw new APIError({
                    status: StatusCode.BAD_REQUEST,
                    message: 'phone.existed',
                    errors: ['phone.existed'],
                });
            }
            if (checkEmail) {
                throw new APIError({
                    status: StatusCode.BAD_REQUEST,
                    message: 'email.existed',
                    errors: ['email.existed'],
                });
            }
        }
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

    public async getDebt(query: IPartnerDebtQueryFilter): Promise<IDebtResponse> {
        const { startAt, endAt, partnerId } = query;

        await this.validateForeignKeys(query, {
            partner_id: this.repo,
        });

        // beginning debt
        const beforeConditions = {
            AND: [{ time_at: { lte: startAt } }, { partner_id: partnerId }],
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
            { order_type: TransactionOrderType.ORDER, ...beforeConditions } as Prisma.TransactionsWhereInput,
            true,
        );
        const reductionBefore = beforeTransactions.reduce((sum, item) => sum + Number(item.amount || 0), 0);

        let currentDebt = beginningDebt - reductionBefore;

        // debt during the period
        const conditions: Prisma.OrdersWhereInput = {
            AND: [{ time_at: { lte: endAt, gte: startAt } }, { partner_id: partnerId }],
        };

        let increaseData = await this.orderRepo.findMany(
            { status: OrderStatus.CONFIRMED, ...conditions } as Prisma.OrdersWhereInput,
            true,
        );

        const enrichedData = this.enrichOrderTotals({ data: increaseData } as IPaginationResponse);
        let ending = currentDebt;
        let increase = 0;
        let reduction = 0;

        const combinedDetails: IDebtDetail[] = [];

        for (const ele of enrichedData.data) {
            const {
                details,
                order_expenses,
                productions,
                contracts,
                invoice,
                inventories,
                employee,
                bank,
                partner,
                representative,
                organization,
                ...orderData
            } = ele;

            increase += ele.total_amount;

            const reductData = await this.transactionRepo.findMany(
                { order_id: orderData.id } as Prisma.TransactionsWhereInput,
                true,
            );

            const paymentRequest = await this.paymentRequestRepo.findMany(
                {
                    status: PaymentRequestStatus.CONFIRMED,
                    type: PaymentRequestType.ORDER,
                } as Prisma.PaymentRequestsWhereInput,
                true,
            );

            if (reductData.length > 0) {
                reductData.forEach((item: any) => {
                    ending += item.amount;
                    reduction += item.amount;
                    combinedDetails.push({
                        order: orderData,
                        invoice: orderData.invoice,
                        total_amount: ele.total_amount,
                        total_reduction: item.amount,
                        time_at: item.time_at,
                        amount: item.amount,
                        bank: item.bank,
                        payment_requests: paymentRequest as IPaymentRequest[],
                    });
                });
            } else {
                combinedDetails.push({
                    order: orderData,
                    invoice: orderData.invoice,
                    total_amount: ele.total_amount,
                    total_reduction: 0,
                    time_at: null,
                    amount: 0,
                    bank: null,
                    payment_requests: paymentRequest as IPaymentRequest[],
                });
            }
        }
        

        combinedDetails.sort((a, b) => {
            const aTime = a.invoice?.time_at ? new Date(a.invoice.time_at as unknown as string).getTime() : 0;
            const bTime = b.invoice?.time_at ? new Date(b.invoice?.time_at as unknown as string).getTime() : 0;
            return aTime - bTime;
        });

        return {
            beginning_debt: currentDebt,
            debt_increase: increase,
            debt_reduction: reduction,
            ending_debt: currentDebt + increase - reduction,
            details: combinedDetails,
        };
    }
}
