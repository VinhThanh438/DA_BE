import { Prisma } from '@prisma/client';

export const transformDecimal = <T>(data: T): T => {
    if (data === null || data === undefined) {
        return data;
    }

    if (data instanceof Prisma.Decimal || (data as any)?._hex !== undefined) {
        return Number(data.toString()) as any;
    }

    if (Array.isArray(data)) {
        return data.map(item => transformDecimal(item)) as any;
    }

    if (data && typeof data === 'object' && !Buffer.isBuffer(data)) {
        const transformed = { ...data };
        for (const key in transformed) {
            if (Object.prototype.hasOwnProperty.call(transformed, key)) {
                transformed[key] = transformDecimal(transformed[key]);
            }
        }
        return transformed;
    }

    if (typeof data === 'string' && !isNaN(Number(data.replace(/,/g, '')))) {
        return Number(data.replace(/,/g, '')) as any;
    }

    return data;
}; 