import { Partners, Prisma } from '.prisma/client';
import { APIError } from '@common/error/api.error';
import { ErrorKey, StatusCode } from '@common/errors';
import { IIdResponse, IPaginationInput, IPaginationResponse } from '@common/interfaces/common.interface';
import { ICreatePartner, IPaginationInputPartner, IUpdatePartner } from '@common/interfaces/partner.interface';
import { BankRepo } from '@common/repositories/bank.repo';
import { PartnerRepo } from '@common/repositories/partner.repo';
import { PartnerType } from '@config/app.constant';
import { BankService } from './bank.service';
import { DatabaseAdapter } from '@common/infrastructure/database.adapter';
import { BaseService } from './base.service';
import { ProductService } from './product.service';

export class PartnerService extends BaseService<Partners, Prisma.PartnersSelect, Prisma.PartnersWhereInput> {
    private partnerRepo = new PartnerRepo();
    private bankRepo = new BankRepo();
    private tx = DatabaseAdapter.getInstance();
    private static instance: PartnerService;
    private validateBankAccount(bankAccountsNotFound: number[], message: string) {
        const formattedErrors: string[] = [];

        for (const item of bankAccountsNotFound) {
            formattedErrors.push(`${message}.${item}`);
        }
        if (bankAccountsNotFound.length > 0) {
            throw new APIError({
                message: message,
                status: StatusCode.BAD_REQUEST,
                errors: formattedErrors,
            });
        }
    }
    private constructor() {
        super(new PartnerRepo());
    }
    public static getInstance(): PartnerService {
        if (!this.instance) {
            this.instance = new PartnerService();
        }
        return this.instance;
    }

    public async paginate(body: IPaginationInput): Promise<IPaginationResponse> {
        return this.partnerRepo.paginate(body, true);
    }
    public async getAllPartner(
        body: IPaginationInputPartner,
        type: PartnerType | '',
        organization_id: number | null,
    ): Promise<IPaginationResponse> {
        return this.partnerRepo.getAll(body, true, type, organization_id);
    }
    public async createPartner(body: ICreatePartner): Promise<IIdResponse> {
        const existed = await this.partnerRepo.findOne({ name: body.name, type: body.type }, true);
        if (existed) {
            throw new APIError({
                message: 'common.existed',
                status: StatusCode.BAD_REQUEST,
                errors: [`name.${ErrorKey.EXISTED}`],
            });
        }
        const data = await this.tx.$transaction(
            async (prisma) => {
                const { bank_accounts, ...mapperPartner } = body;

                const id = await this.partnerRepo.create({ ...mapperPartner }, prisma);
                const bankAccountMapper = bank_accounts.map((item) => {
                    return { ...item, partner_id: id };
                });

                if (bankAccountMapper && bankAccountMapper.length > 0) {
                    const bankAccountsExisted: number[] = [];
                    for (const item of bankAccountMapper) {
                        const existed = await BankService.bankRepo.findOne(
                            { account_number: item.account_number },
                            false,
                            prisma,
                        );
                        if (existed) {
                            bankAccountsExisted.push(Number(item.key));
                        }
                    }
                    if (bankAccountsExisted && bankAccountsExisted.length > 0) {
                        this.validateBankAccount(bankAccountsExisted, 'account_number.existed');
                    }
                    for (const item of bankAccountMapper) {
                        const { key, ...mapper } = item;
                        const id_bank = await BankService.bankRepo.create(mapper, prisma);
                    }
                }
                return id;
            },
            {
                isolationLevel: Prisma.TransactionIsolationLevel.Serializable, // optional, default defined by database configuration
                maxWait: 5000, // default: 2000
                timeout: 10000, // default: 5000
            },
        );

        return { id: data };
    }
    public async updatePartner(updateId: number, body: IUpdatePartner): Promise<IIdResponse> {
        const data = await this.tx.$transaction(
            async (prisma) => {
                const { bank_accounts, ...mapperPartner } = body;

                const existed = await this.partnerRepo.findOne({ name: body.name, type: body.type }, true);
                if (existed) {
                    throw new APIError({
                        message: 'common.existed',
                        status: StatusCode.BAD_REQUEST,
                        errors: [`name.${ErrorKey.EXISTED}`],
                    });
                }
                const id = await this.partnerRepo.update({ id: updateId }, { ...mapperPartner }, prisma);

                if (bank_accounts.add && bank_accounts.add.length > 0) {
                    const bankAccountMapper = bank_accounts.add.map((item) => {
                        return { ...item, partner_id: updateId };
                    });
                    const bankAccountsExisted: number[] = [];
                    for (const item of bankAccountMapper) {
                        const existed = await BankService.bankRepo.findOne(
                            { account_number: item.account_number },
                            false,
                            prisma,
                        );
                        if (existed) {
                            bankAccountsExisted.push(Number(item.key));
                        }
                    }
                    if (bankAccountsExisted && bankAccountsExisted.length > 0) {
                        this.validateBankAccount(bankAccountsExisted, `bank_account.${ErrorKey.EXISTED}`);
                    }
                    for (const item of bankAccountMapper) {
                        const { key, ...mapper } = item;
                        const id_bank = await BankService.bankRepo.create(mapper, prisma);
                    }
                }

                if (bank_accounts.delete && bank_accounts.delete.length > 0) {
                    const bankAccountsNotFound: number[] = [];
                    for (const item of bank_accounts.delete) {
                        const existed = await BankService.bankRepo.findOne({ id: item.id }, false, prisma);
                        if (!existed) {
                            bankAccountsNotFound.push(Number(item.key));
                        }
                    }
                    if (bankAccountsNotFound && bankAccountsNotFound.length > 0) {
                        this.validateBankAccount(bankAccountsNotFound, `bank_account.${ErrorKey.NOT_FOUND}`);
                    }
                    for (const item of bank_accounts.delete) {
                        const id_delete_bank = await BankService.bankRepo.delete({ id: item.id }, prisma);
                    }
                }

                if (bank_accounts.update && bank_accounts.update.length > 0) {
                    const bankAccountsNotFound: number[] = [];
                    const bankAccountsExisted: number[] = [];
                    for (const item of bank_accounts.update) {
                        const notFound = await BankService.bankRepo.findOne({ id: item.bank_id }, false, prisma);
                        if (!notFound) {
                            bankAccountsNotFound.push(Number(item.key));
                        }
                        const existed = await BankService.bankRepo.findOne(
                            { account_number: item.account_number },
                            false,
                            prisma,
                        );
                        if (existed) {
                            bankAccountsExisted.push(Number(item.key));
                        }
                    }
                    if (bankAccountsExisted.length > 0 || bankAccountsNotFound.length > 0) {
                        this.validateBankAccount(bankAccountsExisted, `bank_account.${ErrorKey.EXISTED}`);
                        this.validateBankAccount(bankAccountsNotFound, `bank_account.${ErrorKey.NOT_FOUND}`);
                    }
                    for (const item of bank_accounts.update) {
                        const { bank_id, key, ...mapper } = item;

                        const id_update_bank = await BankService.bankRepo.update({ id: item.bank_id }, mapper, prisma);
                    }
                }

                return id;
            },
            {
                isolationLevel: Prisma.TransactionIsolationLevel.Serializable, // optional, default defined by database configuration
                maxWait: 5000, // default: 2000
                timeout: 10000, // default: 5000
            },
        );
        return { id: data };
    }

    public async deletePartner(deleteId: number): Promise<IIdResponse> {
        const notFound = await this.partnerRepo.findOne({ id: deleteId });
        if (!notFound) {
            throw new APIError({
                message: 'common.not_found',
                status: StatusCode.BAD_REQUEST,
                errors: [`id.${ErrorKey.NOT_FOUND}`],
            });
        }
        const id = await this.partnerRepo.delete({ id: deleteId });
        return { id };
    }

    public async findByIdPartner(id: number): Promise<Partial<Partners | null>> {
        const data = await this.partnerRepo.findOne({ id }, true);

        if (!data) {
            throw new APIError({
                message: 'common.not_found',
                status: StatusCode.BAD_REQUEST,
                errors: [`id.${ErrorKey.NOT_FOUND}`],
            });
        }

        return data;
    }
}
