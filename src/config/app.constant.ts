import { StringValue } from 'ms';

export enum PublicPath {
    PUBLIC_IMAGES = '/public/images',
}

export enum Language {
    VN = 'vi',
    EN = 'en',
}

export const ACCESS_TOKEN_EXPIRED_TIME: StringValue = '120s';
export const REFRESH_TOKEN_EXPIRED_TIME: StringValue = '20d';

export enum RequestStatus {
    PENDING = 'pending',
    APPROVED = 'approved',
    REJECTED = 'rejected',
}

export interface MailOptions {
    to: string | string[];
    subject: string;
    template?: string;
    text?: string;
    from?: string;
    data?: any;
}

export enum PartnerType {
    CUSTOMER = 'customer',
    SUPPLIER = 'supplier',
    DELIVERY = 'delivery',
}

export enum BankType {
    EMPLOYEE = 'employee',
    PARTNER = 'partner',
}
export enum OrganizationType {
    HEAD_QUARTER = 'headquarter',
    COMPANY = 'company',
    DEPARTMENT = 'department',
}

export enum PrefixCode {
    ORGANIZATION = 'TC',
    EMPLOYEE = 'NV',
    USER = 'ND',
    PARTNER = 'PN',
    PRODUCT = 'SP',
    QUOTATION = 'BG',
    ORDER = 'DH',
    INVOICE = 'HD',
    WAREHOUSE = 'KH',
    INVENTORY = 'INV',
    PRODUCTION = 'XS',
    FINANCE_RECORD = 'FN',
    OTHER = 'OTH',
}

export const ModelPrefixMap: Record<string, PrefixCode> = {
    ORGANIZATION: PrefixCode.ORGANIZATION,
    EMPLOYEE: PrefixCode.EMPLOYEE,
    USER: PrefixCode.USER,
    PARTNER: PrefixCode.PARTNER,
    PRODUCT: PrefixCode.PRODUCT,
    QUOTATION: PrefixCode.QUOTATION,
    ORDER: PrefixCode.ORDER,
    INVOICE: PrefixCode.INVOICE,
    WAREHOUSE: PrefixCode.WAREHOUSE,
    INVENTORY: PrefixCode.INVENTORY,
    PRODUCTION: PrefixCode.PRODUCTION,
    FINANCERECORD: PrefixCode.FINANCE_RECORD,
    OTHER: PrefixCode.OTHER,
};
