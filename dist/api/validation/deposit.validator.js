"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.settlementDepositSchema = exports.approveDepositSchema = exports.getPaginatedDepositsSchema = exports.updateDepositSchema = exports.createDepositSchema = void 0;
const zod_1 = require("zod");
exports.createDepositSchema = zod_1.z.object({
    bank_id: zod_1.z.number(),
    employee_id: zod_1.z.number().optional(),
    account_number: zod_1.z.string(),
    deposit_date: zod_1.z.isoDateTz().optional(),
    withdraw_date: zod_1.z.isoDateTz().optional(),
    unit: zod_1.z.enum(['VND', 'USD']).optional().default('VND'),
    term: zod_1.z.number(),
    amount: zod_1.z.number(),
    interest_rate: zod_1.z.number(),
    compound_interest: zod_1.z.number().optional(),
    note: zod_1.z.string().optional().nullable(),
    organization_id: zod_1.z.number().optional(),
    time_at: zod_1.z.isoDateTz(),
    created_by: zod_1.z.number().optional(),
});
exports.updateDepositSchema = zod_1.z.object({
    bank_id: zod_1.z.number().optional(),
    account_number: zod_1.z.string().optional(),
    deposit_date: zod_1.z.isoDateTz().optional(),
    withdraw_date: zod_1.z.isoDateTz().optional(),
    amount: zod_1.z.number().optional(),
    term: zod_1.z.number().optional(),
    unit: zod_1.z.enum(['VND', 'USD']).optional(),
    interest_rate: zod_1.z.number().optional(),
    compound_interest: zod_1.z.number().optional(),
    note: zod_1.z.string().optional().nullable(),
    status: zod_1.z.enum(['pending', 'confirmed', 'rejected']).optional(),
    files: zod_1.z.string().array().optional(),
    update_count: zod_1.z.number().optional(),
    updated_by: zod_1.z.number().optional(),
});
exports.getPaginatedDepositsSchema = zod_1.z.object({
    page: zod_1.z
        .string()
        .optional()
        .transform((val) => parseInt(val) || 1),
    size: zod_1.z
        .string()
        .optional()
        .transform((val) => parseInt(val) || 10),
    keyword: zod_1.z.string().optional(),
    startAt: zod_1.z.isoDateTz().optional().nullable(),
    endAt: zod_1.z.isoDateTz().optional().nullable(),
    bankId: zod_1.z
        .string()
        .transform((val) => parseInt(val))
        .optional(),
    organizationId: zod_1.z.string().transform((val) => parseInt(val)),
    status: zod_1.z.enum(['pending', 'confirmed', 'rejected']).optional().nullable(),
    bank: zod_1.z.string().optional(),
});
exports.approveDepositSchema = zod_1.z.object({
    status: zod_1.z.enum(['confirmed', 'rejected']),
    file: zod_1.z.string().optional().nullable(),
    files: zod_1.z.string().array().optional(),
    rejected_reason: zod_1.z.string().optional().nullable(),
});
exports.settlementDepositSchema = zod_1.z.object({
    real_compound_interest: zod_1.z.number(),
    real_withdraw_date: zod_1.z.isoDateTz(),
});
