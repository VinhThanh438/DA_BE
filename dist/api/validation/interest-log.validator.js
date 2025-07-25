"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInterestLogs = void 0;
const zod_1 = require("zod");
exports.getInterestLogs = zod_1.z.object({
    page: zod_1.z
        .string()
        .optional()
        .transform((val) => parseInt(val) || 1),
    size: zod_1.z
        .string()
        .optional()
        .transform((val) => parseInt(val) || 10),
    startAt: zod_1.z.isoDateTz().optional().nullable(),
    endAt: zod_1.z.isoDateTz().optional().nullable(),
    bankId: zod_1.z
        .string()
        .transform((val) => parseInt(val))
        .optional(),
    organizationId: zod_1.z.string().transform((val) => parseInt(val)),
    isPaymented: zod_1.z
        .string()
        .optional()
        .transform((val) => {
        if (val === 'true')
            return true;
        if (val === 'false')
            return false;
        return undefined;
    }),
});
