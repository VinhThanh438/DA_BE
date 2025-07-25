import { z, ZodString } from 'zod';
import { TimeAdapter } from '@common/infrastructure/time.adapter';
import express from 'express';

function isoDateTz(): ZodString {
    return z
        .string()
        .refine(
            (value) => {
                if (!value) return true;
                try {
                    const tz = (express.request?.userTimezone as string) || TimeAdapter.getTimezone();
                    TimeAdapter.setTimezone(tz);
                    const isoDateString = TimeAdapter.toISOStringUTC(value);
                    const dateObj = new Date(isoDateString);
                    return !isNaN(dateObj.getTime());
                } catch {
                    return false;
                }
            },
            { message: 'Invalid date or timezone' },
        )
        .transform((value) => {
            const tz = (express.request?.userTimezone as string) || TimeAdapter.getTimezone();
            TimeAdapter.setTimezone(tz);
            return TimeAdapter.toISOStringUTC(value);
        }) as unknown as ZodString;
}

(z as any).isoDateTz = isoDateTz;
