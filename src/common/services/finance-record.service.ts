import { BaseService } from './base.service';
import { FinanceRecords, Prisma } from '.prisma/client';
import { IIdResponse } from '@common/interfaces/common.interface';
import { APIError } from '@common/error/api.error';
import { ErrorCode } from '@common/errors';
import { OrderRepo } from '@common/repositories/order.repo';
import { IFinanceRecord } from '@common/interfaces/finance-record.interface';
import { FinanceRecordRepo } from '@common/repositories/finance-record.repo';

export class FinanceRecordService extends BaseService<
    FinanceRecords,
    Prisma.FinanceRecordsSelect,
    Prisma.FinanceRecordsWhereInput
> {
    private static instance: FinanceRecordService;
    private orderRepo: OrderRepo = new OrderRepo();

    private constructor() {
        super(new FinanceRecordRepo());
    }

    public static getInstance(): FinanceRecordService {
        if (!this.instance) {
            this.instance = new FinanceRecordService();
        }
        return this.instance;
    }

    public async createFinanceRecord(data: Partial<IFinanceRecord>, tx?: Prisma.TransactionClient): Promise<IIdResponse> {
        const existed = await this.repo.findOne({ code: data.code, type: data.type }, false, tx);

        if (existed) {
            throw new APIError({
                message: 'common.existed',
                status: ErrorCode.BAD_REQUEST,
                errors: ['code.existed'],
            });
        }

        const runTransaction = async (transaction: Prisma.TransactionClient) => {
            const id = await this.repo.create(data, transaction);
            return { id };
        };

        if (tx) {
            return await runTransaction(tx);
        }

        return await this.db.$transaction(async (transaction) => {
            return await runTransaction(transaction);
        });
    }

    public async updateFinanceRecord(id: number, request: Partial<IFinanceRecord>): Promise<IIdResponse> {
        await this.isExist({ code: request.code, id }, true);

        await this.validateForeignKeys(request, { order_id: this.orderRepo });

        await this.repo.update({ id }, request);

        return { id };
    }
}
