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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DepositService = void 0;
const base_service_1 = require("./master/base.service");
const deposit_repo_1 = require("../repositories/deposit.repo");
const bank_repo_1 = require("../repositories/bank.repo");
const organization_repo_1 = require("../repositories/organization.repo");
const moment_timezone_1 = __importDefault(require("moment-timezone"));
const api_error_1 = require("../error/api.error");
const app_constant_1 = require("../../config/app.constant");
const transaction_repo_1 = require("../repositories/transaction.repo");
const payment_repo_1 = require("../repositories/payment.repo");
class DepositService extends base_service_1.BaseService {
    constructor() {
        super(new deposit_repo_1.DepositRepo());
        this.bankRepo = new bank_repo_1.BankRepo();
        this.paymentRepo = new payment_repo_1.PaymentRepo();
        this.organizationRepo = new organization_repo_1.OrganizationRepo();
        this.transactionRepo = new transaction_repo_1.TransactionRepo();
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new DepositService();
        }
        return this.instance;
    }
    /**
     * Tạo một khoản tiền gửi mới, bao gồm việc xác thực các khóa ngoại , service này sẽ được gọi khi co giao dịch chuyển tiền vào 1 tài khoản tiền gửi.
     * @param request - The deposit creation request containing bank_id, organization_id, and other fields
     * @param tx - Optional transaction client for database operations
     * @returns The ID of the created deposit
     * @throws APIError if foreign keys are invalid or required fields are missing
     */
    createDeposit(request, userId, employeeId, tx) {
        return __awaiter(this, void 0, void 0, function* () {
            // Validate required fields
            yield this.validateForeignKeys(request, {
                bank_id: this.bankRepo,
                organization_id: this.organizationRepo,
            }, tx);
            yield this.isExist({ account_number: request.account_number });
            const bank = yield this.bankRepo.findOne({ id: request.bank_id });
            if (!bank) {
                throw new api_error_1.APIError({ message: 'bank_id.not_found', status: 400, errors: ['bank_id.not_found'] });
            }
            if (request.amount > Number(bank.balance)) {
                throw new api_error_1.APIError({
                    message: 'amount.invalid',
                    status: 400,
                    errors: ['amount.invalid'],
                });
            }
            const withdraw_date = (0, moment_timezone_1.default)(request.deposit_date).add(request.term, 'months').toISOString();
            const compound_interest = Number(request.amount) *
                Math.pow(1 + request.interest_rate / 100, request.term / 12);
            const dataCreate = Object.assign(Object.assign({}, request), { withdraw_date,
                compound_interest, employee_id: employeeId, created_by: userId, time_at: (0, moment_timezone_1.default)().toISOString() });
            // Create the deposit record
            const depositId = yield this.repo.create(dataCreate, tx);
            if (depositId) {
                // Trừ số dư khả dụng trong tài khoản ngân hàng
                yield this.bankRepo.update({ id: request.bank_id }, { balance: Number(bank.balance) - Number(request.amount) }, tx);
                // Create payment transaction
                const paymentData = {
                    code: '',
                    status: app_constant_1.PaymentRequestStatus.CONFIRMED,
                    type: app_constant_1.PaymentType.EXPENSE,
                    time_at: (0, moment_timezone_1.default)(request.time_at).toDate(),
                    payment_date: (0, moment_timezone_1.default)(request.deposit_date).toDate(),
                    bank_id: request.bank_id,
                    organization_id: request.organization_id,
                };
                yield this.paymentRepo.create(paymentData);
                const transactionOUT = {
                    amount: Number(request.amount),
                    bank_id: request.bank_id,
                    type: app_constant_1.TransactionType.OUT,
                    organization_id: request.organization_id,
                    order_type: app_constant_1.TransactionOrderType.INTEREST,
                };
                yield this.transactionRepo.create(transactionOUT, tx);
                // eventbus.emit(EVENT_PAYMENT_CREATED, transactionOUT as ITransaction);
            }
            return {
                id: depositId,
            };
        });
    }
    /**
     * Cập nhật thông tin một khoản tiền gửi, bao gồm tính toán ngày rút tiền và lãi suất.
     * Nhân viên chỉ được phép cập nhật thông tin khoản tiền gửi nếu khoản tiền gửi đó chưa được xác nhận hoặc đã được xác nhận nhưng chưa cập nhật quá 1 lần.
     * @param id - The ID of the deposit to update
     * @param request - The update request containing term, interest rate, and other fields
     * @param tx - Optional transaction client for database operations
     * @returns The updated deposit record
     * @throws APIError if the deposit with the given ID does not exist
     */
    updateDeposit(id, request, tx) {
        return __awaiter(this, void 0, void 0, function* () {
            // Validate foreign keys
            const existingDeposit = yield this.repo.findOne({ id }, true);
            if (!existingDeposit) {
                throw new api_error_1.APIError({ message: 'id.not_found', status: 400, errors: ['id.not_found'] });
            }
            if ((existingDeposit.status === 'confirmed' && existingDeposit.update_count >= 1) ||
                existingDeposit.status === 'rejected') {
                throw new api_error_1.APIError({
                    message: 'status.cannot_edit',
                    status: 400,
                    errors: ['status.cannot_edit'],
                });
            }
            let dataUpdate = {};
            if (existingDeposit.status === 'pending') {
                if (request.deposit_date) {
                    dataUpdate.deposit_date = request.deposit_date;
                }
                if (request.amount) {
                    dataUpdate.amount = request.amount;
                }
                if (request.bank_id) {
                    dataUpdate.bank_id = request.bank_id;
                }
            }
            else {
                if (!request.interest_rate || !request.account_number || !request.unit || !request.term) {
                    throw new api_error_1.APIError({
                        message: 'deposit.update_fields_required',
                        status: 400,
                        errors: ['deposit.update_fields_required'],
                    });
                }
                const withdraw_date = (0, moment_timezone_1.default)(existingDeposit.deposit_date).add(request.term, 'months').toISOString();
                const compound_interest = Number(existingDeposit.amount) *
                    Math.pow(1 + request.interest_rate / 100, request.term / 12);
                // If the deposit is confirmed, we can only update the withdraw_date and compound_interest
                dataUpdate = {
                    account_number: request.account_number,
                    interest_rate: request.interest_rate,
                    unit: request.unit,
                    term: request.term,
                    withdraw_date,
                    compound_interest,
                    // update_count: (existingDeposit.update_count as number) + 1,
                };
            }
            // Update the deposit record
            const updatedDeposit = yield this.repo.update({ id: id }, dataUpdate, tx);
            return updatedDeposit;
        });
    }
    /**
     * Phê duyệt hoặc từ chối một khoản tiền gửi, nếu phê duyệt thì cập nhật trạng thái và tạo các giao dịch tương ứng.
     * @param id - The ID of the deposit to approve
     * @param request - The approval request containing status, file, and note
     * @returns The updated deposit record
     * @throws Error if the deposit with the given ID does not exist
     */
    approve(id, request, tx) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            // Validate foreign keys
            const existingDeposit = yield this.repo.findOne({ id });
            if (!existingDeposit) {
                throw new api_error_1.APIError({ message: 'id.not_found', status: 400, errors: ['id.not_found'] });
            }
            if (existingDeposit.status !== 'pending') {
                throw new api_error_1.APIError({
                    message: 'status.already_confirmed',
                    status: 400,
                    errors: ['status.already_confirmed'],
                });
            }
            const bank = yield this.bankRepo.findOne({ id: existingDeposit.bank_id });
            if (!bank) {
                throw new api_error_1.APIError({ message: 'bank_id.not_found', status: 400, errors: ['bank_id.not_found'] });
            }
            if (Number(existingDeposit.amount) > Number(bank.balance)) {
                throw new api_error_1.APIError({
                    message: 'amount.amount_exceed_balance',
                    status: 400,
                    errors: ['amount.amount_exceed_balance'],
                });
            }
            // Update the deposit status to approved
            if (request.file) {
                let files = existingDeposit.files || [];
                files.push(request.file);
                delete request.file;
                request.files = files;
            }
            if (request.status === 'rejected') {
                if (!request.rejected_reason) {
                    throw new api_error_1.APIError({
                        message: 'rejected_reason.required',
                        status: 400,
                        errors: ['rejected_reason.required'],
                    });
                }
            }
            const updatedDeposit = yield this.repo.update({ id }, request, tx);
            // create a transaction for the deposit
            if (request.status === 'confirmed') {
                if (updatedDeposit) {
                    // Trừ số dư khả dụng trong tài khoản ngân hàng
                    yield this.bankRepo.update({ id: existingDeposit.bank_id }, { balance: Number(bank.balance) - Number(existingDeposit.amount) }, tx);
                    // const transactionIN: ITransaction = {
                    //     amount: existingDeposit.amount ? Number(existingDeposit.amount) : undefined,
                    //     bank_id: existingDeposit.bank_id,
                    //     type: TransactionType.IN,
                    //     organization_id: existingDeposit.organization_id ?? undefined,
                    //     order_type: TransactionOrderType.TRANSFER,
                    // };
                    // await this.transactionRepo.create(transactionIN, tx);
                    const transactionOUT = {
                        amount: existingDeposit.amount ? Number(existingDeposit.amount) : undefined,
                        bank_id: existingDeposit.bank_id,
                        type: app_constant_1.TransactionType.OUT,
                        organization_id: (_a = existingDeposit.organization_id) !== null && _a !== void 0 ? _a : undefined,
                        order_type: app_constant_1.TransactionOrderType.TRANSFER,
                    };
                    yield this.transactionRepo.create(transactionOUT, tx);
                    // eventbus.emit(EVENT_PAYMENT_CREATED, transactionOUT as ITransaction);
                }
            }
            return { id: updatedDeposit };
        });
    }
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            // Validate foreign keys
            const existingDeposit = yield this.repo.findOne({ id });
            if (!existingDeposit) {
                throw new api_error_1.APIError({ message: 'deposit.not_found', status: 400, errors: ['deposit.not_found'] });
            }
            if (existingDeposit.status !== 'pending') {
                throw new api_error_1.APIError({
                    message: 'deposit.cannot_edit',
                    status: 400,
                    errors: ['deposit.cannot_edit'],
                });
            }
            // Delete the deposit record
            yield this.repo.delete({ id });
            return { id };
        });
    }
    /**
     * Tất toán khoản tiền gửi , nhập số tiền nhận dược thực tế để tính lãi
     * @param id
     * @param request
     * @returns
     */
    settlement(id, request, isAdmin) {
        return __awaiter(this, void 0, void 0, function* () {
            // Validate foreign keys
            const existingDeposit = yield this.repo.findOne({ id });
            if (!existingDeposit) {
                throw new api_error_1.APIError({ message: 'id.not_found', status: 400, errors: ['id.not_found'] });
            }
            // if (existingDeposit.status !== 'confirmed') {
            //     throw new APIError({
            //         message: 'deposit.not_confirmed',
            //         status: 400,
            //         errors: ['deposit.not_confirmed'],
            //     });
            // }
            // Nếu rút trước ngày rút tiền thì phải là admin thực hiện
            if ((0, moment_timezone_1.default)(request.real_withdraw_date).isBefore(existingDeposit.withdraw_date, 'days') && !isAdmin) {
                throw new api_error_1.APIError({
                    message: 'auth.cannot_edit',
                    status: 400,
                    errors: ['auth.cannot_edit'],
                });
            }
            // Update the deposit record with settlement information
            const updatedDeposit = yield this.repo.update({ id }, {
                real_compound_interest: request.real_compound_interest,
                interest_amount: request.real_compound_interest - Number(existingDeposit.amount),
            });
            return updatedDeposit;
        });
    }
    paginates(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.repo.paginate(query, true);
            return result;
        });
    }
}
exports.DepositService = DepositService;
