import { APIError } from '@common/error/api.error';
import { StatusCode } from '@common/errors';
import { ICreateBank, IUpdateBank } from '@common/interfaces/bank.interface';
import { IIdResponse, IPaginationInput, IPaginationResponse } from '@common/interfaces/common.interface';
import { BankRepo } from '@common/repositories/bank.repo';
import { BankType } from '@config/app.constant';

export class BankService {
    private static bankRepo: BankRepo = new BankRepo();

    static async create(body: ICreateBank): Promise<IIdResponse> {
        const exist = await this.bankRepo.findOne({ account_number: body.account_number });
        if (exist) {
            throw new APIError({
                message: 'common.existed',
                status: StatusCode.BAD_REQUEST,
            });
        }

        const id = await this.bankRepo.create(body);
        return { id };
    }
    static async update(id: number, body: IUpdateBank): Promise<IIdResponse> {
        const exist = await this.bankRepo.findOne({ id: id });
        if (!exist) {
            throw new APIError({
                message: 'common.not-found',
                status: StatusCode.BAD_REQUEST,
            });
        }
        const existAccountNumber = await this.bankRepo.findOne({ account_number: body.account_number });
        if (existAccountNumber) {
            throw new APIError({
                message: 'common.existed',
                status: StatusCode.BAD_REQUEST,
            });
        }
        const result = await this.bankRepo.update({ id: id }, body);
        return { id: result };
    }
    static async delete(id: number): Promise<IIdResponse> {
        const exist = await this.bankRepo.findOne({ id: id });
        if (!exist) {
            throw new APIError({
                message: 'common.not-found',
                status: StatusCode.BAD_REQUEST,
            });
        }
        const result = await this.bankRepo.delete({ id: id });
        return { id: result };
    }
    static async getAll(body: IPaginationInput, type: BankType | '', id: number | null): Promise<IPaginationResponse> {
        const data = await this.bankRepo.getAll(body, true, type, id);
        return data;
    }
}
