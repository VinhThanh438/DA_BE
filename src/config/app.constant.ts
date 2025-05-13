import { PrsInventoryType, PrismaClient } from '.prisma/client';
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

export enum OrganizationType {
    HEAD_QUARTER = 'headquarter',
    COMPANY = 'company',
    DEPARTMENT = 'department',
    BRANCH = 'branch',
}

export const OrganizationTypeIndex = new Map<OrganizationType, number>([
    [OrganizationType.HEAD_QUARTER, 1],
    [OrganizationType.COMPANY, 2],
    [OrganizationType.DEPARTMENT, 3],
    [OrganizationType.BRANCH, 4],
]);

export enum PrefixCode {
    ORGANIZATION = 'TC',
    ORGANIZATION_HEADQUARTER = 'TSC',
    ORGANIZATION_COMPANY = 'CT',
    ORGANIZATION_DEPARTMENT = 'PB',
    ORGANIZATION_BRANCH = 'CN',
    EMPLOYEE = 'NV',
    CONTRACT = 'CTR',
    USER = 'ND',
    PARTNER = 'PN',
    CUSTOMER = 'KH',
    SUPPLIER = 'NCC',
    DELIVERY = 'GH',
    PRODUCT = 'SP',
    MATERIAL = 'VL',
    PRODUCT_FINISHED = 'TP',
    QUOTATION = 'BG',
    QUOTATION_SUPPLIER = 'BGKH',
    QUOTATION_CUSTOMER = 'BGGH',
    ORDER = 'DH',
    ORDER_PURCHASE = 'DMH',
    ORDER_PRODUCTION = 'DSX',
    INVOICE = 'HD',
    WAREHOUSE = 'KH',
    INVENTORY = 'INV',
    PRODUCTION = 'XS',
    FINANCE_RECORD = 'FN',
    FINANCE_IMCOME = 'TH',
    FINANCE_EXPENSE = 'CH',
    OTHER = 'OTH',
    ORDER_EXPENSE = 'CPH',
    PURCHASE_REQUEST = 'DN',
}

export const ModelPrefixMap: Record<string, PrefixCode> = {
    ORGANIZATION: PrefixCode.ORGANIZATION,
    ORGANIZATION_HEADQUARTER: PrefixCode.ORGANIZATION_HEADQUARTER,
    ORGANIZATION_COMPANY: PrefixCode.ORGANIZATION_COMPANY,
    ORGANIZATION_DEPARTMENT: PrefixCode.ORGANIZATION_DEPARTMENT,
    ORGANIZATION_BRANCH: PrefixCode.ORGANIZATION_BRANCH,
    EMPLOYEE: PrefixCode.EMPLOYEE,
    USER: PrefixCode.USER,
    PARTNER: PrefixCode.PARTNER,
    CUSTOMER: PrefixCode.CUSTOMER,
    SUPPLIER: PrefixCode.SUPPLIER,
    DELIVERY: PrefixCode.DELIVERY,
    PRODUCT: PrefixCode.PRODUCT,
    MATERIAL: PrefixCode.MATERIAL,
    PRODUCT_FINISHED: PrefixCode.PRODUCT_FINISHED,
    QUOTATION: PrefixCode.QUOTATION,
    QUOTATION_SUPPLIER: PrefixCode.QUOTATION_SUPPLIER,
    QUOTATION_CUSTOMER: PrefixCode.QUOTATION_CUSTOMER,
    ORDER: PrefixCode.ORDER,
    ORDER_PURCHASE: PrefixCode.ORDER_PURCHASE,
    ORDER_PRODUCTION: PrefixCode.ORDER_PRODUCTION,
    INVOICE: PrefixCode.INVOICE,
    WAREHOUSE: PrefixCode.WAREHOUSE,
    INVENTORY: PrefixCode.INVENTORY,
    PRODUCTION: PrefixCode.PRODUCTION,
    FINANCERECORD: PrefixCode.FINANCE_RECORD,
    FINANCE_IMCOME: PrefixCode.FINANCE_IMCOME,
    FINANCE_EXPENSE: PrefixCode.FINANCE_EXPENSE,
    CONTRACT: PrefixCode.CONTRACT,
    ORDEREXPENSE: PrefixCode.ORDER_EXPENSE,
    PURCHASEREQUEST: PrefixCode.PURCHASE_REQUEST,
    OTHER: PrefixCode.OTHER,
};

export const ModelStringMaps: Record<string, any> = {
    ORGANIZATION: prisma.organizations,
    ORGANIZATION_HEADQUARTER: prisma.organizations,
    ORGANIZATION_COMPANY: prisma.organizations,
    ORGANIZATION_DEPARTMENT: prisma.organizations,
    ORGANIZATION_BRANCH: prisma.organizations,
    EMPLOYEE: prisma.employees,
    USER: prisma.users,
    PARTNER: prisma.partners,
    CUSTOMER: prisma.partners,
    SUPPLIER: prisma.partners,
    DELIVERY: prisma.partners,
    PRODUCT: prisma.products,
    MATERIAL: prisma.products,
    PRODUCT_FINISHED: prisma.products,
    QUOTATION: prisma.quotations,
    QUOTATION_SUPPLIER: prisma.quotations,
    QUOTATION_CUSTOMER: prisma.quotations,
    ORDER: prisma.orders,
    ORDER_PURCHASE: prisma.orders,
    ORDER_PRODUCTION: prisma.orders,
    INVOICE: prisma.invoices,
    WAREHOUSE: prisma.warehouses,
    INVENTORY: prisma.inventories,
    PRODUCTION: prisma.productions,
    FINANCE_RECORD: prisma.financeRecords,
    FINANCE_IMCOME: prisma.financeRecords,
    FINANCE_EXPENSE: prisma.financeRecords,
    PURCHASE_REQUEST: prisma.purchaseRequests,
    CONTRACT: prisma.contracts,
    ORDEREXPENSE: prisma.orderExpenses,
};

export enum CodeType {
    ORGANIZATION = 'organization',
    ORGANIZATION_HEADQUARTER = 'organization_headquarter',
    ORGANIZATION_COMPANY = 'organization_company',
    ORGANIZATION_DEPARTMENT = 'organization_department',
    ORGANIZATION_BRANCH = 'organization_branch',
    EMPLOYEE = 'employee',
    USER = 'user',
    CUSTOMER = 'customer',
    SUPPLIER = 'supplier',
    DELIVERY = 'delivery',
    PARTNER = 'partner',
    PRODUCT = 'product',
    MATERIAL = 'material',
    PRODUCT_FINISHED = 'product_finished',
    QUOTATION = 'quotation',
    QUOTATION_SUPPLIER = 'quotation_supplier',
    QUOTATION_CUSTOMER = 'quotation_customer',
    ORDER = 'order',
    ORDER_PURCHASE = 'order_purchase',
    ORDER_PRODUCTION = 'order_production',
    INVOICE = 'invoice',
    WAREHOUSE = 'warehouse',
    INVENTORY = 'inventory',
    PRODUCTION = 'production',
    FINANCE_RECORDS = 'finance_record',
    FINANCE_IMCOME = 'finance_imcome',
    FINANCE_EXPENSE = 'finance_expense',
    CONTRACT = 'contract',
    ORDER_EXPENSE = 'orderexpense',
    PURCHASE_REQUEST = 'purchase_request',
}

export enum QuotationRequestType {
    EMPLOYEE = 'employee',
    SUPPLIER = 'supplier',
}

export enum QuotationStatus {
    REJECTED = 'rejected',
    CONFIRMED = 'confirmed',
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
    FINISHED = 'finished',
}

export const DEFAULT_EXCLUDED_FIELDS = ['key'];

export enum OrderType {
    PURCHASE = 'purchase',
    PRODUCTION = 'production',
    COMMERCIAL = 'commercial',
}

export enum OrderStatus {
    PENDING = 'pending',
    CONFIRMED = 'confirmed',
    REJECTED = 'rejected',
}

export enum ContractType {
    ORDER = 'order',
    PURCHASE = 'purchase',
}

export enum PurchaseRequestStatus {
    PENDING = 'pending',
    CONFIRMED = 'confirmed',
    REJECTED = 'rejected',
}

export enum QuotationType {
    SUPPLIER = 'supplier',
    CUSTOMER = 'customer',
}

export enum FinanceRecordType {
    IMCOME = 'income',
    EXPENSE = 'expense',
}

export const InventoryType = {
    FINISHED_IN: PrsInventoryType.finished_in,
    FINISHED_OUT: PrsInventoryType.finished_out,
    NORMAL_IN: PrsInventoryType.normal_in,
    NORMAL_OUT: PrsInventoryType.normal_out,
    MATERIAL_IN: PrsInventoryType.material_in,
    MATERIAL_OUT: PrsInventoryType.material_out,
} as const;

export type InventoryType = (typeof InventoryType)[keyof typeof InventoryType];

export const DECIMAL_KEYS = [
    'amount',
    'price',
    'total',
    'max_dept_amount',
    'base_salary',
    'contract_value',
    'remaining_amount',
    'commission',
];