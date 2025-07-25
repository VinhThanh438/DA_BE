import 'joi';

declare module 'joi' {
    interface Root {
        isoDateTz: () => StringSchema;
    }
}
