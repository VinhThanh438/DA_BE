import { DECIMAL_KEYS } from '@config/app.constant';
import { Prisma } from '@prisma/client';

export const transformDecimal = <T>(data: T): T => {
    if (data === null || data === undefined) return data;

    if (data instanceof Date) return data;

    if (data instanceof Prisma.Decimal || (data as any)?._hex !== undefined) {
        return Number(data.toString()) as any;
    }

    if (Array.isArray(data)) {
        return data.map((item) => transformDecimal(item)) as any;
    }

    if (typeof data === 'object' && !Buffer.isBuffer(data)) {
        const transformed = { ...data };

        for (const key in transformed) {
            if (!Object.prototype.hasOwnProperty.call(transformed, key)) continue;

            const value = transformed[key];

            if (
                value instanceof Prisma.Decimal ||
                (value as any)?._hex !== undefined ||
                typeof value === 'string' ||
                typeof value === 'number'
            ) {
                if (DECIMAL_KEYS.includes(key)) {
                    transformed[key] = Number(value) as any;
                } else {
                    transformed[key] = transformDecimal(value);
                }
            } else {
                transformed[key] = transformDecimal(value);
            }
        }

        return transformed;
    }

    return data;
};
