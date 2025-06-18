import {
    approveDepositSchema,
    createDepositSchema,
    getPaginatedDepositsSchema,
    settlementDepositSchema,
    updateDepositSchema,
} from '@api/validation/deposit.validator';
import { z } from 'zod';

export type IDepositCreate = z.infer<typeof createDepositSchema>;
export type IDepositUpdate = z.infer<typeof updateDepositSchema>;
export type IDepositApprove = z.infer<typeof approveDepositSchema>;
export type IDepositSettlement = z.infer<typeof settlementDepositSchema>;

export type IDepositPaginationInput = z.infer<typeof getPaginatedDepositsSchema>;
