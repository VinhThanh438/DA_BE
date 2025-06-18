import { PrsInventoryType, PrismaClient } from '.prisma/client';
import { IRoleModule } from '@common/interfaces/role.interface';
import { StringValue } from 'ms';
const prisma = new PrismaClient();

export const DEFAULT_TIME_ZONE = 'Asia/Ho_Chi_Minh';

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
    INVENTORY_NORMAL_IN = 'INI',
    INVENTORY_FINISHED_IN = 'IFI',
    INVENTORY_MATERIAL_IN = 'IMI',
    INVENTORY_NORMAL_OUT = 'INO',
    INVENTORY_FINISHED_OUT = 'IFO',
    INVENTORY_MATERIAL_OUT = 'IMO',
    PRODUCTION = 'XS',
    FINANCE_RECORD = 'FN',
    FINANCE_INCOME = 'TH',
    FINANCE_EXPENSE = 'CH',
    OTHER = 'OTH',
    ORDER_EXPENSE = 'CPH',
    PURCHASE_REQUEST = 'DN',
    PAYMENT_REQUEST = 'YTT',
    PAYMENT_INCOME = 'PT',
    PAYMENT_EXPENSE = 'PC',
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
    INVENTORY_NORMAL_IN: PrefixCode.INVENTORY_NORMAL_IN,
    INVENTORY_FINISHED_IN: PrefixCode.INVENTORY_FINISHED_IN,
    INVENTORY_MATERIAL_IN: PrefixCode.INVENTORY_MATERIAL_IN,
    INVENTORY_NORMAL_OUT: PrefixCode.INVENTORY_NORMAL_OUT,
    INVENTORY_FINISHED_OUT: PrefixCode.INVENTORY_FINISHED_OUT,
    INVENTORY_MATERIAL_OUT: PrefixCode.INVENTORY_MATERIAL_OUT,
    PRODUCTION: PrefixCode.PRODUCTION,
    FINANCERECORD: PrefixCode.FINANCE_RECORD,
    FINANCE_INCOME: PrefixCode.FINANCE_INCOME,
    FINANCE_EXPENSE: PrefixCode.FINANCE_EXPENSE,
    CONTRACT: PrefixCode.CONTRACT,
    ORDEREXPENSE: PrefixCode.ORDER_EXPENSE,
    PURCHASEREQUEST: PrefixCode.PURCHASE_REQUEST,
    OTHER: PrefixCode.OTHER,
    PAYMENT_REQUEST: PrefixCode.PAYMENT_REQUEST,
    PAYMENT_INCOME: PrefixCode.PAYMENT_INCOME,
    PAYMENT_EXPENSE: PrefixCode.PAYMENT_EXPENSE,
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
    INVENTORY_NORMAL_IN: prisma.inventories,
    INVENTORY_FINISHED_IN: prisma.inventories,
    INVENTORY_MATERIAL_IN: prisma.inventories,
    INVENTORY_NORMAL_OUT: prisma.inventories,
    INVENTORY_FINISHED_OUT: prisma.inventories,
    INVENTORY_MATERIAL_OUT: prisma.inventories,
    PRODUCTION: prisma.productions,
    PURCHASE_REQUEST: prisma.purchaseRequests,
    CONTRACT: prisma.contracts,
    ORDEREXPENSE: prisma.orderExpenses,
    PAYMENT_REQUEST: prisma.paymentRequests,
    PAYMENT_INCOME: prisma.payments,
    PAYMENT_EXPENSE: prisma.payments,
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
    INVENTORY_NORMAL_IN = 'inventory_normal_in',
    INVENTORY_FINISHED_IN = 'inventory_finished_in',
    INVENTORY_MATERIAL_IN = 'inventory_material_in',
    INVENTORY_NORMAL_OUT = 'inventory_normal_out',
    INVENTORY_FINISHED_OUT = 'inventory_finished_out',
    INVENTORY_MATERIAL_OUT = 'inventory_material_out',
    PRODUCTION = 'production',
    FINANCE_RECORDS = 'finance_record',
    PAYMENT_INCOME = 'payment_income',
    PAYMENT_EXPENSE = 'payment_expense',
    CONTRACT = 'contract',
    ORDER_EXPENSE = 'orderexpense',
    PURCHASE_REQUEST = 'purchase_request',
    PAYMENT_REQUEST = 'payment_request',
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
    PENDING = 'pending',
    CONFIRMED = 'confirmed',
    REJECTED = 'rejected',
}

export enum OrderExpenseType {
    INCOME = 'income',
    EXPENSE = 'expense',
    ORDER_INCOME = 'order_income',
    ORDER_EXPENSE = 'order_expense',
}

export enum ProductType {
    SUB_MATERIAL = 'sub_material',
    MAIN_MATERIAL = 'main_material',
    FINISHED = 'finished',
    SEMI = 'semi',
}

export const DEFAULT_EXCLUDED_FIELDS = ['key'];

export enum OrderType {
    PURCHASE = 'purchase',
    PRODUCTION = 'production',
    COMMERCIAL = 'commercial',
}

export enum PrsOrderType {
    purchase = 'purchase',
    production = 'production',
    commercial = 'commercial',
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
    INCOME = 'income',
    EXPENSE = 'expense',
}

export enum TransactionWarehouseType {
    IN = 'in',
    OUT = 'out',
}

export const InventoryType = {
    FINISHED_IN: PrsInventoryType.inventory_finished_in,
    FINISHED_OUT: PrsInventoryType.inventory_finished_out,
    NORMAL_IN: PrsInventoryType.inventory_normal_in,
    NORMAL_OUT: PrsInventoryType.inventory_normal_out,
    MATERIAL_IN: PrsInventoryType.inventory_material_in,
    MATERIAL_OUT: PrsInventoryType.inventory_material_out,
} as const;

export const InventoryTypeDirectionMap: Record<
    (typeof InventoryType)[keyof typeof InventoryType],
    TransactionWarehouseType
> = {
    [InventoryType.FINISHED_IN]: TransactionWarehouseType.IN,
    [InventoryType.NORMAL_IN]: TransactionWarehouseType.IN,
    [InventoryType.MATERIAL_IN]: TransactionWarehouseType.IN,
    [InventoryType.FINISHED_OUT]: TransactionWarehouseType.OUT,
    [InventoryType.NORMAL_OUT]: TransactionWarehouseType.OUT,
    [InventoryType.MATERIAL_OUT]: TransactionWarehouseType.OUT,
};

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
    'insurance_salary',
    'salary',
    'balance',
];

export enum PaymentRequestStatus {
    PENDING = 'pending',
    CONFIRMED = 'confirmed',
    REJECTED = 'rejected',
    PAYMENTED = 'paymented',
}

export enum PaymentRequestType {
    ORDER = 'order',
    COMMISSION = 'commission',
    INTEREST = 'interest',
    LOAN = 'loan',
}

export enum DeptType {
    ORDER = 'order',
    COMMISSION = 'product',
}

export enum TransactionOrderType {
    ORDER = 'order',
    COMMISSION = 'commission',
    LOAN = 'loan',
    INTEREST = 'interest',
    TRANSFER = 'transfer',
}

export enum TransactionType {
    IN = 'in',
    OUT = 'out',
}

export enum ShippingPlanStatus {
    PENDING = 'pending',
    CONFIRMED = 'confirmed',
    REJECTED = 'rejected',
}

export enum PaymentType {
    INCOME = 'income',
    EXPENSE = 'expense',
}

export enum TransactionType {
    INCOME = 'income',
    EXPENSE = 'expense',
}

export enum CommonApproveStatus {
    PENDING = 'pending',
    CONFIRMED = 'confirmed',
    REJECTED = 'rejected',
}

export enum BankType {
    BANK = 'bank',
    FUND = 'fund',
    DEPOSIT = 'deposit',
}

export const logoLeft = 'https://api.thepdonganh.itomo.one/uploads/access/logos/logo.png';
export const logoRight = 'https://api.thepdonganh.itomo.one/uploads/access/logos/logo2.png';

export enum PaymentRequestDetailStatus {
    PENDING = 'pending',
    PAYMENTED = 'paymented',
}

export enum PaymentMethod {
    TRANSFER = 'transfer',
    CASH = 'cash',
    CREDIT_CARD = 'credit_card',
}

export enum LoanStatus {
    PENDING = 'pending',
    CONFIRMED = 'confirmed',
    REJECTED = 'rejected',
}

export enum InvoiceType {
    SUPPLIER = 'supplier',
    CUSTOMER = 'customer',
    DELIVERY = 'delivery',
}
