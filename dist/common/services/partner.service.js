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
exports.PartnerService = void 0;
const partner_repo_1 = require("../repositories/partner.repo");
const base_service_1 = require("./master/base.service");
const partner_group_repo_1 = require("../repositories/partner-group.repo");
const employee_repo_1 = require("../repositories/employee.repo");
const clause_repo_1 = require("../repositories/clause.repo");
const app_constant_1 = require("../../config/app.constant");
const representative_repo_1 = require("../repositories/representative.repo");
const bank_repo_1 = require("../repositories/bank.repo");
const api_error_1 = require("../error/api.error");
const errors_1 = require("../errors");
const transaction_repo_1 = require("../repositories/transaction.repo");
const payment_request_repo_1 = require("../repositories/payment-request.repo");
const invoice_repo_1 = require("../repositories/invoice.repo");
const invoice_service_1 = require("./invoice.service");
const order_repo_1 = require("../repositories/order.repo");
const loan_repo_1 = require("../repositories/loan.repo");
const time_adapter_1 = require("../infrastructure/time.adapter");
const shipping_plan_repo_1 = require("../repositories/shipping-plan.repo");
class PartnerService extends base_service_1.BaseService {
    constructor() {
        super(new partner_repo_1.PartnerRepo());
        this.employeeRepo = new employee_repo_1.EmployeeRepo();
        this.partnerGroupRepo = new partner_group_repo_1.PartnerGroupRepo();
        this.clauseRepo = new clause_repo_1.ClauseRepo();
        this.bankRepo = new bank_repo_1.BankRepo();
        this.transactionRepo = new transaction_repo_1.TransactionRepo();
        this.representativeRepo = new representative_repo_1.RepresentativeRepo();
        this.paymentRequestRepo = new payment_request_repo_1.PaymentRequestRepo();
        this.invoiceRepo = new invoice_repo_1.InvoiceRepo();
        this.orderRepo = new order_repo_1.OrderRepo();
        this.invoiceService = invoice_service_1.InvoiceService.getInstance();
        this.loanRepo = new loan_repo_1.LoanRepo();
        this.shippingPlanRepo = new shipping_plan_repo_1.ShippingPlanRepo();
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new PartnerService();
        }
        return this.instance;
    }
    create(request) {
        return __awaiter(this, void 0, void 0, function* () {
            let partnerId = 0;
            yield this.validateForeignKeys(request, {
                partner_group_id: this.partnerGroupRepo,
                employee_id: this.employeeRepo,
                clause_id: this.clauseRepo,
            });
            yield this.db.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                const { representatives, banks } = request, partnerData = __rest(request, ["representatives", "banks"]);
                partnerId = yield this.repo.create(partnerData, tx);
                if (banks && banks.length > 0) {
                    for (const bank of banks) {
                        const { key } = bank, bankData = __rest(bank, ["key"]);
                        bankData.partner = partnerId ? { connect: { id: partnerId } } : undefined;
                        yield this.bankRepo.create(bankData, tx);
                    }
                }
                if (representatives && representatives.length > 0) {
                    for (const ele of representatives) {
                        let { banks, key } = ele, representativeData = __rest(ele, ["banks", "key"]);
                        representativeData.partner = partnerId ? { connect: { id: partnerId } } : undefined;
                        const representativeId = yield this.representativeRepo.create(representativeData, tx);
                        const mappedDetails = banks === null || banks === void 0 ? void 0 : banks.map((item) => {
                            return Object.assign(Object.assign({}, item), { representative: representativeId ? { connect: { id: representativeId } } : undefined });
                        });
                        const filteredData = this.filterData(mappedDetails, app_constant_1.DEFAULT_EXCLUDED_FIELDS, ['banks']);
                        yield this.bankRepo.createMany(filteredData, tx);
                    }
                }
            }));
            return { id: partnerId };
        });
    }
    update(id, request) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.findById(id);
            yield this.isExist({ code: request.code, id }, true);
            yield this.validateForeignKeys(request, {
                partner_group_id: this.partnerGroupRepo,
                employee_id: this.employeeRepo,
                clause_id: this.clauseRepo,
            });
            const { delete: deleteItems, update, add, banks_add, banks_update, banks_delete } = request, body = __rest(request, ["delete", "update", "add", "banks_add", "banks_update", "banks_delete"]);
            yield this.db.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                var _a, _b, _c;
                yield this.repo.update({ id }, body, tx);
                const mappedDetails = {
                    add: this.mapDetails(add || [], { partner_id: id }),
                    update: this.mapDetails(update || [], { partner_id: id }),
                    delete: deleteItems || [],
                    banks_add: this.mapDetails(banks_add || [], { partner_id: id }),
                    banks_update: this.mapDetails(banks_update || [], { partner_id: id }),
                    banks_delete: banks_delete || [],
                };
                const filteredData = {
                    add: this.filterData(mappedDetails.add, app_constant_1.DEFAULT_EXCLUDED_FIELDS, ['key']),
                    update: this.filterData(mappedDetails.update, app_constant_1.DEFAULT_EXCLUDED_FIELDS, ['key']),
                    delete: mappedDetails.delete,
                    banks_add: this.filterData(mappedDetails.banks_add, app_constant_1.DEFAULT_EXCLUDED_FIELDS, ['key']),
                    banks_update: this.filterData(mappedDetails.banks_update, app_constant_1.DEFAULT_EXCLUDED_FIELDS, ['key']),
                    banks_delete: mappedDetails.banks_delete,
                };
                const hasAdd = filteredData.add.length > 0;
                const hasUpdate = filteredData.update.length > 0;
                const hasDelete = (((_a = filteredData.delete) === null || _a === void 0 ? void 0 : _a.length) || 0) > 0;
                if (hasAdd || hasUpdate || hasDelete) {
                    if (hasAdd) {
                        for (const item of request.add || []) {
                            const { banks, key } = item, repData = __rest(item, ["banks", "key"]);
                            repData.partner_id = id;
                            const representative = yield this.representativeRepo.create(repData, tx);
                            if ((banks === null || banks === void 0 ? void 0 : banks.length) > 0) {
                                for (const bank of banks) {
                                    const { key } = bank, bankData = __rest(bank, ["key"]);
                                    bankData.representative = { connect: { id: representative } };
                                    yield this.bankRepo.create(bankData, tx);
                                }
                            }
                        }
                    }
                    if (hasUpdate) {
                        for (const item of request.update || []) {
                            yield this.validateForeignKeys(item, {
                                id: this.representativeRepo,
                            });
                            const { banks, key, id } = item, repData = __rest(item, ["banks", "key", "id"]);
                            yield this.representativeRepo.update({ id }, repData, tx);
                            if ((banks === null || banks === void 0 ? void 0 : banks.length) > 0) {
                                yield this.bankRepo.deleteMany({ representative_id: id }, tx);
                                const mappedDetails = banks.map((item) => {
                                    return Object.assign(Object.assign({}, item), { representative: id ? { connect: { id } } : undefined });
                                });
                                yield this.bankRepo.createMany(mappedDetails, tx);
                            }
                        }
                    }
                    if (hasDelete) {
                        for (const id of (_b = request.delete) !== null && _b !== void 0 ? _b : []) {
                            const check = yield this.representativeRepo.isExist({ id: Number(id) }, tx);
                            if (!check) {
                                throw new api_error_1.APIError({
                                    message: `common.status.${errors_1.StatusCode.BAD_REQUEST}`,
                                    status: errors_1.ErrorCode.BAD_REQUEST,
                                    errors: [`id.${errors_1.ErrorKey.NOT_FOUND}`],
                                });
                            }
                        }
                        yield this.representativeRepo.deleteMany({ id: { in: request.delete } }, tx, false);
                    }
                }
                const hasBankAdd = filteredData.banks_add.length > 0;
                const hasBankUpdate = filteredData.banks_update.length > 0;
                const hasBankDelete = (((_c = filteredData.banks_delete) === null || _c === void 0 ? void 0 : _c.length) || 0) > 0;
                if (hasBankAdd || hasBankUpdate || hasBankDelete) {
                    if (hasBankAdd) {
                        for (const item of banks_add || []) {
                            const { key } = item, bankData = __rest(item, ["key"]);
                            bankData.partner_id = id;
                            yield this.bankRepo.create(bankData, tx);
                        }
                    }
                    if (hasBankUpdate) {
                        for (const item of banks_update || []) {
                            yield this.validateForeignKeys(item, {
                                id: this.bankRepo,
                            });
                            const { key, id } = item, bankData = __rest(item, ["key", "id"]);
                            yield this.bankRepo.update({ id }, bankData, tx);
                        }
                    }
                    if (hasBankDelete) {
                        for (const id of banks_delete !== null && banks_delete !== void 0 ? banks_delete : []) {
                            const check = yield this.bankRepo.isExist({ id: Number(id) }, tx);
                            if (!check) {
                                throw new api_error_1.APIError({
                                    message: `common.status.${errors_1.StatusCode.BAD_REQUEST}`,
                                    status: errors_1.ErrorCode.BAD_REQUEST,
                                    errors: [`id.${errors_1.ErrorKey.NOT_FOUND}`],
                                });
                            }
                        }
                        yield this.bankRepo.deleteMany({ id: { in: banks_delete } }, tx, false);
                    }
                }
            }));
            return { id };
        });
    }
    getDeliveryDebt(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const { startAt, endAt, partnerId } = query;
            const parsedStartAt = time_adapter_1.TimeAdapter.parseStartOfDayDate(startAt).toISOString();
            const parsedEndAt = time_adapter_1.TimeAdapter.parseEndOfDayDate(endAt).toISOString();
            query.partner_id = partnerId;
            delete query.partnerId;
            yield this.validateForeignKeys(query, {
                partner_id: this.repo,
            });
            // === 1. Tính tồn đầu kỳ ===
            const beforeTransactions = yield this.transactionRepo.findMany({
                order_type: app_constant_1.TransactionOrderType.DELIVERY,
                partner_id: partnerId,
                time_at: { lt: parsedStartAt },
            });
            const increaseBefore = beforeTransactions.reduce((sum, item) => sum + (item.type === app_constant_1.TransactionType.IN ? Number(item.amount || 0) : 0), 0);
            const reduceBefore = beforeTransactions.reduce((sum, item) => sum + (item.type === app_constant_1.TransactionType.OUT ? Number(item.amount || 0) : 0), 0);
            const beginningDebt = increaseBefore - reduceBefore;
            // === 2. Tính giao dịch trong kỳ ===
            const shippingPlan = yield this.shippingPlanRepo.findMany({
                partner_id: partnerId,
                status: app_constant_1.PaymentRequestStatus.CONFIRMED,
                is_done: true,
                order: {
                    status: app_constant_1.PaymentRequestStatus.CONFIRMED,
                    time_at: {
                        gte: parsedStartAt,
                        lte: parsedEndAt,
                    },
                },
            }, true, undefined, {
                order: true,
            });
            // === 2.1. Lấy shipping plans từ kỳ trước có giao dịch ===
            const beforeShippingPlans = yield this.shippingPlanRepo.findMany({
                partner_id: partnerId,
                status: app_constant_1.PaymentRequestStatus.CONFIRMED,
                is_done: true,
                order: {
                    status: app_constant_1.PaymentRequestStatus.CONFIRMED,
                    time_at: {
                        lt: parsedStartAt,
                    },
                },
            }, true, undefined, {
                order: true,
            });
            // Tính tổng tăng / giảm trong kỳ
            const inPeriodTransactions = yield this.transactionRepo.findMany({
                order_type: app_constant_1.TransactionOrderType.DELIVERY,
                partner_id: partnerId,
                time_at: {
                    gte: parsedStartAt,
                    lte: parsedEndAt,
                },
            });
            const debtIncrease = inPeriodTransactions.reduce((sum, item) => sum + (item.type === app_constant_1.TransactionType.IN ? Number(item.amount || 0) : 0), 0);
            const debtReduction = inPeriodTransactions.reduce((sum, item) => sum + (item.type === app_constant_1.TransactionType.OUT ? Number(item.amount || 0) : 0), 0);
            const groupedBeforeTxByPlan = beforeTransactions.reduce((acc, tx) => {
                const planId = tx.shipping_plan_id;
                if (!planId)
                    return acc;
                if (!acc[planId])
                    acc[planId] = [];
                acc[planId].push(tx);
                return acc;
            }, {});
            const groupedTxByPlan = inPeriodTransactions.reduce((acc, tx) => {
                const planId = tx.shipping_plan_id;
                if (!planId)
                    return acc;
                if (!acc[planId])
                    acc[planId] = [];
                acc[planId].push(tx);
                return acc;
            }, {});
            const orderIds = shippingPlan.map((p) => { var _a; return (_a = p.order) === null || _a === void 0 ? void 0 : _a.id; }).filter(Boolean);
            const beforeOrderIds = beforeShippingPlans.map((p) => { var _a; return (_a = p.order) === null || _a === void 0 ? void 0 : _a.id; }).filter(Boolean);
            const allOrderIds = [...new Set([...orderIds, ...beforeOrderIds])];
            const invoices = yield this.invoiceRepo.findMany({
                order_id: { in: allOrderIds },
                type: app_constant_1.InvoiceType.DELIVERY,
            });
            const groupedInvoiceByOrder = invoices.reduce((acc, invoice) => {
                if (!invoice.order_id)
                    return acc;
                acc[invoice.order_id] = invoice; // mỗi order chỉ lấy 1 invoice
                return acc;
            }, {});
            // Duyệt qua từng đơn hàng và gắn transaction tương ứng
            const details = shippingPlan.map((plan) => {
                const castedPlan = plan;
                const planId = castedPlan.id;
                const order = castedPlan.order;
                // Giao dịch đầu kỳ
                const beforeTxs = groupedBeforeTxByPlan[planId] || [];
                const planBeginningIncrease = beforeTxs.reduce((sum, t) => sum + (t.type === app_constant_1.TransactionType.IN ? Number(t.amount || 0) : 0), 0);
                const planBeginningReduction = beforeTxs.reduce((sum, t) => sum + (t.type === app_constant_1.TransactionType.OUT ? Number(t.amount || 0) : 0), 0);
                const beginning_debt = planBeginningIncrease - planBeginningReduction;
                // Giao dịch trong kỳ
                const transactions = groupedTxByPlan[planId] || [];
                const planIncrease = transactions.reduce((sum, t) => sum + (t.type === app_constant_1.TransactionType.IN ? Number(t.amount || 0) : 0), 0);
                const planReduction = transactions.reduce((sum, t) => sum + (t.type === app_constant_1.TransactionType.OUT ? Number(t.amount || 0) : 0), 0);
                const ending_debt = beginning_debt + planIncrease - planReduction;
                const reductionTransactions = transactions.filter((tx) => tx.type === app_constant_1.TransactionType.OUT && tx.invoice_id !== null);
                const invoice = groupedInvoiceByOrder[order === null || order === void 0 ? void 0 : order.id] || null;
                castedPlan.total_money = (castedPlan.completed_quantity || 0) * (castedPlan.price || 0);
                return {
                    shipping_plan: castedPlan,
                    invoice,
                    beginning_debt,
                    ending_debt,
                    transactions: reductionTransactions,
                };
            });
            // === 2.2. Thêm shipping plans từ kỳ trước không có trong kỳ này ===
            const currentPlanIds = new Set(shippingPlan.map((p) => p.id));
            const beforeOnlyPlans = beforeShippingPlans.filter((plan) => !currentPlanIds.has(plan.id));
            const beforeOnlyDetails = beforeOnlyPlans
                .map((plan) => {
                const castedPlan = plan;
                const planId = castedPlan.id;
                const order = castedPlan.order;
                // Giao dịch đầu kỳ
                const beforeTxs = groupedBeforeTxByPlan[planId] || [];
                const planBeginningIncrease = beforeTxs.reduce((sum, t) => sum + (t.type === app_constant_1.TransactionType.IN ? Number(t.amount || 0) : 0), 0);
                const planBeginningReduction = beforeTxs.reduce((sum, t) => sum + (t.type === app_constant_1.TransactionType.OUT ? Number(t.amount || 0) : 0), 0);
                const beginning_debt = planBeginningIncrease - planBeginningReduction;
                // Giao dịch trong kỳ (nếu có)
                const transactions = groupedTxByPlan[planId] || [];
                const planReduction = transactions.reduce((sum, t) => sum + (t.type === app_constant_1.TransactionType.OUT ? Number(t.amount || 0) : 0), 0);
                const ending_debt = beginning_debt - planReduction;
                const reductionTransactions = transactions.filter((tx) => tx.type === app_constant_1.TransactionType.OUT && tx.invoice_id !== null);
                const invoice = groupedInvoiceByOrder[order === null || order === void 0 ? void 0 : order.id] || null;
                castedPlan.total_money = (castedPlan.completed_quantity || 0) * (castedPlan.price || 0);
                // Chỉ thêm vào nếu có công nợ đầu kỳ hoặc cuối kỳ > 0
                if (beginning_debt > 0 || ending_debt > 0 || transactions.length > 0) {
                    return {
                        shipping_plan: castedPlan,
                        invoice,
                        beginning_debt,
                        ending_debt,
                        transactions: reductionTransactions,
                    };
                }
                return null;
            })
                .filter(Boolean);
            // Gộp tất cả details
            const allDetails = [...details, ...beforeOnlyDetails];
            const endingDebt = beginningDebt + debtIncrease - debtReduction;
            // === 3. Trả về dữ liệu ===
            return {
                beginning_debt: beginningDebt,
                debt_increase: debtIncrease,
                debt_reduction: debtReduction,
                ending_debt: endingDebt,
                details: allDetails,
            };
        });
    }
    getDebt(query_1) {
        return __awaiter(this, arguments, void 0, function* (query, isCommission = false) {
            var _a, _b;
            let { startAt, endAt, partnerId } = query;
            const partner = yield this.repo.findOne({ id: partnerId }, true);
            if ((partner === null || partner === void 0 ? void 0 : partner.type) === app_constant_1.PartnerType.DELIVERY) {
                return this.getDeliveryDebt(query);
            }
            endAt = time_adapter_1.TimeAdapter.parseEndOfDayDate(endAt).toISOString();
            query.partner_id = partnerId;
            delete query.partnerId;
            yield this.validateForeignKeys(query, {
                partner_id: this.repo,
            });
            let beginningDebt = 0;
            let debtIncrease = 0;
            let debtReduction = 0;
            let currentDebt = 0;
            let transformDetails = [];
            const orderType = isCommission ? app_constant_1.TransactionOrderType.COMMISSION : app_constant_1.TransactionOrderType.ORDER;
            const beforeInvoices = yield this.invoiceRepo.findMany({
                is_payment_completed: false,
                partner_id: partnerId,
                invoice_date: { lt: startAt },
            }, true); // Include relations for commission calculations
            const beforeOrders = yield this.orderRepo.findMany({
                status: app_constant_1.OrderStatus.CONFIRMED,
                time_at: { lt: startAt },
                partner_id: partnerId,
            }, true);
            const orderLoanIds = beforeOrders.map((order) => order.id).filter((id) => typeof id === 'number');
            let beforeLoans = [];
            if (orderLoanIds.length > 0) {
                beforeLoans = yield this.loanRepo.findMany({
                    order_id: { in: orderLoanIds },
                    disbursement_date: { lt: startAt },
                }, true);
            }
            // Calculate beginning debt from loans
            const loanDebt = beforeLoans.reduce((sum, loan) => sum + Number(loan.amount || 0), 0);
            // For commission debt, we need to enrich invoices with commission totals
            let enrichedBeforeInvoices = beforeInvoices;
            if (isCommission) {
                const enrichedResponse = yield this.invoiceService.enrichInvoiceTotals({
                    data: beforeInvoices,
                });
                enrichedBeforeInvoices = enrichedResponse.data;
            }
            const increaseBefore = enrichedBeforeInvoices.reduce((sum, item) => {
                const amount = isCommission ? Number(item.total_commission || 0) : Number(item.total_amount || 0);
                return sum + amount;
            }, 0);
            let beforeInvoiceIds = beforeInvoices.map((inv) => inv.id).filter((id) => typeof id === 'number');
            const beforeInvoiceCondition = beforeInvoiceIds.length > 0 ? { in: beforeInvoiceIds } : null;
            // === 2. Giao dịch trước kỳ ===
            const transactionBefore = yield this.transactionRepo.findMany({
                order_type: orderType,
                // type: TransactionType.OUT,
                invoice_id: beforeInvoiceCondition,
                time_at: { lt: startAt },
                partner_id: partnerId,
            }, true);
            const reductionBefore = transactionBefore.reduce((sum, item) => sum + Number(item.amount || 0), 0);
            beginningDebt = increaseBefore - reductionBefore + loanDebt;
            currentDebt = beginningDebt;
            const invoicesInPeriod = yield this.invoiceRepo.findMany({
                invoice_date: { gte: startAt, lte: endAt },
                partner_id: partnerId,
            }, true);
            // For commission debt, enrich invoices with commission totals
            let enrichedInvoicesInPeriod = invoicesInPeriod;
            if (isCommission) {
                const enrichedResponse = yield this.invoiceService.enrichInvoiceTotals({
                    data: invoicesInPeriod,
                });
                enrichedInvoicesInPeriod = enrichedResponse.data;
            }
            const invoiceIdConditions = invoicesInPeriod
                .map((inv) => inv.id)
                .filter((id) => typeof id === 'number');
            const invoiceFilter = invoiceIdConditions.length > 0 ? { in: invoiceIdConditions } : null;
            const transactionDuring = yield this.transactionRepo.findMany({
                order_type: orderType,
                // type: TransactionType.OUT,
                time_at: { gte: startAt, lte: endAt },
                partner_id: partnerId,
            }, true);
            const groupedTxByInvoice = new Map();
            for (const tx of transactionDuring) {
                const txAmount = Number(tx.amount || 0);
                debtReduction += txAmount;
                const txItem = {
                    id: tx.id,
                    time_at: tx.time_at ? tx.time_at.toISOString() : undefined,
                    amount: txAmount,
                    bank: tx.bank,
                    type: tx.type,
                };
                if (!tx.invoice_id)
                    continue;
                if (!groupedTxByInvoice.has(tx.invoice_id)) {
                    groupedTxByInvoice.set(tx.invoice_id, []);
                }
                (_a = groupedTxByInvoice.get(tx.invoice_id)) === null || _a === void 0 ? void 0 : _a.push(txItem);
            } // === 5. Xử lý hóa đơn trong kỳ ===
            for (let i = 0; i < invoicesInPeriod.length; i++) {
                const invoice = invoicesInPeriod[i];
                const enrichedInvoice = isCommission ? enrichedInvoicesInPeriod[i] : invoice;
                const _c = invoice, { order } = _c, invoiceData = __rest(_c, ["order"]);
                const totalAmount = isCommission
                    ? Number(enrichedInvoice.total_commission || 0)
                    : Number(invoiceData.total_amount || 0);
                debtIncrease += totalAmount;
                const txList = invoiceData.id !== undefined ? groupedTxByInvoice.get(invoiceData.id) || [] : [];
                const totalReduction = txList.reduce((sum, tx) => sum + Number(tx.amount), 0);
                const endingDebt = totalAmount - totalReduction;
                currentDebt += totalAmount - totalReduction;
                // Luôn thêm hóa đơn trong kỳ vào details để theo dõi công nợ
                transformDetails.push({
                    invoice: invoiceData,
                    order,
                    beginning_debt: 0, // Hóa đơn trong kỳ có beginning_debt = 0
                    ending_debt: endingDebt,
                    transactions: txList,
                });
            } // === 6. Xử lý tất cả hóa đơn kỳ trước chưa thanh toán hoàn toàn ===
            // Lấy tất cả hóa đơn kỳ trước chưa thanh toán hoàn toàn (bao gồm cả những hóa đơn không có giao dịch trong kỳ)
            const allPreviousUnpaidInvoices = yield this.invoiceRepo.findMany({
                is_payment_completed: false,
                partner_id: partnerId,
                invoice_date: { lt: startAt }, // Hóa đơn kỳ trước
            }, true);
            // For commission debt, enrich all previous invoices with commission totals
            let enrichedAllPreviousInvoices = allPreviousUnpaidInvoices;
            if (isCommission) {
                const enrichedResponse = yield this.invoiceService.enrichInvoiceTotals({
                    data: allPreviousUnpaidInvoices,
                });
                enrichedAllPreviousInvoices = enrichedResponse.data;
            }
            // Xử lý từng hóa đơn kỳ trước
            for (let i = 0; i < allPreviousUnpaidInvoices.length; i++) {
                const invoice = allPreviousUnpaidInvoices[i];
                const enrichedInvoice = isCommission ? enrichedAllPreviousInvoices[i] : invoice;
                // Kiểm tra xem hóa đơn này đã được thêm vào details chưa (từ việc xử lý hóa đơn trong kỳ)
                if (transformDetails.some((detail) => { var _a; return ((_a = detail.invoice) === null || _a === void 0 ? void 0 : _a.id) === invoice.id; })) {
                    continue; // Đã được xử lý rồi, bỏ qua
                }
                const _d = invoice, { order } = _d, invoiceData = __rest(_d, ["order"]);
                const totalAmount = isCommission
                    ? Number(enrichedInvoice.total_commission || 0)
                    : Number(invoiceData.total_amount || 0);
                // Lấy các giao dịch thanh toán trước kỳ cho hóa đơn này
                const previousPayments = yield this.transactionRepo.findMany({
                    order_type: orderType,
                    // type: TransactionType.OUT,
                    invoice_id: invoice.id,
                    time_at: { lt: startAt },
                    partner_id: partnerId,
                }, true);
                const previousPaymentAmount = previousPayments.reduce((sum, tx) => sum + Number(tx.amount || 0), 0);
                const beginningDebtForInvoice = totalAmount - previousPaymentAmount;
                // Lấy giao dịch trong kỳ cho hóa đơn này (nếu có)
                const txList = groupedTxByInvoice.get(invoice.id) || [];
                const currentPeriodPayment = txList.reduce((sum, tx) => sum + Number(tx.amount), 0);
                const itemEndingDebt = beginningDebtForInvoice - currentPeriodPayment; // Chỉ thêm vào details nếu có số dư đầu kỳ > 0 hoặc có giao dịch trong kỳ hoặc có số dư cuối kỳ > 0
                // Điều này đảm bảo tất cả hóa đơn có liên quan đến công nợ đều được hiển thị
                if (beginningDebtForInvoice > 0 || txList.length > 0 || itemEndingDebt > 0) {
                    transformDetails.push({
                        invoice: invoiceData,
                        order,
                        beginning_debt: beginningDebtForInvoice,
                        ending_debt: itemEndingDebt,
                        transactions: txList,
                    });
                }
            } // === 7. Đơn hàng trong kỳ ===
            const ordersInPeriod = yield this.orderRepo.findMany({
                status: app_constant_1.OrderStatus.CONFIRMED,
                time_at: { gte: startAt, lte: endAt },
                partner_id: partnerId,
            }, true);
            const orderIds = ordersInPeriod.map((order) => order.id).filter((id) => typeof id === 'number');
            const loans = yield this.loanRepo.findMany({
                order_id: {
                    in: orderIds,
                },
                disbursement_date: { gte: startAt, lte: endAt },
            }, true);
            const newDetails = [];
            for (const loan of loans) {
                const loanAmount = Number(loan.amount || 0);
                const loanTransaction = {
                    id: loan.id,
                    time_at: loan.disbursement_date ? loan.disbursement_date.toISOString() : undefined,
                    amount: loanAmount,
                    type: app_constant_1.TransactionType.OUT,
                    bank: loan.bank,
                };
                let matched = false;
                for (const detail of transformDetails) {
                    if (((_b = detail.order) === null || _b === void 0 ? void 0 : _b.id) === loan.order_id) {
                        detail.transactions.push(loanTransaction);
                        detail.ending_debt -= loanAmount; // Giảm số dư cuối kỳ do khoản vay
                        debtReduction += loanAmount; // Tính vào tổng số tiền giảm nợ
                        matched = true;
                        break; // Đã tìm thấy order, không cần kiểm tra tiếp
                    }
                }
                if (!matched) {
                    newDetails.push({
                        order: loan.order,
                        beginning_debt: 0,
                        ending_debt: -loanAmount, // Âm vì là khoản vay chưa có invoice
                        transactions: [loanTransaction],
                    });
                    debtReduction += loanAmount; // Khoản vay không gắn với invoice vẫn tính giảm nợ
                }
            }
            transformDetails = transformDetails.concat(newDetails);
            const sortedDetails = transformDetails.sort((a, b) => {
                var _a, _b, _c, _d, _e, _f, _g, _h;
                const timeA = new Date((_d = (_b = (_a = a.invoice) === null || _a === void 0 ? void 0 : _a.invoice_date) !== null && _b !== void 0 ? _b : (_c = a.invoice) === null || _c === void 0 ? void 0 : _c.time_at) !== null && _d !== void 0 ? _d : 0).getTime();
                const timeB = new Date((_h = (_f = (_e = b.invoice) === null || _e === void 0 ? void 0 : _e.invoice_date) !== null && _f !== void 0 ? _f : (_g = b.invoice) === null || _g === void 0 ? void 0 : _g.time_at) !== null && _h !== void 0 ? _h : 0).getTime();
                return timeA - timeB;
            });
            const finalEndingDebt = beginningDebt + debtIncrease - debtReduction;
            return {
                beginning_debt: beginningDebt,
                debt_increase: debtIncrease,
                debt_reduction: debtReduction,
                ending_debt: finalEndingDebt,
                details: sortedDetails,
            };
        });
    }
    handleDeliveryDebtPaginate(query) {
        return __awaiter(this, void 0, void 0, function* () {
            // Initialize summary totals
            let summary_total_beginning = 0;
            let summary_total_increase = 0;
            let summary_total_reduction = 0;
            let summary_total_ending = 0;
            const { isCommission, startAt, endAt } = query, queryFilter = __rest(query, ["isCommission", "startAt", "endAt"]);
            const { page = 1, size = 20, keyword } = queryFilter, filter = __rest(queryFilter, ["page", "size", "keyword"]);
            let result;
            // Thêm điều kiện search by keyword
            if (keyword) {
                filter.OR = [
                    { name: { contains: keyword, mode: 'insensitive' } },
                    { code: { contains: keyword, mode: 'insensitive' } },
                    { phone: { contains: keyword, mode: 'insensitive' } },
                    { email: { contains: keyword, mode: 'insensitive' } },
                ];
            }
            // Sử dụng findMany thay vì paginate
            const allPartners = yield this.repo.findMany(filter, true);
            const processedData = yield Promise.all(allPartners.map((partner) => __awaiter(this, void 0, void 0, function* () {
                const partnerId = partner.id;
                const parsedStartAt = time_adapter_1.TimeAdapter.parseStartOfDayDate(startAt);
                const parsedEndAt = time_adapter_1.TimeAdapter.parseEndOfDayDate(endAt);
                const transactions = yield this.transactionRepo.findMany({
                    order_type: app_constant_1.TransactionOrderType.DELIVERY,
                    partner_id: partnerId,
                });
                const beforeTransactions = transactions.filter((tx) => tx.time_at && new Date(tx.time_at) < parsedStartAt);
                const inPeriodTransactions = transactions.filter((tx) => {
                    const time = new Date(tx.time_at);
                    return time >= parsedStartAt && time <= parsedEndAt;
                });
                // Tính tăng/giảm trước kỳ
                const beforeIncrease = beforeTransactions.reduce((sum, item) => sum + (item.type === app_constant_1.TransactionType.IN ? Number(item.amount || 0) : 0), 0);
                const beforeReduction = beforeTransactions.reduce((sum, item) => sum + (item.type === app_constant_1.TransactionType.OUT ? Number(item.amount || 0) : 0), 0);
                // Tính tăng/giảm trong kỳ
                const debtIncrease = inPeriodTransactions.reduce((sum, item) => sum + (item.type === app_constant_1.TransactionType.IN ? Number(item.amount || 0) : 0), 0);
                const debtReduction = inPeriodTransactions.reduce((sum, item) => sum + (item.type === app_constant_1.TransactionType.OUT ? Number(item.amount || 0) : 0), 0);
                const beginningDebt = beforeIncrease - beforeReduction;
                const endingDebt = beginningDebt + debtIncrease - debtReduction;
                return Object.assign(Object.assign({}, partner), { beginning_debt: beginningDebt, debt_increase: debtIncrease, debt_reduction: debtReduction, ending_debt: endingDebt, payment_requests: yield this.paymentRequestRepo.findMany({
                        partner_id: partnerId,
                        status: app_constant_1.PaymentRequestStatus.PENDING,
                    }) });
            })));
            // Lọc những record có tất cả debt = 0
            const filteredData = processedData.filter((item) => {
                const { beginning_debt, debt_increase, debt_reduction, ending_debt } = item;
                const isAllZero = Number(beginning_debt) === 0 &&
                    Number(debt_increase) === 0 &&
                    Number(debt_reduction) === 0 &&
                    Number(ending_debt) === 0;
                return !isAllZero;
            });
            // Tính summary từ filtered data
            filteredData.forEach((item) => {
                summary_total_beginning += item.beginning_debt;
                summary_total_increase += item.debt_increase;
                summary_total_reduction += item.debt_reduction;
                summary_total_ending += item.ending_debt;
            });
            // Thực hiện phân trang thủ công
            result = this.manualPaginate(filteredData, page, size);
            return Object.assign(Object.assign({}, result), { summary: {
                    total_beginning: parseFloat(summary_total_beginning.toFixed(2)),
                    total_increase: parseFloat(summary_total_increase.toFixed(2)),
                    total_reduction: parseFloat(summary_total_reduction.toFixed(2)),
                    total_ending: parseFloat(summary_total_ending.toFixed(2)),
                } });
        });
    }
    handlePartnerDebtPaginate(query) {
        return __awaiter(this, void 0, void 0, function* () {
            let summary_total_beginning = 0;
            let summary_total_increase = 0;
            let summary_total_reduction = 0;
            let summary_total_ending = 0;
            const { isCommission, startAt, endAt } = query, queryFilter = __rest(query, ["isCommission", "startAt", "endAt"]);
            const { page = 1, size = 20, keyword } = queryFilter, filter = __rest(queryFilter, ["page", "size", "keyword"]);
            let result;
            // Thêm điều kiện search by keyword
            if (keyword) {
                filter.OR = [
                    { name: { contains: keyword, mode: 'insensitive' } },
                    { code: { contains: keyword, mode: 'insensitive' } },
                    { phone: { contains: keyword, mode: 'insensitive' } },
                    { email: { contains: keyword, mode: 'insensitive' } },
                ];
            }
            // Sử dụng findMany thay vì paginate để lấy tất cả data trước khi xử lý
            const allPartners = yield this.repo.findMany(filter, true);
            const processedData = yield Promise.all(allPartners.map((partner) => __awaiter(this, void 0, void 0, function* () {
                const partnerId = partner.id;
                // === 1. Lấy dữ liệu trước kỳ ===
                const beforeInvoices = yield this.invoiceRepo.findMany({
                    is_payment_completed: false,
                    partner_id: partnerId,
                    invoice_date: { lt: startAt },
                });
                const beforeOrders = yield this.orderRepo.findMany({
                    status: app_constant_1.OrderStatus.CONFIRMED,
                    time_at: { lt: startAt },
                    partner_id: partnerId,
                });
                const beforeOrderIds = beforeOrders.map((order) => order.id);
                let beforeLoans = [];
                if (beforeOrderIds.length > 0) {
                    beforeLoans = yield this.loanRepo.findMany({
                        order_id: { in: beforeOrderIds },
                        disbursement_date: { gte: startAt, lte: endAt },
                    }, true);
                }
                const loanDebt = beforeLoans.reduce((sum, loan) => sum + Number(loan.amount || 0), 0);
                let enrichedBeforeInvoices = beforeInvoices;
                if (isCommission) {
                    const enrichedResponse = yield this.invoiceService.enrichInvoiceTotals({
                        data: beforeInvoices,
                    });
                    enrichedBeforeInvoices = enrichedResponse.data;
                }
                const increaseBeginning = enrichedBeforeInvoices.reduce((sum, item) => sum + Number(isCommission ? item.total_commission : item.total_amount || 0), 0);
                let beforeInvoiceCondition = beforeInvoices.map((inv) => inv.id).filter(Boolean);
                if (beforeInvoiceCondition.length === 0) {
                    beforeInvoiceCondition = null;
                }
                else {
                    beforeInvoiceCondition = { in: beforeInvoiceCondition };
                }
                const transactionBefore = yield this.transactionRepo.findMany({
                    order_type: isCommission ? app_constant_1.TransactionOrderType.COMMISSION : app_constant_1.TransactionOrderType.ORDER,
                    // type: TransactionType.OUT,
                    invoice_id: beforeInvoiceCondition,
                    time_at: { lt: startAt },
                    partner_id: partnerId,
                }, true);
                const reductionBefore = transactionBefore.reduce((sum, item) => sum + Number(item.amount || 0), 0);
                const beginningDebt = increaseBeginning - reductionBefore + loanDebt;
                // === 3. Trong kỳ ===
                let reduction = 0;
                const invoicesInPeriod = yield this.invoiceRepo.findMany({
                    invoice_date: { gte: startAt, lte: endAt },
                    partner_id: partnerId,
                }, true);
                let increase = invoicesInPeriod.reduce((sum, item) => sum + Number(isCommission ? item.total_commission : item.total_amount || 0), 0);
                const ordersInPeriod = yield this.orderRepo.findMany({
                    time_at: { gte: startAt, lte: endAt },
                    partner_id: partnerId,
                }, true);
                const orderLoanIds = ordersInPeriod.map((order) => order.id);
                let loans = [];
                if (orderLoanIds.length > 0) {
                    loans = yield this.loanRepo.findMany({
                        order_id: { in: ordersInPeriod.map((order) => order.id) },
                        disbursement_date: { gte: startAt, lte: endAt },
                    }, true);
                }
                reduction += loans.reduce((sum, loan) => sum + Number(loan.amount || 0), 0);
                let invoiceIdConditions = invoicesInPeriod.map((inv) => inv.id).filter(Boolean);
                if (invoiceIdConditions.length === 0) {
                    invoiceIdConditions = null;
                }
                else {
                    invoiceIdConditions = { in: invoiceIdConditions };
                }
                // Giao dịch giảm trong kỳ - lấy tất cả giao dịch thanh toán trong kỳ
                const transactionDuring = yield this.transactionRepo.findMany({
                    order_type: isCommission ? app_constant_1.TransactionOrderType.COMMISSION : app_constant_1.TransactionOrderType.ORDER,
                    // type: TransactionType.OUT,
                    time_at: { gte: startAt, lte: endAt },
                    partner_id: partnerId,
                    // Bỏ điều kiện invoice_id để lấy tất cả giao dịch thanh toán trong kỳ
                }, true);
                reduction += transactionDuring.reduce((sum, item) => sum + Number(item.amount || 0), 0);
                const endingDebt = beginningDebt + increase - reduction;
                // === 4. Lấy payment request ===
                const paymentRequests = () => __awaiter(this, void 0, void 0, function* () {
                    const statuses = [app_constant_1.PaymentRequestStatus.PENDING];
                    for (const status of statuses) {
                        const found = yield this.paymentRequestRepo.findFirst({
                            partner_id: partnerId,
                            type: isCommission ? app_constant_1.PaymentRequestType.COMMISSION : app_constant_1.PaymentRequestType.ORDER,
                            status,
                            details: {
                                some: {
                                    invoice_id: {
                                        not: null,
                                    },
                                },
                            },
                        }, false);
                        if (found)
                            return [found];
                    }
                    return [];
                });
                return Object.assign(Object.assign({}, partner), { beginning_debt: beginningDebt, debt_increase: increase, debt_reduction: reduction, ending_debt: endingDebt, payment_requests: yield paymentRequests() });
            })));
            // Lọc những record có tất cả debt = 0
            const filteredData = processedData.filter((item) => {
                const { beginning_debt, debt_increase, debt_reduction, ending_debt } = item;
                const isAllZero = Number(beginning_debt) === 0 &&
                    Number(debt_increase) === 0 &&
                    Number(debt_reduction) === 0 &&
                    Number(ending_debt) === 0;
                return !isAllZero;
            });
            // Sắp xếp các phần tử có dữ liệu lên đầu (theo tổng nợ cuối kỳ giảm dần)
            filteredData.sort((a, b) => {
                const aSum = Math.abs(Number(a.beginning_debt)) +
                    Math.abs(Number(a.debt_increase)) +
                    Math.abs(Number(a.debt_reduction)) +
                    Math.abs(Number(a.ending_debt));
                const bSum = Math.abs(Number(b.beginning_debt)) +
                    Math.abs(Number(b.debt_increase)) +
                    Math.abs(Number(b.debt_reduction)) +
                    Math.abs(Number(b.ending_debt));
                return bSum - aSum;
            });
            // Tính summary từ filtered data
            filteredData.forEach((item) => {
                summary_total_beginning += item.beginning_debt;
                summary_total_increase += item.debt_increase;
                summary_total_reduction += item.debt_reduction;
                summary_total_ending += item.ending_debt;
            });
            // Thực hiện phân trang thủ công
            result = this.manualPaginate(filteredData, page, size);
            return Object.assign(Object.assign({}, result), { summary: {
                    total_beginning: parseFloat(summary_total_beginning.toFixed(2)),
                    total_increase: parseFloat(summary_total_increase.toFixed(2)),
                    total_reduction: parseFloat(summary_total_reduction.toFixed(2)),
                    total_ending: parseFloat(summary_total_ending.toFixed(2)),
                } });
        });
    }
    paginate(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const { isCommission, startAt, endAt } = query, queryFilter = __rest(query, ["isCommission", "startAt", "endAt"]);
            if (startAt && endAt && queryFilter.type !== app_constant_1.PartnerType.DELIVERY) {
                return this.handlePartnerDebtPaginate(queryFilter);
            }
            else if (startAt && endAt && queryFilter.type === app_constant_1.PartnerType.DELIVERY) {
                return this.handleDeliveryDebtPaginate(queryFilter);
            }
            else {
                return this.repo.paginate(queryFilter, true);
            }
        });
    }
    findByConditions(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.repo.findOne(query);
            if (!result) {
                throw new api_error_1.APIError({
                    message: `common.not-found`,
                    status: errors_1.ErrorCode.REQUEST_NOT_FOUND,
                });
            }
            return result;
        });
    }
}
exports.PartnerService = PartnerService;
