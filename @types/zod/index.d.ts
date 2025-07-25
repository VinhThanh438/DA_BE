import { ZodString } from 'zod';

declare module 'zod' {
    interface ZodStatic {
        isoDateTz(): ZodString;
    }
}
