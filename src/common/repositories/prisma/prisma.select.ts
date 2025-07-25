import { Prisma } from '.prisma/client';

export const ProductHistorySelection: Prisma.ProductHistoriesSelect = {
    id: true,
    price: true,
    time_at: true,
    product_id: true,
};

export const NotificationSelection: Prisma.NotificationsSelect = {
    id: true,
    title: true,
    send_at: true,
    content: true,
    type: true,
    created_at: true,
    updated_at: true,
    user_id: true,
    event_id: true,
    flag: true,
    description: true,
    is_seen: true,
    dayToEvent: true,
    organization_id: true,
};

export const InvoiceSelection: Prisma.InvoicesSelect = {
    id: true,
    code: true,
    time_at: true,
    invoice_date: true,
    rejected_reason: true,
    note: true,
    files: true,
    is_payment_completed: true,
    type: true,
    order_id: true,
    shipping_plan_id: true,
};

export const OrganizationSelection: Prisma.OrganizationsSelect = {
    id: true,
    name: true,
    code: true,
    responsibility: true,
    establishment: true,
    industry: true,
    logo: true,
    type: true,
    files: true,
    address: true,
    phone: true,
    hotline: true,
    email: true,
    website: true,
    tax_code: true,
    parent_id: true,
};

export const OrderSelection: Prisma.OrdersSelect = {
    id: true,
    code: true,
    time_at: true,
    type: true,
    address: true,
    phone: true,
    status: true,
    payment_method: true,
    rejected_reason: true,
    delivery_progress: true,
    files: true,
    note: true,

    product_quality: true,
    delivery_location: true,
    delivery_method: true,
    delivery_time: true,
    payment_note: true,
    additional_note: true,
    detail_note: true,
    isDone: true,

    partner_id: true,
    employee_id: true,
    organization_id: true,

    organization: {
        select: OrganizationSelection,
    },
    tolerance: true,
};

export const WorkPricingSelection: Prisma.WorkPricingsSelect = {
    id: true,
    price: true,
    note: true,
};

export const InventorySelection: Prisma.InventoriesSelect = {
    id: true,
    code: true,
    time_at: true,
    type: true,
    note: true,
    files: true,
    status: true,
    plate: true,
    vehicle: true,
    delivery_cost: true,
    identity_code: true,
    representative_name: true,
    vat: true,
    order_id: true,
    employee_id: true,
    warehouse_id: true,
    delivery_id: true,
    organization_id: true,
    confirmed_at: true,
    is_update_locked: true,
};

export const InventoryDetailSelection: Prisma.InventoryDetailsSelect = {
    id: true,
    real_quantity: true,
    quantity: true,
    price: true,
    discount: true,
    vat: true,
    note: true,
    commission: true,
    order_detail_id: true,
    money: true,
    real_money: true,
    kg: true,
    real_kg: true,
    inventory_id: true,
    quantity_adjustment: true,
};

export const UnloadingCostSelection: Prisma.UnloadingCostsSelect = {
    id: true,
    price: true,
    quantity: true,
    vat: true,
    note: true,
    files: true,
    status: true,
    order_id: true,
    unit_id: true,
};

export const StockTrackingSelection: Prisma.StockTrackingsSelect = {
    id: true,
    time_at: true,
    current_balance: true,
    product_id: true,
    child_id: true,
    warehouse_id: true,
    transaction_warehouse_id: true,
    price: true,
};

export const TransactionWarehouseSelect: Prisma.TransactionWarehousesSelect = {
    id: true,
    quantity: true,
    time_at: true,
    type: true,
    note: true,
    convert_quantity: true,
    real_quantity: true,
    inventory_id: true,
    warehouse_id: true,
    product_id: true,
    inventory_detail_id: true,
};

export const AddressesSelection: Prisma.AddressesSelect = {
    id: true,
    country: true,
    province: true,
    district: true,
    ward: true,
    details: true,
    type: true,
};

export const AreasSelection: Prisma.AreasSelect = {
    id: true,
    name: true,
};

export const BankSelection: Prisma.BanksSelect = {
    id: true,
    code: true,
    bank: true,
    account_number: true,
    branch: true,
    name: true,
    description: true,
    type: true,
    balance: true,
    beginning_balance: true,
    responsibility: true,
};

export const BomDetailSelection: Prisma.BomDetailsSelect = {
    id: true,
    note: true,
    quantity: true,
};

export const BomSelection: Prisma.BomSelect = {
    id: true,
    note: true,
};

export const ClauseSelection: Prisma.ClausesSelect = {
    id: true,
    name: true,
    content: true,
    max_dept_amount: true,
    max_dept_day: true,
};

export const CommissionSelection: Prisma.CommissionsSelect = {
    id: true,
    price: true,
    price_vat: true,
    quantity: true,
    quantity_vat: true,
    note: true,
    origin_price: true,
    total_quantity: true,
};

export const CommonDetailSelection: Prisma.CommonDetailsSelect = {
    id: true,
    quantity: true,
    price: true,
    discount: true,
    vat: true,
    note: true,
    commission: true,
    imported_quantity: true,
    product_id: true,
    unit_id: true,

    current_price: true,
    temp_cost: true,
    real_price: true,
    real_quantity: true,
    main_quantity: true,
    quotation_request_detail_id: true,
};

export const DebtSelection: Prisma.DebtsSelect = {
    id: true,
    total_amount: true,
    total_commission: true,
    time_at: true,
    type: true,
    debt_type: true,
    partner_id: true,
    invoice_id: true,
    order_id: true,
};

export const WarehouseSelection: Prisma.WarehousesSelect = {
    id: true,
    code: true,
    name: true,
    phone: true,
    address: true,
    note: true,
};

export const JobPositionSelection: Prisma.JobPositionsSelect = {
    id: true,
    name: true,
    level: true,
    description: true,
};

export const LoanSelection: Prisma.LoansSelect = {
    id: true,
    account_number: true,
    disbursement_date: true,
    interest_calculation_date: true,
    payment_day: true,
    term: true,
    amount: true,
    interest_rate: true,
    current_debt: true,
    // bank: true,
    files: true,
    note: true,
    status: true,
    rejected_reason: true,
    organization_id: true,
    bank_id: true,
    invoice_id: true,
    order_id: true,
    partner_id: true,
};

export const ContractSelection: Prisma.ContractsSelect = {
    id: true,
    code: true,
    tax: true,
    note: true,
    time_at: true,
    contract_date: true,
    status: true,
    delivery_date: true,
    files: true,
};

export const PartnerGroupSelection: Prisma.PartnerGroupsSelect = {
    id: true,
    name: true,
};

export const PartnerSelection: Prisma.PartnersSelect = {
    id: true,
    code: true,
    name: true,
    type: true,
    phone: true,
    address: true,
    email: true,
    note: true,
    tax: true,
    representative_name: true,
    representative_phone: true,
    representative_email: true,
    representative_position: true,
    partner_group: {
        select: PartnerGroupSelection,
    },
};

export const ShippingPlanSelection: Prisma.ShippingPlansSelect = {
    id: true,
    price: true,
    vat: true,
    quantity: true,
    completed_quantity: true,
    status: true,
    rejected_reason: true,
    note: true,
    is_done: true,
    partner_id: true,
    order_id: true,
    facility_type: true,
    organization_id: true,
    facility_id: true,
    current_price: true,
    temp_cost: true,
    real_price: true,
    real_quantity: true,
    main_quantity: true,
    type: true,
    partner: {
        select: PartnerSelection,
    },
};

export const TransactionSelect: Prisma.TransactionsSelect = {
    id: true,
    type: true,
    time_at: true,
    order_type: true,
    amount: true,
    note: true,
    is_closed: true,
    partner_id: true,
    order_id: true,
    invoice_id: true,
    shipping_plan_id: true,
};

export const DepositSelection: Prisma.DepositsSelect = {
    id: true,
    account_number: true,
    time_at: true,
    deposit_date: true,
    withdraw_date: true,
    term: true,
    amount: true,
    unit: true,
    interest_rate: true,
    compound_interest: true,
    files: true,
    note: true,
    status: true,
    rejected_reason: true,
    created_at: true,
    updated_at: true,
    bank_id: true,
    employee_id: true,
    organization_id: true,
};

export const UserSelectionWithoutPassword: Prisma.UsersSelect = {
    id: true,
    code: true,
    device_uid: true,
    username: true,
    email: true,
    employee_id: true,
};

export const UserSelection: Prisma.UsersSelect = {
    ...UserSelectionWithoutPassword,
    password: true,
    is_first_loggin: true,
    is_default: true,
    is_disabled: true,
};

export const DeviceRequestSelection: Prisma.DeviceRequestsSelect = {
    id: true,
    device_uid: true,
    status: true,
    ip_address: true,
    user_agent: true,
    user: {
        select: UserSelectionWithoutPassword,
    },
};

export const EducationSelection: Prisma.EducationsSelect = {
    id: true,
    education_level: true,
    training_level: true,
    graduated_place: true,
    faculty: true,
    major: true,
    graduation_year: true,
    files: true,
};

export const QuotationSelection: Prisma.QuotationsSelect = {
    id: true,
    code: true,
    time_at: true,
    expired_date: true,
    note: true,
    status: true,
    type: true,
    files: true,
    quotation_files: true,
    message: true,
    is_confirmed: true,
    partner_id: true,
    purchase_request_id: true,
    rejected_reason: true,
    product_quality: true,
    delivery_location: true,
    delivery_method: true,
    delivery_time: true,
    payment_note: true,
    additional_note: true,
    detail_note: true,
    organization_id: true,
    employee_id: true,
};

export const PaymentRequestDetailSelection: Prisma.PaymentRequestDetailsSelect = {
    id: true,
    code: true,
    amount: true,
    note: true,
    status: true,
    order_id: true,
    invoice_id: true,
    payment_request_id: true,
    loan_id: true,
    interest_log_id: true,
};

export const EmergencyContactSelection: Prisma.EmergencyContactsSelect = {
    id: true,
    name: true,
    email: true,
    relationship: true,
    address: true,
    phone: true,
};

export const MeshSelection: Prisma.MeshSelect = {
    id: true,

    quotation_id: true,
    note: true,
    total_quantity: true,
    total_weight: true,
    total_area: true,
    scope_name: true,
    quantity_name: true,
    length_name: true,
    width_name: true,
    weight_name: true,
    area_name: true,
};

export const MeshDetailSelection: Prisma.MeshDetailSelect = {
    id: true,
    name: true,
    quantity: true,

    length: true,
    length_spacing: true,
    length_phi: true,
    length_left: true,
    length_right: true,

    width: true,
    width_spacing: true,
    width_phi: true,
    width_left: true,
    width_right: true,
};

export const PurchaseRequestDetailSelection: Prisma.PurchaseRequestDetailsSelect = {
    id: true,
    quantity: true,
    note: true,
    unit_id: true,
    material_id: true,
};

export const ProductionStepSelection: Prisma.ProductionStepSelect = {
    id: true,
    note: true,
    name: true,
};

export const ProductionDetailSelection: Prisma.ProductionDetailsSelect = {
    id: true,
    quantity: true,
};

export const EmployeeContractSelection: Prisma.EmployeeContractsSelect = {
    id: true,
    code: true,
    type: true,
    salary: true,
    start_date: true,
    end_date: true,
    is_applied: true,
    file: true,
};

export const UnitSelection: Prisma.UnitsSelect = {
    id: true,
    name: true,
    is_default: true,
};

export const EmployeeFinanceSelection: Prisma.EmployeeFinancesSelect = {
    id: true,
    name: true,
    amount: true,
    note: true,
    status: true,
    type: true,
};

export const EmployeeShortSelection: Prisma.EmployeesSelect = {
    id: true,
    code: true,
    email: true,
    name: true,
    gender: true,
};

export const FacilitySelection: Prisma.FacilitySelect = {
    id: true,
    name: true,
    note: true,
    price: true,
    image: true,
    code: true,
    vat: true,
    commission: true,
    is_default: true,
};

export const ProductSelection: Prisma.ProductsSelect = {
    id: true,
    name: true,
    code: true,
    current_price: true,
    vat: true,
    image: true,
    packing_standard: true,
    note: true,
    type: true,
    parent_id: true,
    is_public: true,
    unit: {
        select: UnitSelection,
    },
    extra_units: {
        select: {
            unit: {
                select: UnitSelection,
            },
            conversion_rate: true,
        },
    },
};

export const PurchaseRequestSelection: Prisma.PurchaseRequestsSelect = {
    id: true,
    code: true,
    note: true,
    status: true,
    files: true,
    rejected_reason: true,
    time_at: true,
};

export const ProductionSelection: Prisma.ProductionsSelect = {
    id: true,
    code: true,
    time_at: true,
    files: true,
    idx: true,
    note: true,
    progress: true,
    total_area: true,
    total_weight: true,
    total_quantity: true,
};

export const QuotationRequestDetailSelection: Prisma.QuotationRequestDetailsSelect = {
    id: true,
    quantity: true,
    product_id: true,
    note: true,
};

export const InvoiceDetailSelection: Prisma.InvoiceDetailsSelect = {
    id: true,
    order_detail_id: true,
    note: true,
};

export const RoleSelection: Prisma.RolesSelect = {
    id: true,
    name: true,
};

export const RoleSelectionAll: Prisma.RolesSelect = {
    id: true,
    name: true,
    permissions: true,
};

export const PaymentRequestSelectBasic: Prisma.PaymentRequestsSelect = {
    id: true,
    time_at: true,
    code: true,
    payment_date: true,
    note: true,
    type: true,
    files: true,
    status: true,
    rejected_reason: true,
    partner_id: true,
};

export const GateLogSelection: Prisma.GateLogsSelect = {
    id: true,
    time_at: true,
    status: true,
    entry_note: true,
    exit_note: true,
    inventory_id: true,
    organization_id: true,
    employee_id: true,
    entry_time: true,
    entry_plate_images: true,
    entry_container_images: true,
    exit_time: true,
    exit_plate_images: true,
    exit_container_images: true,
    created_at: true,
    updated_at: true,
    files: true,
    rejected_reason: true,
    idx: true,
};

export const ProductGroupSelection: Prisma.ProductGroupsSelect = {
    id: true,
    name: true,
    type: true,
};

export const InsuranceSelection: Prisma.InsurancesSelect = {
    id: true,
    is_participating: true,
    rate: true,
    insurance_number: true,
    insurance_salary: true,
    start_date: true,
};

export const QuotationRequestSelection: Prisma.QuotationRequestsSelect = {
    id: true,
    note: true,
    code: true,
    status: true,
    files: true,
    time_at: true,
    partner_id: true,
    organization_name: true,
    tax: true,
    address: true,
    phone: true,
    email: true,
    requester_name: true,
    rejected_reason: true,
    is_save: true,
    employee_id: true,
};

export const PositionSelection: Prisma.PositionsSelect = {
    id: true,
    name: true,
    level: true,
    description: true,
};

export const RepresentativeSelection: Prisma.RepresentativesSelect = {
    id: true,
    name: true,
    phone: true,
    salutation: true,
    title: true,
    email: true,
};

export const InterestLogSelection: Prisma.InterestLogsSelect = {
    id: true,
    debt_before_payment: true,
    time_at: true,
    amount: true,
    interest_amount: true,
    interest_days: true,
    interest_rate: true,
    is_paymented: true,
    real_interest_amount: true,
};

export const PaymentSelect: Prisma.PaymentsSelect = {
    id: true,
    time_at: true,
    code: true,
    payment_date: true,
    note: true,
    type: true,
    files: true,
    status: true,
    rejected_reason: true,

    bank_id: true,
    partner_id: true,
    organization_id: true,
    order_id: true,
    invoice_id: true,

    description: true,
    payment_method: true,
    amount: true,
    counterparty: true,
    attached_documents: true,
    transactions: {
        select: TransactionSelect,
    },
};

export const FacilitySelectionAll: Prisma.FacilitySelect = {
    ...FacilitySelection,
    unit: {
        select: UnitSelection,
    },
    partner: {
        select: PartnerSelection,
    },
};

export const FacilityOrderSelection: Prisma.FacilityOrdersSelect = {
    id: true,
    code: true,
    status: true,
    note: true,
    files: true,
    rejected_reason: true,
    price: true,
    vat: true,
    facility_type: true,
    quantity: true,
    current_price: true,
    temp_cost: true,
    real_price: true,
    real_quantity: true,
    main_quantity: true,
    facility_id: true,
    quotation_id: true,
    organization_id: true,
    facility: {
        select: FacilitySelectionAll,
    },
};

export const EmployeeFinanceSelectionAll: Prisma.EmployeeFinancesSelect = {
    ...EmployeeFinanceSelection,
};

export const EmployeeContractSelectionAll: Prisma.EmployeeContractsSelect = {
    ...EmployeeContractSelection,
};

export const EmergencyContactSelectionAll: Prisma.EmergencyContactsSelect = {
    ...EmergencyContactSelection,
};

export const EducationSelectionAll: Prisma.EducationsSelect = {
    ...EducationSelection,
};

export const JobPositionSelectionAll: Prisma.JobPositionsSelect = {
    ...JobPositionSelection,
    position: {
        select: PositionSelection,
    },
    organization: {
        select: OrganizationSelection,
    },
};

export const EmployeeSelection: Prisma.EmployeesSelect = {
    ...EmployeeShortSelection,
    marital_status: true,
    working_status: true,
    employee_status: true,
    date_of_birth: true,
    phone: true,
    tax: true,
    ethnicity: true,
    religion: true,
    attendance_code: true,
    description: true,
    avatar: true,
    base_salary: true,
    bank: true,
    bank_branch: true,
    bank_code: true,
    job_position: {
        select: JobPositionSelectionAll,
    },
};

export const BankSelectionAll: Prisma.BanksSelect = {
    ...BankSelection,
};

export const AddressesSelectionAll: Prisma.AddressesSelect = {
    ...AddressesSelection,
};

export const AreasSelectionAll: Prisma.AreasSelect = {
    ...AreasSelection,
};

export const InsuranceSelectionAll: Prisma.InsurancesSelect = {
    ...InsuranceSelection,
};

export const EmployeeSelectionAll: Prisma.EmployeesSelect = {
    ...EmployeeSelection,
    identity_code: true,
    identity_issued_place: true,
    identity_issued_date: true,
    identity_expired_date: true,

    passport_code: true,
    passport_issued_place: true,
    passport_issued_date: true,

    trial_date: true,
    official_date: true,

    educations: {
        select: EducationSelectionAll,
    },
    employee_finances: {
        select: EmployeeFinanceSelectionAll,
    },
    addresses: {
        select: AddressesSelectionAll,
    },
    emergency_contacts: {
        select: EmergencyContactSelectionAll,
    },
    employee_contracts: {
        select: EmployeeContractSelectionAll,
    },
    insurances: {
        select: InsuranceSelectionAll,
    },
};

export const UnitSelectionAll: Prisma.UnitsSelect = {
    ...UnitSelection,
};

export const ProductGroupSelectionAll: Prisma.ProductGroupsSelect = {
    ...ProductGroupSelection,
};

export const WorkPricingSelectionAll: Prisma.WorkPricingsSelect = {
    ...WorkPricingSelection,
    unit: {
        select: UnitSelection,
    },
    production_step: {
        select: ProductionStepSelection,
    },
};

export const ProductSelectionAll: Prisma.ProductsSelect = {
    ...ProductSelection,
    product_group: {
        select: ProductGroupSelectionAll,
    },
    parent: {
        select: ProductSelection,
    },
    product_histories: {
        select: ProductHistorySelection,
    },
    bom: {
        select: {
            ...BomSelection,
            details: {
                select: BomDetailSelection,
            },
            work_pricings: {
                select: WorkPricingSelectionAll,
            },
        },
    },
    stock_trackings: {
        select: StockTrackingSelection,
    },
    stock_trackings_child: {
        select: StockTrackingSelection,
    },
};

export const BomDetailSelectionAll: Prisma.BomDetailsSelect = {
    ...BomDetailSelection,
    material: {
        select: ProductSelectionAll,
    },
    unit: {
        select: UnitSelectionAll,
    },
};

export const BomSelectionAllWithoutProduct: Prisma.BomSelect = {
    ...BomSelection,
    details: {
        select: BomDetailSelectionAll,
    },
    work_pricings: {
        select: WorkPricingSelectionAll,
    },
};

export const CommonDetailSelectionAll: Prisma.CommonDetailsSelect = {
    ...CommonDetailSelection,
    product: {
        select: ProductSelectionAll,
    },
    unit: {
        select: UnitSelectionAll,
    },
    commissions: {
        select: {
            id: true,
            price: true,
            price_vat: true,
            quantity: true,
            quantity_vat: true,
            note: true,
            origin_price: true,
            total_quantity: true,
            representative: {
                select: RepresentativeSelection,
            },
        },
    },
    quotation_request_detail: {
        select: QuotationRequestDetailSelection,
    },
    material: {
        select: ProductSelectionAll,
    },
};

export const InventoryDetailSelectionProduct: Prisma.InventoryDetailsSelect = {
    ...InventoryDetailSelection,
    order_detail: {
        select: CommonDetailSelectionAll,
    },
};

export const WarehouseSelectionAll: Prisma.WarehousesSelect = {
    ...WarehouseSelection,
    employee: {
        select: EmployeeSelection,
    },
};

export const InventoryForGetImportDetailSelection: Prisma.InventoriesSelect = {
    ...InventorySelection,
    warehouse: {
        select: WarehouseSelectionAll,
    },
};

export const InventoryDetailSelectionImportDetail: Prisma.InventoryDetailsSelect = {
    ...InventoryDetailSelection,
    order_detail: {
        select: CommonDetailSelectionAll,
    },
    inventory: {
        select: InventoryForGetImportDetailSelection,
    },
};

export const InventoryDetailSelectionAll: Prisma.InventoryDetailsSelect = {
    ...InventoryDetailSelection,
    real_quantity: true,
    quantity_adjustment: true,
    kg: true,
    real_kg: true,
    order_detail: {
        select: CommonDetailSelectionAll,
    },
};

export const InvoiceSelectionWithTotal: Prisma.InvoicesSelect = {
    ...InvoiceSelection,
    total_amount: true,
    total_money: true,
    total_vat: true,
    total_commission: true,

    total_amount_paid: true,
    total_amount_debt: true,
    total_commission_paid: true,
    total_commission_debt: true,
};

export const InvoiceDetailSelectionAll: Prisma.InvoiceDetailsSelect = {
    ...InvoiceDetailSelection,
    order_detail: {
        select: CommonDetailSelectionAll,
    },
};

export const RepresentativeShortSelectionAll: Prisma.RepresentativesSelect = {
    ...RepresentativeSelection,
    banks: {
        select: BankSelectionAll,
    },
};

export const OrderSelectionPartner: Prisma.OrdersSelect = {
    ...OrderSelection,
    partner: {
        select: PartnerSelection,
    },
    representative: {
        select: RepresentativeShortSelectionAll,
    },
};

export const InvoiceSelectionAll: Prisma.InvoicesSelect = {
    ...InvoiceSelectionWithTotal,
    details: {
        select: InvoiceDetailSelectionAll,
    },
    shipping_plan: {
        select: ShippingPlanSelection,
    },
    bank: {
        select: BankSelection,
    },
    employee: {
        select: EmployeeShortSelection,
    },
    partner: {
        select: PartnerSelection,
    },
    order: {
        select: OrderSelectionPartner,
    },
};

export const InvoiceSelectionWithDetails: Prisma.InvoicesSelect = {
    ...InvoiceSelectionWithTotal,
    details: {
        select: InvoiceDetailSelectionAll,
    },
};

export const LoanSelectionWithInterestLog: Prisma.LoansSelect = {
    ...LoanSelection,
    bank: {
        select: BankSelection,
    },
    interest_logs: {
        select: InterestLogSelection,
    },
};

export const LoanSelectionAll: Prisma.LoansSelect = {
    ...LoanSelectionWithInterestLog,
    invoice: {
        select: InvoiceSelection,
    },
    order: {
        select: OrderSelection,
    },
    partner: {
        select: PartnerSelection,
    },
    bank: {
        select: BankSelection,
    },
};

export const ShippingPlanSelectionAll: Prisma.ShippingPlansSelect = {
    ...ShippingPlanSelection,
    order: {
        select: OrderSelection,
    },
    facility: {
        select: FacilitySelection,
    },
};

export const RepresentativeSelectionAll: Prisma.RepresentativesSelect = {
    ...RepresentativeSelection,
    banks: {
        select: BankSelectionAll,
    },
    partner: {
        select: PartnerSelection,
    },
};

export const PartnerSelectionAll: Prisma.PartnersSelect = {
    ...PartnerSelection,
    clause: {
        select: ClauseSelection,
    },
    representatives: {
        select: RepresentativeSelectionAll,
    },
    employee: {
        select: EmployeeSelection,
    },
    banks: {
        select: BankSelection,
    },
};

export const CommissionSelectionAll: Prisma.CommissionsSelect = {
    ...CommissionSelection,
    representative: {
        select: RepresentativeSelection,
    },
};

export const FacilityOrderSelectionAll: Prisma.FacilityOrdersSelect = {
    ...FacilityOrderSelection,
    quotation: {
        select: QuotationSelection,
    },
    commissions: {
        select: CommissionSelectionAll,
    },
};

export const OrderSelectionAll: Prisma.OrdersSelect = {
    ...OrderSelection,
    representative: {
        select: RepresentativeShortSelectionAll,
    },
    partner: {
        select: PartnerSelectionAll,
    },
    details: {
        select: CommonDetailSelectionAll,
    },
    productions: {
        select: ProductionSelection,
    },
    contracts: {
        select: ContractSelection,
    },
    inventories: {
        select: InventorySelection,
    },
    invoices: {
        select: InvoiceSelection,
    },
    employee: {
        select: EmployeeShortSelection,
    },
    bank: {
        select: BankSelectionAll,
    },
    shipping_plans: {
        select: ShippingPlanSelectionAll,
    },
    facility_orders: {
        select: FacilityOrderSelectionAll,
    },
};

export const OrderSelectionDetails: Prisma.OrdersSelect = {
    ...OrderSelection,
    details: {
        select: CommonDetailSelectionAll,
    },
};

export const OrganizationSelectionAll: Prisma.OrganizationsSelect = {
    ...OrganizationSelection,
    sub_organization: {
        select: OrganizationSelection,
    },
    parent: {
        select: OrganizationSelection,
    },
    leader: {
        select: EmployeeSelection,
    },
};

export const OrganizationSelectionWithAllSubs: Prisma.OrganizationsSelect = {
    ...OrganizationSelection,
    sub_organization: {
        select: OrganizationSelectionAll,
    },
    parent: {
        select: OrganizationSelection,
    },
    leader: {
        select: EmployeeSelection,
    },
};

export const PartnerGroupSelectionAll: Prisma.PartnerGroupsSelect = {
    ...PartnerGroupSelection,
};

export const PartnerSelectionWithRepresentative: Prisma.PartnersSelect = {
    ...PartnerSelection,
    representatives: {
        select: RepresentativeSelection,
    },
    employee: {
        select: EmployeeSelection,
    },
};

export const PaymentRequestDetailSelectionAll: Prisma.PaymentRequestDetailsSelect = {
    ...PaymentRequestDetailSelection,
    order: {
        select: OrderSelectionDetails,
    },
    invoice: {
        select: InvoiceSelection,
    },
    payment_request: {
        select: {
            ...PaymentRequestSelectBasic,
            bank: {
                select: BankSelectionAll,
            },
            partner: {
                select: PartnerSelection,
            },
            representative: {
                select: RepresentativeSelectionAll,
            },
        },
    },
    loan: {
        select: LoanSelectionWithInterestLog,
    },
    interest_log: {
        select: InterestLogSelection,
    },
};

export const PaymentRequestSelect: Prisma.PaymentRequestsSelect = {
    ...PaymentRequestSelectBasic,
    employee: {
        select: EmployeeSelection,
    },
    approver: {
        select: EmployeeSelection,
    },
    partner: {
        select: PartnerSelection,
    },
    bank: {
        select: BankSelection,
    },
};

export const PaymentRequestDetailWithFather: Prisma.PaymentRequestDetailsSelect = {
    ...PaymentRequestDetailSelection,
    payment_request: {
        select: PaymentRequestSelect,
    },
    order: {
        select: OrderSelection,
    },
};

export const PaymentRequestSelectAll: Prisma.PaymentRequestsSelect = {
    ...PaymentRequestSelect,
    details: {
        select: PaymentRequestDetailSelectionAll,
    },
};

export const PaymentRequestSelectAllWithBank: Prisma.PaymentRequestsSelect = {
    ...PaymentRequestSelectBasic,
    bank: {
        select: BankSelection,
    },
};

export const PaymentSelectAll: Prisma.PaymentsSelect = {
    ...PaymentSelect,
    payment_request_detail: {
        select: PaymentRequestDetailSelection,
    },
    order: {
        select: OrderSelectionPartner,
    },
    invoice: {
        select: InvoiceSelection,
    },
    partner: {
        select: PartnerSelection,
    },
    bank: {
        select: BankSelection,
    },
};

export const PositionSelectionAll: Prisma.PositionsSelect = {
    ...PositionSelection,
};

export const ProductHistorySelectionAll: Prisma.ProductHistoriesSelect = {
    ...ProductHistorySelection,
    product: {
        select: ProductSelectionAll,
    },
};

export const ProductionDetailSelectionAll: Prisma.ProductionDetailsSelect = {
    ...ProductionDetailSelection,
    order_detail: {
        select: CommonDetailSelectionAll,
    },
};

export const ProductionStepSelectionAll: Prisma.ProductionStepSelect = {
    ...ProductionStepSelection,
};

export const ProductionSelectionAll: Prisma.ProductionsSelect = {
    ...ProductionSelection,
    partner: {
        select: PartnerSelection,
    },
    details: {
        select: ProductionDetailSelectionAll,
    },
};

export const PurchaseRequestDetailSelectionAll: Prisma.PurchaseRequestDetailsSelect = {
    ...PurchaseRequestDetailSelection,
    material: {
        select: ProductSelectionAll,
    },
    unit: {
        select: UnitSelectionAll,
    },
};

export const PurchaseRequestSelectionAll: Prisma.PurchaseRequestsSelect = {
    ...PurchaseRequestSelection,
    employee: {
        select: EmployeeShortSelection,
    },
    details: {
        select: PurchaseRequestDetailSelectionAll,
    },
    order: {
        select: OrderSelection,
    },
    production: {
        select: ProductionSelection,
    },
};

export const QuotationRequestDetailSelectionAll: Prisma.QuotationRequestDetailsSelect = {
    ...QuotationRequestDetailSelection,
    product: {
        select: ProductSelectionAll,
    },
    unit: {
        select: UnitSelectionAll,
    },
    commissions: {
        select: CommissionSelection,
    },
};

export const QuotationRequestSelectionAll: Prisma.QuotationRequestsSelect = {
    ...QuotationRequestSelection,
    partner: {
        select: PartnerSelectionWithRepresentative,
    },
    employee: {
        select: EmployeeSelection,
    },
    details: {
        select: QuotationRequestDetailSelectionAll,
    },
};

export const ShippingPlanSelectionWithFacility: Prisma.ShippingPlansSelect = {
    ...ShippingPlanSelection,
    facility: {
        select: FacilitySelectionAll,
    },
};

export const QuotationSelectionAll: Prisma.QuotationsSelect = {
    ...QuotationSelection,
    employee: {
        select: EmployeeShortSelection,
    },
    partner: {
        select: {
            ...PartnerSelection,
            representatives: {
                select: RepresentativeSelection,
            },
        },
    },
    purchase_request: {
        select: PurchaseRequestSelection,
    },
    details: {
        select: CommonDetailSelectionAll,
    },
    quotation_request: {
        select: QuotationRequestSelection,
    },
    shipping_plans: {
        select: ShippingPlanSelectionWithFacility,
    },
    facility_orders: {
        select: FacilityOrderSelection,
    },
};

export const RepresentativeSelectionQuotation: Prisma.RepresentativesSelect = {
    ...RepresentativeSelection,
    partner: {
        select: {
            ...PartnerSelection,
            representatives: {
                select: RepresentativeSelectionAll,
            },
        },
    },
};

export const ShippingPlanSelectionWithPartner: Prisma.ShippingPlansSelect = {
    ...ShippingPlanSelection,
    partner: {
        select: PartnerSelection,
    },
};

export const StockTrackingSelectionAll: Prisma.StockTrackingsSelect = {
    ...StockTrackingSelection,
    product: {
        select: ProductSelection,
    },
    warehouse: {
        select: WarehouseSelection,
    },
};

export const InventorySelectionDetails: Prisma.InventoriesSelect = {
    ...InventorySelection,
    details: {
        select: InventoryDetailSelectionAll,
    },
};

export const TransactionWarehouseSelectAll: Prisma.TransactionWarehousesSelect = {
    ...TransactionWarehouseSelect,
    warehouse: {
        select: WarehouseSelectionAll,
    },
    inventory: {
        select: InventorySelectionDetails,
    },
};

export const TransactionSelectAll: Prisma.TransactionsSelect = {
    ...TransactionSelect,
    bank: {
        select: BankSelectionAll,
    },
    partner: {
        select: PartnerSelection,
    },
    employee: {
        select: EmployeeSelection,
    },
    organization: {
        select: OrganizationSelection,
    },
    order: {
        select: OrderSelection,
    },
    invoice: {
        select: InvoiceSelection,
    },
    representative: {
        select: RepresentativeSelection,
    },
    shipping_plan: {
        select: ShippingPlanSelection,
    },
};

export const TransactionSelectWithBankOrder: Prisma.TransactionsSelect = {
    ...TransactionSelect,
    bank: {
        select: BankSelectionAll,
    },
    partner: {
        select: PartnerSelection,
    },
    organization: {
        select: OrganizationSelection,
    },
    order: {
        select: OrderSelection,
    },
    payment: {
        select: {
            id: true,
            type: true,
        },
    },
    invoice: {
        select: InvoiceSelection,
    },
};

export const UnloadingCostSelectionAll: Prisma.UnloadingCostsSelect = {
    ...UnloadingCostSelection,
    unit: {
        select: UnitSelectionAll,
    },
};

export const UserRoleSelection: Prisma.UserRolesSelect = {
    organization_id: true,
    organization: {
        select: OrganizationSelection,
    },
    role_id: true,
    role: {
        select: RoleSelection,
    },
};

export const UserSelectionAll: Prisma.UsersSelect = {
    ...UserSelectionWithoutPassword,
    employee: {
        select: EmployeeSelection,
    },
    organization: {
        select: OrganizationSelectionWithAllSubs,
    },
    user_roles: {
        select: UserRoleSelection,
    },
};

export const UserSelectionInfo: Prisma.UsersSelect = {
    ...UserSelectionWithoutPassword,
    employee: {
        select: EmployeeSelection,
    },
};

export const BankSelectionDetail: Prisma.BanksSelect = {
    ...BankSelection,
    employee: {
        select: EmployeeSelection,
    },
    organization: {
        select: OrganizationSelection,
    },
    representative: {
        select: RepresentativeSelection,
    },
};

export const InventorySelectionAll: Prisma.InventoriesSelect = {
    ...InventorySelection,
    organization: {
        select: OrganizationSelection,
    },
    employee: {
        select: EmployeeSelection,
    },
    supplier: {
        select: PartnerSelection,
    },
    customer: {
        select: PartnerSelection,
    },
    delivery: {
        select: PartnerSelection,
    },
    shipping_plan: {
        select: ShippingPlanSelectionAll,
    },
    warehouse: {
        select: WarehouseSelectionAll,
    },
    order: {
        select: OrderSelectionAll,
    },
    details: {
        select: InventoryDetailSelectionAll,
    },
};

export const InventorSelectionWithShipping: Prisma.InventoriesSelect = {
    ...InventorySelection,
    shipping_plan: {
        select: ShippingPlanSelectionWithPartner,
    },
};

export const InventorSelectionWithGateLog: Prisma.InventoriesSelect = {
    ...InventorySelection,
    shipping_plan: {
        select: ShippingPlanSelectionWithPartner,
    },
    warehouse: {
        select: WarehouseSelectionAll,
    },
    order: {
        select: {
            ...OrderSelectionPartner,
            employee: {
                select: EmployeeSelection,
            },
        },
    },
};

export const InterestLogSelectionAll: Prisma.InterestLogsSelect = {
    ...InterestLogSelection,
    loan: {
        select: LoanSelection,
    },
};

export const GateLogSelectionAll: Prisma.GateLogsSelect = {
    ...GateLogSelection,
    inventory: {
        select: InventorSelectionWithGateLog,
    },
    employee: {
        select: EmployeeShortSelection,
    },
    organization: {
        select: OrganizationSelection,
    },
};

export const DepositSelectionAll: Prisma.DepositsSelect = {
    ...DepositSelection,
    bank: {
        select: BankSelection,
    },
    organization: {
        select: OrganizationSelection,
    },
    employee: {
        select: EmployeeSelection,
    },
};

export const ContractSelectionAll: Prisma.ContractsSelect = {
    ...ContractSelection,
    details: {
        select: CommonDetailSelectionAll,
    },
    order: {
        select: OrderSelection,
    },
    partner: {
        select: PartnerSelection,
    },
    organization: {
        select: OrganizationSelection,
    },
    employee: {
        select: EmployeeSelection,
    },
};

export const ClauseSelectionAll: Prisma.ClausesSelect = {
    ...ClauseSelection,
    organization: {
        select: OrganizationSelection,
    },
};

export const BomSelectionAll: Prisma.BomSelect = {
    ...BomSelection,
    product: {
        select: ProductSelection,
    },
    details: {
        select: BomDetailSelectionAll,
    },
    work_pricings: {
        select: WorkPricingSelectionAll,
    },
};

export const MeshDetailSelectionAll: Prisma.MeshDetailSelect = {
    ...MeshDetailSelection,
    product: {
        select: ProductSelection,
    },
    area: {
        select: AreasSelection,
    },
};

export const MeshSelectionAll: Prisma.MeshSelect = {
    ...MeshSelection,
    quotation: {
        select: QuotationSelectionAll,
    },
    details: {
        select: MeshDetailSelectionAll,
    },
};

export const NotificationSelectionAll: Prisma.NotificationsSelect = {
    ...NotificationSelection,
    user: {
        select: UserSelectionInfo,
    },
    organization: {
        select: OrganizationSelection,
    },
};

export const RawMaterialSelection: Prisma.RawMaterialsSelect = {
    id: true,
    quantity: true,
    note: true,
};

export const RawMaterialSelectionAll: Prisma.RawMaterialsSelect = {
    ...RawMaterialSelection,
    product: {
        select: ProductSelection,
    },
};

export const MeshProductionDetailSelection: Prisma.MeshProductionDetailsSelect = {
    id: true,
    quantity: true,
    area: true,
    weight: true,
    length_bar_plate: true,
    width_bar_plate: true,
    tolerance_length: true,
    tolerance_width: true,
};

export const MeshProductionDetailSelectionAll: Prisma.MeshProductionDetailsSelect = {
    ...MeshProductionDetailSelection,
    mesh_detail: {
        select: MeshDetailSelection,
    },
};

export const DebtSelectionAll: Prisma.DebtsSelect = {
    ...DebtSelection,
};
