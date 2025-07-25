"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BankService = void 0;
const bank_repo_1 = require("../repositories/bank.repo");
const base_service_1 = require("./master/base.service");
const api_error_1 = require("../error/api.error");
const errors_1 = require("../errors");
const transaction_repo_1 = require("../repositories/transaction.repo");
const app_constant_1 = require("../../config/app.constant");
const time_adapter_1 = require("../infrastructure/time.adapter");
class BankService extends base_service_1.BaseService {
    constructor() {
        super(new bank_repo_1.BankRepo());
        this.transactionRepo = new transaction_repo_1.TransactionRepo();
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new BankService();
        }
        return this.instance;
    }
    /**
     * Phương thức chuyển tiền giữa các tài khoản ngân hàng, hiện tại chỉ hỗ trợ chuyển đến 1 tài khoản tiền gửi của công ty
     * @param request - Thông tin chuyển tiền bao gồm ID ngân hàng chuyển và nhận
     **/
    transfer(request, tx) {
        return __awaiter(this, void 0, void 0, function* () {
            const bank = yield this.findOne({
                id: request.bank_id,
            }, true);
            if ((bank === null || bank === void 0 ? void 0 : bank.type) === 'deposit') {
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
            }
            else {
                throw new api_error_1.APIError({ message: 'type.invalid', status: 400, errors: ['type.invalid'] });
            }
        });
    }
    /**
     * Tạo mới ngân hàng
     * @param body - Thông tin ngân hàng cần tạo
     * @returns Ngân hàng mới được tạo
     * @throws APIError nếu ngân hàng đã tồn tại hoặc số tài khoản đã tồn tại
     */
    createBank(body) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const existingBankByName = yield this.repo.findFirst({
                bank: body.bank.trim(),
                organization_id: body.organization_id,
            });
            if (existingBankByName)
                throw new api_error_1.APIError({ message: 'bank.duplicate', status: 409, errors: ['bank.duplicate'] });
            if ((_a = body.account_number) === null || _a === void 0 ? void 0 : _a.trim()) {
                const existingBankByAccount = yield this.repo.findFirst({
                    account_number: body.account_number.trim(),
                    organization_id: body.organization_id,
                });
                if (existingBankByAccount)
                    throw new api_error_1.APIError({
                        message: 'account_number.duplicate',
                        status: 409,
                        errors: ['account_number.duplicate'],
                    });
            }
            const createdId = yield this.repo.create(Object.assign(Object.assign({}, body), { beginning_balance: body.balance || 0 }));
            return { id: createdId };
        });
    }
    fundBalance(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const { startAt, endAt } = query, filters = __rest(query, ["startAt", "endAt"]);
            const parsedStartAt = time_adapter_1.TimeAdapter.parseStartOfDayDate(startAt).toISOString();
            const parsedEndAt = time_adapter_1.TimeAdapter.parseEndOfDayDate(endAt).toISOString();
            // Lấy danh sách banks theo filter
            const banksResult = yield this.repo.paginate(filters, true);
            // Tính toán fund balance cho từng bank
            const banksWithFundBalance = yield Promise.all(banksResult.data.map((bank) => __awaiter(this, void 0, void 0, function* () {
                // Lấy tất cả transactions của bank này
                const allTransactions = yield this.transactionRepo.findMany({
                    bank_id: bank.id,
                });
                // Phân loại transactions theo thời gian
                const beforeTransactions = allTransactions.filter((tx) => tx.time_at && new Date(tx.time_at) < new Date(parsedStartAt));
                const inPeriodTransactions = allTransactions.filter((tx) => {
                    if (!tx.time_at)
                        return false;
                    const txTime = new Date(tx.time_at);
                    return txTime >= new Date(parsedStartAt) && txTime <= new Date(parsedEndAt);
                });
                // Tính tồn đầu kỳ (số dư ban đầu + giao dịch trước kỳ)
                const beforeIncrease = beforeTransactions.reduce((sum, tx) => sum + (tx.type === app_constant_1.TransactionType.IN ? Number(tx.amount || 0) : 0), 0);
                const beforeDecrease = beforeTransactions.reduce((sum, tx) => sum + (tx.type === app_constant_1.TransactionType.OUT ? Number(tx.amount || 0) : 0), 0);
                const beginningBalance = Number(bank.beginning_balance || 0) + beforeIncrease - beforeDecrease;
                // Tính tăng/giảm trong kỳ
                const increaseAmount = inPeriodTransactions.reduce((sum, tx) => sum + (tx.type === app_constant_1.TransactionType.IN ? Number(tx.amount || 0) : 0), 0);
                const decreaseAmount = inPeriodTransactions.reduce((sum, tx) => sum + (tx.type === app_constant_1.TransactionType.OUT ? Number(tx.amount || 0) : 0), 0);
                // Tính tồn cuối kỳ
                const endingBalance = beginningBalance + increaseAmount - decreaseAmount;
                return Object.assign(Object.assign({}, bank), { beinning: beginningBalance, increase: increaseAmount, reduction: decreaseAmount, ending: endingBalance });
            })));
            banksResult.data = banksWithFundBalance;
            return banksResult;
        });
    }
    paginate(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const { startAt, endAt } = query, filters = __rest(query, ["startAt", "endAt"]);
            if (startAt && endAt) {
                return yield this.fundBalance(query);
            }
            else {
                return yield this.repo.paginate(query);
            }
        });
    }
    /**
     * Lấy fund balance chi tiết cho một bank cụ thể
     * @param bankId - ID của bank
     * @param startAt - Ngày bắt đầu
     * @param endAt - Ngày kết thúc
     * @returns Fund balance chi tiết của bank
     */
    getFundBalanceById(bankId, startAt, endAt) {
        return __awaiter(this, void 0, void 0, function* () {
            const bank = yield this.repo.findOne({ id: bankId }, true);
            if (!bank) {
                throw new api_error_1.APIError({
                    message: 'common.not-found',
                    status: errors_1.StatusCode.REQUEST_NOT_FOUND,
                    errors: [`bank.${errors_1.ErrorKey.NOT_FOUND}`],
                });
            }
            const parsedStartAt = time_adapter_1.TimeAdapter.parseStartOfDayDate(startAt).toISOString();
            const parsedEndAt = time_adapter_1.TimeAdapter.parseEndOfDayDate(endAt).toISOString();
            // Lấy tất cả transactions của bank này
            const allTransactions = yield this.transactionRepo.findMany({
                bank_id: bankId,
            }, true);
            // Phân loại transactions theo thời gian
            const beforeTransactions = allTransactions.filter((tx) => tx.time_at && new Date(tx.time_at) < new Date(parsedStartAt));
            const inPeriodTransactions = allTransactions.filter((tx) => {
                if (!tx.time_at)
                    return false;
                const txTime = new Date(tx.time_at);
                return txTime >= new Date(parsedStartAt) && txTime <= new Date(parsedEndAt);
            });
            // Tính tồn đầu kỳ
            const beforeIncrease = beforeTransactions.reduce((sum, tx) => sum + (tx.type === app_constant_1.TransactionType.IN ? Number(tx.amount || 0) : 0), 0);
            const beforeDecrease = beforeTransactions.reduce((sum, tx) => sum + (tx.type === app_constant_1.TransactionType.OUT ? Number(tx.amount || 0) : 0), 0);
            const beginningBalance = Number(bank.beginning_balance || 0) + beforeIncrease - beforeDecrease;
            // Tính tăng/giảm trong kỳ
            const increaseAmount = inPeriodTransactions.reduce((sum, tx) => sum + (tx.type === app_constant_1.TransactionType.IN ? Number(tx.amount || 0) : 0), 0);
            const decreaseAmount = inPeriodTransactions.reduce((sum, tx) => sum + (tx.type === app_constant_1.TransactionType.OUT ? Number(tx.amount || 0) : 0), 0);
            // Tính tồn cuối kỳ
            const endingBalance = beginningBalance + increaseAmount - decreaseAmount;
            return Object.assign(Object.assign({}, bank), { beginning: beginningBalance, increase: increaseAmount, decrease: decreaseAmount, ending: endingBalance, transactions: inPeriodTransactions });
        });
    }
}
exports.BankService = BankService;
