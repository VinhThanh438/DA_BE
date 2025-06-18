import { BankRepo } from '@common/repositories/bank.repo';
import { BaseService } from './base.service';
import { Banks, Prisma } from '.prisma/client';
import { IBankTransfer } from '@common/interfaces/bank.interface';
import { DepositRepo } from '@common/repositories/deposit.repo';
import { IDepositCreate } from '@common/interfaces/deposit.interface';
import { IBank } from '@common/interfaces/bank.interface';
import { APIError } from '@common/error/api.error';

export class BankService extends BaseService<Banks, Prisma.BanksSelect, Prisma.BanksWhereInput> {
    private static instance: BankService;
    private depositRepo: DepositRepo = new DepositRepo();

    private constructor() {
        super(new BankRepo());
    }

    public static getInstance(): BankService {
        if (!this.instance) {
            this.instance = new BankService();
        }
        return this.instance;
    }

    /**
     * Phương thức chuyển tiền giữa các tài khoản ngân hàng, hiện tại chỉ hỗ trợ chuyển đến 1 tài khoản tiền gửi của công ty
     * @param request - Thông tin chuyển tiền bao gồm ID ngân hàng chuyển và nhận
     **/
    public async transfer(request: IBankTransfer, tx?: Prisma.TransactionClient): Promise<any> {
        const bank = await this.findOne(
            {
                id: request.bank_id,
            },
            true,
        );

        if (bank?.type === 'deposit') {
            // Tạo dữ liệu trong bảng deposits
            // const depositData: IDepositCreate = {
            //     deposit_date: request.time_at,
            //     amount: request.amount,
            //     unit: 'VND',
            //     bank_id: request.bank_id,
            //     organization_id: request.organization_id,
            // };
            // const data = await this.depositRepo.create(depositData, tx);
            // return data;
        } else {
            throw new APIError({ message: 'type.invalid', status: 400, errors: ['type.invalid'] });
        }
    }

    /**
     * Tạo mới ngân hàng
     * @param body - Thông tin ngân hàng cần tạo
     * @returns Ngân hàng mới được tạo
     * @throws APIError nếu ngân hàng đã tồn tại hoặc số tài khoản đã tồn tại
     */
    public async createBank(body: IBank) {
        const existingBankByName = await this.repo.findFirst({
            bank: body.bank.trim(),
            organization_id: body.organization_id,
        });

        if (existingBankByName)
            throw new APIError({ message: 'bank.duplicate', status: 409, errors: ['bank.duplicate'] });

        if (body.account_number?.trim()) {
            const existingBankByAccount = await this.repo.findFirst({
                account_number: body.account_number.trim(),
                organization_id: body.organization_id,
            });

            if (existingBankByAccount)
                throw new APIError({
                    message: 'account_number.duplicate',
                    status: 409,
                    errors: ['account_number.duplicate'],
                });
        }

        return this.repo.create({ ...body, beginning_balance: body.balance || 0 });
    }
}
