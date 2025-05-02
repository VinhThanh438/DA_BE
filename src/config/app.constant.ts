import { PrismaClient } from '.prisma/client';
import { StringValue } from 'ms';
const prisma = new PrismaClient();

export enum PublicPath {
    PUBLIC_FILES = '/uploads',
}

export enum Language {
    VN = 'vi',
    EN = 'en',
}

export const ACCESS_TOKEN_EXPIRED_TIME: StringValue = '60s';
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
    CONTRACT = 'CTR',
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
    ORDER_EXPENSE = 'CPH',
    PURCHASE_REQUEST = 'DN',
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
    CONTRACT: PrefixCode.CONTRACT,
    ORDEREXPENSE: PrefixCode.ORDER_EXPENSE,
    PURCHASEREQUEST: PrefixCode.PURCHASE_REQUEST,
    OTHER: PrefixCode.OTHER,
};

export const ModelStringMaps: Record<string, any> = {
    ORGANIZATION: prisma.organizations,
    EMPLOYEE: prisma.employees,
    USER: prisma.users,
    PARTNER: prisma.partners,
    PRODUCT: prisma.products,
    QUOTATION: prisma.quotations,
    ORDER: prisma.orders,
    INVOICE: prisma.invoices,
    WAREHOUSE: prisma.warehouses,
    INVENTORY: prisma.inventories,
    PRODUCTION: prisma.productions,
    FINANCERECORD: prisma.financeRecords,
    PURCHASEREQUESTS: prisma.purchaseRequests,
    CONTRACT: prisma.contracts,
    ORDEREXPENSE: prisma.orderExpenses,
};

export enum CodeType {
    ORGANIZATION = 'organization',
    EMPLOYEE = 'employee',
    USER = 'user',
    PARTNER = 'partner',
    PRODUCT = 'product',
    QUOTATION = 'quotation',
    ORDER = 'order',
    INVOICE = 'invoice',
    WAREHOUSE = 'warehouse',
    INVENTORY = 'inventory',
    PRODUCTION = 'production',
    FINANCE_RECORDS = 'financeRecords',
    CONTRACT = 'contract',
    ORDER_EXPENSE = 'orderexpense',
    PURCHASE_REQUEST = 'purchaseRequests',
}

export enum QuotationRequestType {
    EMPLOYEE = 'employee',
    SUPPLIER = 'supplier',
}

export enum QuotationStatus {
    REJECTED = 'rejected',
    ACCEPTED = 'accepted',
    PENDING = 'pending',
}

export enum Gender {
    MALE = 'male',
    FEMALE = 'female',
    OTHER = 'other',
}

export enum CommonDetailType {
    QUOTATION = 'quotation',
    ORDER = 'order',
    INVOICE = 'invoice',
    CONTRACT = 'contract',
}

export enum ContractStatus {
    DOING = 'doing',
    COMPLETED = 'completed',
    CANCELED = 'cancelled',
}

export enum InvoiceStatus {
    DRAFT = 'draft',
    RELEASED = 'released',
}

export enum OrderExpenseType {
    INCOME = 'income',
    EXPENSE = 'expense',
    ORDER_INCOME = 'order_income',
    ORDER_EXPENSE = 'order_expense',
}

export enum ProductType {
    MATERIAL = 'material',
    PRODUCT = 'product',
}

export const DEFAULT_EXCLUDED_FIELDS = [
    'key',
]

export enum OrderType {
    PURCHASE = 'purchase',
    PRODUCTION = 'production'
}

export enum PurchaseRequestStatus {
    PENDING = 'pending',
    CONFIRMED = 'confirmed',
    REJECTED = 'rejected'
}

export enum QuotationType {
    SUPPLIER = 'supplier',
    CUSTOMER = 'customer'
}