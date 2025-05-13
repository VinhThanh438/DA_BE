import { QuotationRequestRepo } from '@common/repositories/quotation-request.repo';
import { BaseService } from './base.service';
import { QuotationRequests, Prisma } from '.prisma/client';
import { IIdResponse } from '@common/interfaces/common.interface';
import { IQuotationRequest } from '@common/interfaces/quotation-request.interface';
import { UserService } from './user.service';
import { APIError } from '@common/error/api.error';
import { ErrorCode } from '@common/errors';

export class QuotationRequestService extends BaseService<
    QuotationRequests,
    Prisma.QuotationRequestsSelect,
    Prisma.QuotationRequestsWhereInput
> {
    private static instance: QuotationRequestService;
    private userService: UserService = UserService.getInstance();

    private constructor() {
        super(new QuotationRequestRepo());
    }

    public static getInstance(): QuotationRequestService {
        if (!this.instance) {
            this.instance = new QuotationRequestService();
        }
        return this.instance;
    }

    public async updateRequestQuotation(id: number, request: IQuotationRequest, userId: number): Promise<IIdResponse> {
        const receiver: any = await this.userService.findOne({ id: userId }, true);
        if (!receiver) {
            throw new APIError({
                message: 'common.user.not-found',
                status: ErrorCode.BAD_REQUEST,
            });
        }
        request.receiver_name = receiver.employee_id ? receiver.employee?.name : receiver.username;
        const dataId = await this.repo.update({ id }, request);
        return { id: dataId };
    }

    public async createRequestQuotation(request: Partial<IQuotationRequest>): Promise<IIdResponse> {
        const id = await this.repo.create(request)
        return { id };
    }
}
