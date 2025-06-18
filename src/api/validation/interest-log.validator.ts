import { z } from 'zod';

export const getInterestLogs = z.object({
    page: z
        .string()
        .optional()
        .transform((val) => parseInt(val as string) || 1),
    size: z
        .string()
        .optional()
        .transform((val) => parseInt(val as string) || 10),
    startAt: z.string().date().optional().nullable(),
    endAt: z.string().date().optional().nullable(),
    bankId: z
        .string()
        .transform((val) => parseInt(val))
        .optional(),
    organizationId: z.string().transform((val) => parseInt(val)),
    isPaymented: z
        .string()
        .optional()
        .transform((val) => {
            if (val === 'true') return true;
            if (val === 'false') return false;
            return undefined;
        }),
});
