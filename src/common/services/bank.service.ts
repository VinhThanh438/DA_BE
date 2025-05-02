import { APIError } from '@common/error/api.error';
import { ErrorKey, StatusCode } from '@common/errors';
import { ICreateBank, IUpdateBank } from '@common/interfaces/bank.interface';
import { IIdResponse, IPaginationInput, IPaginationResponse } from '@common/interfaces/common.interface';
import { BankRepo } from '@common/repositories/bank.repo';
import { PartnerRepo } from '@common/repositories/partner.repo';
import { BankType } from '@config/app.constant';

export class BankService {
    public static bankRepo: BankRepo = new BankRepo();
    public static partnerRepo: PartnerRepo = new PartnerRepo();

    static async create(body: ICreateBank): Promise<IIdResponse> {
        const exist = await this.bankRepo.findOne({ account_number: body.account_number });
        if (exist) {
            throw new APIError({
                message: `account_number.${ErrorKey.EXISTED}`,
                status: StatusCode.BAD_REQUEST,
                errors: [`account_number.${ErrorKey.EXISTED}`],
            });
        }
        const checkFKey = await this.partnerRepo.findOne({ id: Number(body.partner_id) });
        if (!checkFKey) {
            throw new APIError({
                message: `partner_id.${ErrorKey.NOT_FOUND}`,
                status: StatusCode.BAD_REQUEST,
                errors: [`partner_id.${ErrorKey.NOT_FOUND}`],
            });
        }
        const id = await this.bankRepo.create(body);
        return { id };
    }
    static async update(id: number, body: IUpdateBank): Promise<IIdResponse> {
        const exist = await this.bankRepo.findOne({ id: id });
        if (!exist) {
            throw new APIError({
                message: `id.${ErrorKey.NOT_FOUND}`,
                status: StatusCode.BAD_REQUEST,
                errors: [`id.${ErrorKey.NOT_FOUND}`],
            });
        }
        const existAccountNumber = await this.bankRepo.findOne({ account_number: body.account_number });
        if (existAccountNumber) {
            throw new APIError({
                message: `account_number.${ErrorKey.EXISTED}`,
                status: StatusCode.BAD_REQUEST,
                errors: [`account_number.${ErrorKey.EXISTED}`],
            });
        }
        const result = await this.bankRepo.update({ id: id }, body);
        return { id: result };
    }
    static async delete(id: number): Promise<IIdResponse> {
        const exist = await this.bankRepo.findOne({ id: id });
        if (!exist) {
            throw new APIError({
                message: `id.${ErrorKey.NOT_FOUND}`,
                status: StatusCode.BAD_REQUEST,
                errors: [`id.${ErrorKey.NOT_FOUND}`],
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
