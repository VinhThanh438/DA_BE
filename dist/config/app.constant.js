"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoiceType = exports.LoanStatus = exports.PaymentMethod = exports.PaymentRequestDetailStatus = exports.LOGO_RIGHT_PATH = exports.LOGO_LEFT_PATH = exports.logoRight = exports.logoLeft = exports.BankType = exports.CommonApproveStatus = exports.PaymentType = exports.ShippingPlanStatus = exports.TransactionType = exports.TransactionOrderType = exports.DeptType = exports.PaymentRequestType = exports.PaymentRequestStatus = exports.DECIMAL_KEYS = exports.InventoryTypeDirectionMap = exports.InventoryTypeIn = exports.InventoryTypeOut = exports.InventoryType = exports.TransactionWarehouseType = exports.FinanceRecordType = exports.QuotationType = exports.PurchaseRequestStatus = exports.ContractType = exports.OrderStatus = exports.PrsOrderType = exports.OrderType = exports.DEFAULT_EXCLUDED_FIELDS = exports.ProductType = exports.ContractStatus = exports.CommonDetailType = exports.Gender = exports.QuotationStatus = exports.QuotationRequestType = exports.CodeType = exports.ModelStringMaps = exports.ModelPrefixMap = exports.PrefixCode = exports.OrganizationTypeIndex = exports.OrganizationType = exports.PartnerType = exports.RequestStatus = exports.REFRESH_TOKEN_EXPIRED_TIME = exports.ACCESS_TOKEN_EXPIRED_TIME = exports.Language = exports.PublicPath = exports.DEFAULT_TIME_ZONE = void 0;
exports.DebtType = exports.ProductionType = exports.PrefixFilePath = exports.FileType = exports.ExportFileType = exports.UnloadingStatus = exports.CommissionType = void 0;
const client_1 = require(".prisma/client");
const prisma = new client_1.PrismaClient();
exports.DEFAULT_TIME_ZONE = 'Asia/Ho_Chi_Minh';
var PublicPath;
(function (PublicPath) {
    PublicPath["PUBLIC_FOLDER"] = "/uploads";
})(PublicPath || (exports.PublicPath = PublicPath = {}));
var Language;
(function (Language) {
    Language["VN"] = "vi";
    Language["EN"] = "en";
})(Language || (exports.Language = Language = {}));
exports.ACCESS_TOKEN_EXPIRED_TIME = '60s';
exports.REFRESH_TOKEN_EXPIRED_TIME = '20d';
var RequestStatus;
(function (RequestStatus) {
    RequestStatus["PENDING"] = "pending";
    RequestStatus["APPROVED"] = "approved";
    RequestStatus["REJECTED"] = "rejected";
})(RequestStatus || (exports.RequestStatus = RequestStatus = {}));
var PartnerType;
(function (PartnerType) {
    PartnerType["CUSTOMER"] = "customer";
    PartnerType["SUPPLIER"] = "supplier";
    PartnerType["DELIVERY"] = "delivery";
    PartnerType["FACILITY"] = "facility";
})(PartnerType || (exports.PartnerType = PartnerType = {}));
var OrganizationType;
(function (OrganizationType) {
    OrganizationType["HEAD_QUARTER"] = "headquarter";
    OrganizationType["COMPANY"] = "company";
    OrganizationType["DEPARTMENT"] = "department";
    OrganizationType["BRANCH"] = "branch";
})(OrganizationType || (exports.OrganizationType = OrganizationType = {}));
exports.OrganizationTypeIndex = new Map([
    [OrganizationType.HEAD_QUARTER, 1],
    [OrganizationType.COMPANY, 2],
    [OrganizationType.DEPARTMENT, 3],
    [OrganizationType.BRANCH, 4],
]);
var PrefixCode;
(function (PrefixCode) {
    PrefixCode["ORGANIZATION"] = "TC";
    PrefixCode["ORGANIZATION_HEADQUARTER"] = "TSC";
    PrefixCode["ORGANIZATION_COMPANY"] = "CT";
    PrefixCode["ORGANIZATION_DEPARTMENT"] = "PB";
    PrefixCode["ORGANIZATION_BRANCH"] = "CN";
    PrefixCode["EMPLOYEE"] = "NV";
    PrefixCode["CONTRACT"] = "CTR";
    PrefixCode["USER"] = "ND";
    PrefixCode["PARTNER"] = "PN";
    PrefixCode["CUSTOMER"] = "KH";
    PrefixCode["SUPPLIER"] = "NCC";
    PrefixCode["DELIVERY"] = "GH";
    PrefixCode["PRODUCT"] = "SP";
    PrefixCode["MATERIAL"] = "VL";
    PrefixCode["PRODUCT_FINISHED"] = "TP";
    PrefixCode["QUOTATION"] = "BG";
    PrefixCode["QUOTATION_SUPPLIER"] = "BGKH";
    PrefixCode["QUOTATION_CUSTOMER"] = "BGGH";
    PrefixCode["ORDER"] = "DH";
    PrefixCode["ORDER_PURCHASE"] = "DMH";
    PrefixCode["ORDER_PRODUCTION"] = "DSX";
    PrefixCode["INVOICE"] = "HD";
    PrefixCode["WAREHOUSE"] = "KH";
    PrefixCode["INVENTORY"] = "INV";
    PrefixCode["INVENTORY_NORMAL_IN"] = "INI";
    PrefixCode["INVENTORY_FINISHED_IN"] = "IFI";
    PrefixCode["INVENTORY_MATERIAL_IN"] = "IMI";
    PrefixCode["INVENTORY_NORMAL_OUT"] = "INO";
    PrefixCode["INVENTORY_FINISHED_OUT"] = "IFO";
    PrefixCode["INVENTORY_MATERIAL_OUT"] = "IMO";
    PrefixCode["PRODUCTION"] = "XS";
    PrefixCode["FINANCE_RECORD"] = "FN";
    PrefixCode["FINANCE_INCOME"] = "TH";
    PrefixCode["FINANCE_EXPENSE"] = "CH";
    PrefixCode["OTHER"] = "OTH";
    PrefixCode["ORDER_EXPENSE"] = "CPH";
    PrefixCode["PURCHASE_REQUEST"] = "DN";
    PrefixCode["PAYMENT_REQUEST"] = "YTT";
    PrefixCode["PAYMENT_INCOME"] = "PT";
    PrefixCode["PAYMENT_EXPENSE"] = "PC";
    PrefixCode["QUOTATION_REQUEST"] = "YTBG";
    PrefixCode["FACILITY"] = "DV";
    PrefixCode["MESH_SHEET"] = "TSL";
})(PrefixCode || (exports.PrefixCode = PrefixCode = {}));
exports.ModelPrefixMap = {
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
    PURCHASEREQUEST: PrefixCode.PURCHASE_REQUEST,
    OTHER: PrefixCode.OTHER,
    PAYMENT_REQUEST: PrefixCode.PAYMENT_REQUEST,
    PAYMENT_INCOME: PrefixCode.PAYMENT_INCOME,
    PAYMENT_EXPENSE: PrefixCode.PAYMENT_EXPENSE,
    QUOTATION_REQUEST: PrefixCode.QUOTATION_REQUEST,
    FACILITY: PrefixCode.FACILITY,
    MESH_SHEET: PrefixCode.MESH_SHEET,
};
exports.ModelStringMaps = {
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
    PAYMENT_REQUEST: prisma.paymentRequests,
    PAYMENT_INCOME: prisma.payments,
    PAYMENT_EXPENSE: prisma.payments,
    QUOTATION_REQUEST: prisma.quotationRequests,
    FACILITY: prisma.facility,
    MESH_SHEET: prisma.mesh,
};
var CodeType;
(function (CodeType) {
    CodeType["ORGANIZATION"] = "organization";
    CodeType["ORGANIZATION_HEADQUARTER"] = "organization_headquarter";
    CodeType["ORGANIZATION_COMPANY"] = "organization_company";
    CodeType["ORGANIZATION_DEPARTMENT"] = "organization_department";
    CodeType["ORGANIZATION_BRANCH"] = "organization_branch";
    CodeType["EMPLOYEE"] = "employee";
    CodeType["USER"] = "user";
    CodeType["CUSTOMER"] = "customer";
    CodeType["SUPPLIER"] = "supplier";
    CodeType["DELIVERY"] = "delivery";
    CodeType["PARTNER"] = "partner";
    CodeType["PRODUCT"] = "product";
    CodeType["MATERIAL"] = "material";
    CodeType["PRODUCT_FINISHED"] = "product_finished";
    CodeType["QUOTATION"] = "quotation";
    CodeType["QUOTATION_SUPPLIER"] = "quotation_supplier";
    CodeType["QUOTATION_CUSTOMER"] = "quotation_customer";
    CodeType["ORDER"] = "order";
    CodeType["ORDER_PURCHASE"] = "order_purchase";
    CodeType["ORDER_PRODUCTION"] = "order_production";
    CodeType["INVOICE"] = "invoice";
    CodeType["WAREHOUSE"] = "warehouse";
    CodeType["INVENTORY"] = "inventory";
    CodeType["INVENTORY_NORMAL_IN"] = "inventory_normal_in";
    CodeType["INVENTORY_FINISHED_IN"] = "inventory_finished_in";
    CodeType["INVENTORY_MATERIAL_IN"] = "inventory_material_in";
    CodeType["INVENTORY_NORMAL_OUT"] = "inventory_normal_out";
    CodeType["INVENTORY_FINISHED_OUT"] = "inventory_finished_out";
    CodeType["INVENTORY_MATERIAL_OUT"] = "inventory_material_out";
    CodeType["PRODUCTION"] = "production";
    CodeType["FINANCE_RECORDS"] = "finance_record";
    CodeType["PAYMENT_INCOME"] = "payment_income";
    CodeType["PAYMENT_EXPENSE"] = "payment_expense";
    CodeType["CONTRACT"] = "contract";
    CodeType["PURCHASE_REQUEST"] = "purchase_request";
    CodeType["PAYMENT_REQUEST"] = "payment_request";
    CodeType["MESH_SHEET"] = "mesh_sheet";
})(CodeType || (exports.CodeType = CodeType = {}));
var QuotationRequestType;
(function (QuotationRequestType) {
    QuotationRequestType["EMPLOYEE"] = "employee";
    QuotationRequestType["SUPPLIER"] = "supplier";
})(QuotationRequestType || (exports.QuotationRequestType = QuotationRequestType = {}));
var QuotationStatus;
(function (QuotationStatus) {
    QuotationStatus["REJECTED"] = "rejected";
    QuotationStatus["CONFIRMED"] = "confirmed";
    QuotationStatus["PENDING"] = "pending";
})(QuotationStatus || (exports.QuotationStatus = QuotationStatus = {}));
var Gender;
(function (Gender) {
    Gender["MALE"] = "male";
    Gender["FEMALE"] = "female";
    Gender["OTHER"] = "other";
})(Gender || (exports.Gender = Gender = {}));
var CommonDetailType;
(function (CommonDetailType) {
    CommonDetailType["QUOTATION"] = "quotation";
    CommonDetailType["ORDER"] = "order";
    CommonDetailType["INVOICE"] = "invoice";
    CommonDetailType["CONTRACT"] = "contract";
})(CommonDetailType || (exports.CommonDetailType = CommonDetailType = {}));
var ContractStatus;
(function (ContractStatus) {
    ContractStatus["DOING"] = "doing";
    ContractStatus["COMPLETED"] = "completed";
    ContractStatus["CANCELED"] = "cancelled";
})(ContractStatus || (exports.ContractStatus = ContractStatus = {}));
var ProductType;
(function (ProductType) {
    ProductType["SUB_MATERIAL"] = "sub_material";
    ProductType["MAIN_MATERIAL"] = "main_material";
    ProductType["FINISHED"] = "finished";
    ProductType["SEMI"] = "semi";
    ProductType["MATERIAL"] = "material";
})(ProductType || (exports.ProductType = ProductType = {}));
exports.DEFAULT_EXCLUDED_FIELDS = ['key'];
var OrderType;
(function (OrderType) {
    OrderType["PURCHASE"] = "purchase";
    OrderType["PRODUCTION"] = "production";
    OrderType["COMMERCIAL"] = "commercial";
})(OrderType || (exports.OrderType = OrderType = {}));
var PrsOrderType;
(function (PrsOrderType) {
    PrsOrderType["purchase"] = "purchase";
    PrsOrderType["production"] = "production";
    PrsOrderType["commercial"] = "commercial";
})(PrsOrderType || (exports.PrsOrderType = PrsOrderType = {}));
var OrderStatus;
(function (OrderStatus) {
    OrderStatus["PENDING"] = "pending";
    OrderStatus["CONFIRMED"] = "confirmed";
    OrderStatus["REJECTED"] = "rejected";
})(OrderStatus || (exports.OrderStatus = OrderStatus = {}));
var ContractType;
(function (ContractType) {
    ContractType["ORDER"] = "order";
    ContractType["PURCHASE"] = "purchase";
})(ContractType || (exports.ContractType = ContractType = {}));
var PurchaseRequestStatus;
(function (PurchaseRequestStatus) {
    PurchaseRequestStatus["PENDING"] = "pending";
    PurchaseRequestStatus["CONFIRMED"] = "confirmed";
    PurchaseRequestStatus["REJECTED"] = "rejected";
})(PurchaseRequestStatus || (exports.PurchaseRequestStatus = PurchaseRequestStatus = {}));
var QuotationType;
(function (QuotationType) {
    QuotationType["SUPPLIER"] = "supplier";
    QuotationType["CUSTOMER"] = "customer";
})(QuotationType || (exports.QuotationType = QuotationType = {}));
var FinanceRecordType;
(function (FinanceRecordType) {
    FinanceRecordType["INCOME"] = "income";
    FinanceRecordType["EXPENSE"] = "expense";
})(FinanceRecordType || (exports.FinanceRecordType = FinanceRecordType = {}));
var TransactionWarehouseType;
(function (TransactionWarehouseType) {
    TransactionWarehouseType["IN"] = "in";
    TransactionWarehouseType["OUT"] = "out";
})(TransactionWarehouseType || (exports.TransactionWarehouseType = TransactionWarehouseType = {}));
exports.InventoryType = {
    FINISHED_IN: client_1.PrsInventoryType.inventory_finished_in,
    FINISHED_OUT: client_1.PrsInventoryType.inventory_finished_out,
    NORMAL_IN: client_1.PrsInventoryType.inventory_normal_in,
    NORMAL_OUT: client_1.PrsInventoryType.inventory_normal_out,
    MATERIAL_IN: client_1.PrsInventoryType.inventory_material_in,
    MATERIAL_OUT: client_1.PrsInventoryType.inventory_material_out,
};
exports.InventoryTypeOut = [
    exports.InventoryType.FINISHED_OUT,
    exports.InventoryType.NORMAL_OUT,
    exports.InventoryType.MATERIAL_OUT,
];
exports.InventoryTypeIn = [
    exports.InventoryType.FINISHED_IN,
    exports.InventoryType.NORMAL_IN,
    exports.InventoryType.MATERIAL_IN,
];
exports.InventoryTypeDirectionMap = {
    [exports.InventoryType.FINISHED_IN]: TransactionWarehouseType.IN,
    [exports.InventoryType.NORMAL_IN]: TransactionWarehouseType.IN,
    [exports.InventoryType.MATERIAL_IN]: TransactionWarehouseType.IN,
    [exports.InventoryType.FINISHED_OUT]: TransactionWarehouseType.OUT,
    [exports.InventoryType.NORMAL_OUT]: TransactionWarehouseType.OUT,
    [exports.InventoryType.MATERIAL_OUT]: TransactionWarehouseType.OUT,
};
exports.DECIMAL_KEYS = [
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
var PaymentRequestStatus;
(function (PaymentRequestStatus) {
    PaymentRequestStatus["PENDING"] = "pending";
    PaymentRequestStatus["CONFIRMED"] = "confirmed";
    PaymentRequestStatus["REJECTED"] = "rejected";
    PaymentRequestStatus["PAYMENTED"] = "paymented";
})(PaymentRequestStatus || (exports.PaymentRequestStatus = PaymentRequestStatus = {}));
var PaymentRequestType;
(function (PaymentRequestType) {
    PaymentRequestType["ORDER"] = "order";
    PaymentRequestType["COMMISSION"] = "commission";
    PaymentRequestType["INTEREST"] = "interest";
    PaymentRequestType["LOAN"] = "loan";
    PaymentRequestType["DELIVERY"] = "delivery";
})(PaymentRequestType || (exports.PaymentRequestType = PaymentRequestType = {}));
var DeptType;
(function (DeptType) {
    DeptType["ORDER"] = "order";
    DeptType["COMMISSION"] = "product";
})(DeptType || (exports.DeptType = DeptType = {}));
var TransactionOrderType;
(function (TransactionOrderType) {
    TransactionOrderType["ORDER"] = "order";
    TransactionOrderType["COMMISSION"] = "commission";
    TransactionOrderType["LOAN"] = "loan";
    TransactionOrderType["INTEREST"] = "interest";
    TransactionOrderType["TRANSFER"] = "transfer";
    TransactionOrderType["DELIVERY"] = "delivery";
})(TransactionOrderType || (exports.TransactionOrderType = TransactionOrderType = {}));
var TransactionType;
(function (TransactionType) {
    TransactionType["IN"] = "in";
    TransactionType["OUT"] = "out";
})(TransactionType || (exports.TransactionType = TransactionType = {}));
var ShippingPlanStatus;
(function (ShippingPlanStatus) {
    ShippingPlanStatus["PENDING"] = "pending";
    ShippingPlanStatus["CONFIRMED"] = "confirmed";
    ShippingPlanStatus["REJECTED"] = "rejected";
})(ShippingPlanStatus || (exports.ShippingPlanStatus = ShippingPlanStatus = {}));
var PaymentType;
(function (PaymentType) {
    PaymentType["INCOME"] = "income";
    PaymentType["EXPENSE"] = "expense";
})(PaymentType || (exports.PaymentType = PaymentType = {}));
var CommonApproveStatus;
(function (CommonApproveStatus) {
    CommonApproveStatus["PENDING"] = "pending";
    CommonApproveStatus["CONFIRMED"] = "confirmed";
    CommonApproveStatus["REJECTED"] = "rejected";
    CommonApproveStatus["CUSTOMER_PENDING"] = "customer_pending";
    CommonApproveStatus["CUSTOMER_REJECTED"] = "customer_rejected";
})(CommonApproveStatus || (exports.CommonApproveStatus = CommonApproveStatus = {}));
var BankType;
(function (BankType) {
    BankType["BANK"] = "bank";
    BankType["FUND"] = "fund";
    BankType["DEPOSIT"] = "deposit";
})(BankType || (exports.BankType = BankType = {}));
exports.logoLeft = 'https://api.thepdonganh.itomo.one/uploads/access/logos/logo.png';
exports.logoRight = 'https://api.thepdonganh.itomo.one/uploads/access/logos/logo2.png';
exports.LOGO_LEFT_PATH = 'uploads/access/logos/logo.png';
exports.LOGO_RIGHT_PATH = 'uploads/access/logos/logo2.png';
var PaymentRequestDetailStatus;
(function (PaymentRequestDetailStatus) {
    PaymentRequestDetailStatus["PENDING"] = "pending";
    PaymentRequestDetailStatus["PAYMENTED"] = "paymented";
})(PaymentRequestDetailStatus || (exports.PaymentRequestDetailStatus = PaymentRequestDetailStatus = {}));
var PaymentMethod;
(function (PaymentMethod) {
    PaymentMethod["TRANSFER"] = "transfer";
    PaymentMethod["CASH"] = "cash";
    PaymentMethod["CREDIT_CARD"] = "credit_card";
})(PaymentMethod || (exports.PaymentMethod = PaymentMethod = {}));
var LoanStatus;
(function (LoanStatus) {
    LoanStatus["PENDING"] = "pending";
    LoanStatus["CONFIRMED"] = "confirmed";
    LoanStatus["REJECTED"] = "rejected";
})(LoanStatus || (exports.LoanStatus = LoanStatus = {}));
var InvoiceType;
(function (InvoiceType) {
    InvoiceType["SELL"] = "sell";
    InvoiceType["PURCHASE"] = "purchase";
    InvoiceType["DELIVERY"] = "delivery";
    InvoiceType["FACILITY"] = "facility";
})(InvoiceType || (exports.InvoiceType = InvoiceType = {}));
var CommissionType;
(function (CommissionType) {
    CommissionType["PRICE"] = "price";
    CommissionType["QUANTITY"] = "quantity";
})(CommissionType || (exports.CommissionType = CommissionType = {}));
var UnloadingStatus;
(function (UnloadingStatus) {
    UnloadingStatus["PENDING"] = "pending";
    UnloadingStatus["CONFIRMED"] = "confirmed";
    UnloadingStatus["REJECTED"] = "rejected";
})(UnloadingStatus || (exports.UnloadingStatus = UnloadingStatus = {}));
var ExportFileType;
(function (ExportFileType) {
    ExportFileType["PURCHASE_ORDER"] = "purchaseOrder";
    ExportFileType["SALE_ORDER"] = "saleOrder";
    ExportFileType["PURCHASE_DEBT_COMMISSION"] = "purchaseDebtCommission";
    ExportFileType["PURCHASE_DEBT_REPORT"] = "purchaseDebtReport";
    ExportFileType["PURCHASE_DEBT_COMMISSION_REPORT"] = "purchaseDebtCommissionReport";
    ExportFileType["INVENTORY_IMPORT"] = "inventoryImport";
    ExportFileType["INVENTORY_EXPORT"] = "inventoryExport";
    ExportFileType["PURCHASE_CONTRACT"] = "purchaseContract";
    ExportFileType["BANK_TRANSACTION"] = "bankTransaction";
    ExportFileType["QUOTATION"] = "quotation";
    ExportFileType["PURCHASE_DEBT_COMPARISON"] = "purchaseDebtComparison";
    ExportFileType["INVENTORY_FINISHED"] = "inventoryFinished";
    ExportFileType["PRODUCTION_1"] = "production1";
    ExportFileType["PRODUCTION_2"] = "production2";
    ExportFileType["PRODUCTION_3"] = "production3";
    ExportFileType["EXPORT_MATERIAL"] = "exportMaterial";
})(ExportFileType || (exports.ExportFileType = ExportFileType = {}));
var FileType;
(function (FileType) {
    FileType["EXCEL"] = "excel";
    FileType["PDF"] = "pdf";
})(FileType || (exports.FileType = FileType = {}));
exports.PrefixFilePath = 'uploads/files';
var ProductionType;
(function (ProductionType) {
    ProductionType["MESH"] = "mesh";
    ProductionType["NORMAL"] = "normal";
    ProductionType["DRAWN"] = "drawn";
})(ProductionType || (exports.ProductionType = ProductionType = {}));
var DebtType;
(function (DebtType) {
    DebtType["INCOME"] = "income";
    DebtType["EXPENSE"] = "expense";
})(DebtType || (exports.DebtType = DebtType = {}));
