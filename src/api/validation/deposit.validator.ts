import { z } from 'zod';

export const createDepositSchema = z.object({
    bank_id: z.number(),
    employee_id: z.number().optional(),
    account_number: z.string(),
    deposit_date: (z as any).isoDateTz().optional(),
    withdraw_date: (z as any).isoDateTz().optional(),
    unit: z.enum(['VND', 'USD']).optional().default('VND'),
    term: z.number(),
    amount: z.number(),
    interest_rate: z.number(),
    compound_interest: z.number().optional(),
    note: z.string().optional().nullable(),
    organization_id: z.number().optional(),
    time_at: (z as any).isoDateTz(),
    created_by: z.number().optional(),
});

export const updateDepositSchema = z.object({
    bank_id: z.number().optional(),
    account_number: z.string().optional(),
    deposit_date: (z as any).isoDateTz().optional(),
    withdraw_date: (z as any).isoDateTz().optional(),
    amount: z.number().optional(),
    term: z.number().optional(),
    unit: z.enum(['VND', 'USD']).optional(),
    interest_rate: z.number().optional(),
    compound_interest: z.number().optional(),
    note: z.string().optional().nullable(),
    status: z.enum(['pending', 'confirmed', 'rejected']).optional(),
    files: z.string().array().optional(),
    update_count: z.number().optional(),
    updated_by: z.number().optional(),
});

export const getPaginatedDepositsSchema = z.object({
    page: z
        .string()
        .optional()
        .transform((val) => parseInt(val as string) || 1),
    size: z
        .string()
        .optional()
        .transform((val) => parseInt(val as string) || 10),
    keyword: z.string().optional(),
    startAt: (z as any).isoDateTz().optional().nullable(),
    endAt: (z as any).isoDateTz().optional().nullable(),
    bankId: z
        .string()
        .transform((val) => parseInt(val))
        .optional(),
    organizationId: z.string().transform((val) => parseInt(val)),
    status: z.enum(['pending', 'confirmed', 'rejected']).optional().nullable(),
    bank: z.string().optional(),
});

export const approveDepositSchema = z.object({
    status: z.enum(['confirmed', 'rejected']),
    file: z.string().optional().nullable(),
    files: z.string().array().optional(),
    rejected_reason: z.string().optional().nullable(),
});

export const settlementDepositSchema = z.object({
    real_compound_interest: z.number(),
    real_withdraw_date: (z as any).isoDateTz(),
});
