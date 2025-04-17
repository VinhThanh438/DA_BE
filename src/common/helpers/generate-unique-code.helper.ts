import { PrefixCode } from "@config/app.constant";

interface GenerateCodeParams {
    lastCode: string | null;
    prefix: PrefixCode;
    maxLength?: number;
    fillString?: string;
}

export function generateUniqueCode({ lastCode, prefix, maxLength = 6, fillString = '0' }: GenerateCodeParams): string {
    let nextNumber = 1;

    if (lastCode && lastCode.startsWith(prefix)) {
        const numberPart = lastCode.replace(prefix, '');
        nextNumber = parseInt(numberPart, 10) + 1;
    }

    return `${prefix}${nextNumber.toString().padStart(maxLength, fillString)}`;
}
