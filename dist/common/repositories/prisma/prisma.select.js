"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuotationRequestDetailSelection = exports.ProductionSelection = exports.PurchaseRequestSelection = exports.ProductSelection = exports.FacilitySelection = exports.EmployeeShortSelection = exports.EmployeeFinanceSelection = exports.UnitSelection = exports.EmployeeContractSelection = exports.ProductionDetailSelection = exports.ProductionStepSelection = exports.PurchaseRequestDetailSelection = exports.MeshDetailSelection = exports.MeshSelection = exports.EmergencyContactSelection = exports.PaymentRequestDetailSelection = exports.QuotationSelection = exports.EducationSelection = exports.DeviceRequestSelection = exports.UserSelection = exports.UserSelectionWithoutPassword = exports.DepositSelection = exports.TransactionSelect = exports.ShippingPlanSelection = exports.PartnerSelection = exports.PartnerGroupSelection = exports.ContractSelection = exports.LoanSelection = exports.JobPositionSelection = exports.WarehouseSelection = exports.DebtSelection = exports.CommonDetailSelection = exports.CommissionSelection = exports.ClauseSelection = exports.BomSelection = exports.BomDetailSelection = exports.BankSelection = exports.AreasSelection = exports.AddressesSelection = exports.TransactionWarehouseSelect = exports.StockTrackingSelection = exports.UnloadingCostSelection = exports.InventoryDetailSelection = exports.InventorySelection = exports.WorkPricingSelection = exports.OrderSelection = exports.OrganizationSelection = exports.InvoiceSelection = exports.NotificationSelection = exports.ProductHistorySelection = void 0;
exports.FacilityOrderSelectionAll = exports.CommissionSelectionAll = exports.PartnerSelectionAll = exports.RepresentativeSelectionAll = exports.ShippingPlanSelectionAll = exports.LoanSelectionAll = exports.LoanSelectionWithInterestLog = exports.InvoiceSelectionWithDetails = exports.InvoiceSelectionAll = exports.OrderSelectionPartner = exports.RepresentativeShortSelectionAll = exports.InvoiceDetailSelectionAll = exports.InvoiceSelectionWithTotal = exports.InventoryDetailSelectionAll = exports.InventoryDetailSelectionImportDetail = exports.InventoryForGetImportDetailSelection = exports.WarehouseSelectionAll = exports.InventoryDetailSelectionProduct = exports.CommonDetailSelectionAll = exports.BomSelectionAllWithoutProduct = exports.BomDetailSelectionAll = exports.ProductSelectionAll = exports.WorkPricingSelectionAll = exports.ProductGroupSelectionAll = exports.UnitSelectionAll = exports.EmployeeSelectionAll = exports.InsuranceSelectionAll = exports.AreasSelectionAll = exports.AddressesSelectionAll = exports.BankSelectionAll = exports.EmployeeSelection = exports.JobPositionSelectionAll = exports.EducationSelectionAll = exports.EmergencyContactSelectionAll = exports.EmployeeContractSelectionAll = exports.EmployeeFinanceSelectionAll = exports.FacilityOrderSelection = exports.FacilitySelectionAll = exports.PaymentSelect = exports.InterestLogSelection = exports.RepresentativeSelection = exports.PositionSelection = exports.QuotationRequestSelection = exports.InsuranceSelection = exports.ProductGroupSelection = exports.GateLogSelection = exports.PaymentRequestSelectBasic = exports.RoleSelectionAll = exports.RoleSelection = exports.InvoiceDetailSelection = void 0;
exports.MeshProductionDetailSelection = exports.RawMaterialSelectionAll = exports.RawMaterialSelection = exports.NotificationSelectionAll = exports.MeshSelectionAll = exports.MeshDetailSelectionAll = exports.BomSelectionAll = exports.ClauseSelectionAll = exports.ContractSelectionAll = exports.DepositSelectionAll = exports.GateLogSelectionAll = exports.InterestLogSelectionAll = exports.InventorSelectionWithGateLog = exports.InventorSelectionWithShipping = exports.InventorySelectionAll = exports.BankSelectionDetail = exports.UserSelectionInfo = exports.UserSelectionAll = exports.UserRoleSelection = exports.UnloadingCostSelectionAll = exports.TransactionSelectWithBankOrder = exports.TransactionSelectAll = exports.TransactionWarehouseSelectAll = exports.InventorySelectionDetails = exports.StockTrackingSelectionAll = exports.ShippingPlanSelectionWithPartner = exports.RepresentativeSelectionQuotation = exports.QuotationSelectionAll = exports.ShippingPlanSelectionWithFacility = exports.QuotationRequestSelectionAll = exports.QuotationRequestDetailSelectionAll = exports.PurchaseRequestSelectionAll = exports.PurchaseRequestDetailSelectionAll = exports.ProductionSelectionAll = exports.ProductionStepSelectionAll = exports.ProductionDetailSelectionAll = exports.ProductHistorySelectionAll = exports.PositionSelectionAll = exports.PaymentSelectAll = exports.PaymentRequestSelectAllWithBank = exports.PaymentRequestSelectAll = exports.PaymentRequestDetailWithFather = exports.PaymentRequestSelect = exports.PaymentRequestDetailSelectionAll = exports.PartnerSelectionWithRepresentative = exports.PartnerGroupSelectionAll = exports.OrganizationSelectionWithAllSubs = exports.OrganizationSelectionAll = exports.OrderSelectionDetails = exports.OrderSelectionAll = void 0;
exports.DebtSelectionAll = exports.MeshProductionDetailSelectionAll = void 0;
exports.ProductHistorySelection = {
    id: true,
    price: true,
    time_at: true,
    product_id: true,
};
exports.NotificationSelection = {
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
exports.InvoiceSelection = {
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
exports.OrganizationSelection = {
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
exports.OrderSelection = {
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
        select: exports.OrganizationSelection,
    },
    tolerance: true,
};
exports.WorkPricingSelection = {
    id: true,
    price: true,
    note: true,
};
exports.InventorySelection = {
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
exports.InventoryDetailSelection = {
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
exports.UnloadingCostSelection = {
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
exports.StockTrackingSelection = {
    id: true,
    time_at: true,
    current_balance: true,
    product_id: true,
    child_id: true,
    warehouse_id: true,
    transaction_warehouse_id: true,
    price: true,
};
exports.TransactionWarehouseSelect = {
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
exports.AddressesSelection = {
    id: true,
    country: true,
    province: true,
    district: true,
    ward: true,
    details: true,
    type: true,
};
exports.AreasSelection = {
    id: true,
    name: true,
};
exports.BankSelection = {
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
exports.BomDetailSelection = {
    id: true,
    note: true,
    quantity: true,
};
exports.BomSelection = {
    id: true,
    note: true,
};
exports.ClauseSelection = {
    id: true,
    name: true,
    content: true,
    max_dept_amount: true,
    max_dept_day: true,
};
exports.CommissionSelection = {
    id: true,
    price: true,
    price_vat: true,
    quantity: true,
    quantity_vat: true,
    note: true,
    origin_price: true,
    total_quantity: true,
};
exports.CommonDetailSelection = {
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
exports.DebtSelection = {
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
exports.WarehouseSelection = {
    id: true,
    code: true,
    name: true,
    phone: true,
    address: true,
    note: true,
};
exports.JobPositionSelection = {
    id: true,
    name: true,
    level: true,
    description: true,
};
exports.LoanSelection = {
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
exports.ContractSelection = {
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
exports.PartnerGroupSelection = {
    id: true,
    name: true,
};
exports.PartnerSelection = {
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
        select: exports.PartnerGroupSelection,
    },
};
exports.ShippingPlanSelection = {
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
        select: exports.PartnerSelection,
    },
};
exports.TransactionSelect = {
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
exports.DepositSelection = {
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
exports.UserSelectionWithoutPassword = {
    id: true,
    code: true,
    device_uid: true,
    username: true,
    email: true,
    employee_id: true,
};
exports.UserSelection = Object.assign(Object.assign({}, exports.UserSelectionWithoutPassword), { password: true, is_first_loggin: true, is_default: true, is_disabled: true });
exports.DeviceRequestSelection = {
    id: true,
    device_uid: true,
    status: true,
    ip_address: true,
    user_agent: true,
    user: {
        select: exports.UserSelectionWithoutPassword,
    },
};
exports.EducationSelection = {
    id: true,
    education_level: true,
    training_level: true,
    graduated_place: true,
    faculty: true,
    major: true,
    graduation_year: true,
    files: true,
};
exports.QuotationSelection = {
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
exports.PaymentRequestDetailSelection = {
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
exports.EmergencyContactSelection = {
    id: true,
    name: true,
    email: true,
    relationship: true,
    address: true,
    phone: true,
};
exports.MeshSelection = {
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
exports.MeshDetailSelection = {
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
exports.PurchaseRequestDetailSelection = {
    id: true,
    quantity: true,
    note: true,
    unit_id: true,
    material_id: true,
};
exports.ProductionStepSelection = {
    id: true,
    note: true,
    name: true,
};
exports.ProductionDetailSelection = {
    id: true,
    quantity: true,
};
exports.EmployeeContractSelection = {
    id: true,
    code: true,
    type: true,
    salary: true,
    start_date: true,
    end_date: true,
    is_applied: true,
    file: true,
};
exports.UnitSelection = {
    id: true,
    name: true,
    is_default: true,
};
exports.EmployeeFinanceSelection = {
    id: true,
    name: true,
    amount: true,
    note: true,
    status: true,
    type: true,
};
exports.EmployeeShortSelection = {
    id: true,
    code: true,
    email: true,
    name: true,
    gender: true,
};
exports.FacilitySelection = {
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
exports.ProductSelection = {
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
        select: exports.UnitSelection,
    },
    extra_units: {
        select: {
            unit: {
                select: exports.UnitSelection,
            },
            conversion_rate: true,
        },
    },
};
exports.PurchaseRequestSelection = {
    id: true,
    code: true,
    note: true,
    status: true,
    files: true,
    rejected_reason: true,
    time_at: true,
};
exports.ProductionSelection = {
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
exports.QuotationRequestDetailSelection = {
    id: true,
    quantity: true,
    product_id: true,
    note: true,
};
exports.InvoiceDetailSelection = {
    id: true,
    order_detail_id: true,
    note: true,
};
exports.RoleSelection = {
    id: true,
    name: true,
};
exports.RoleSelectionAll = {
    id: true,
    name: true,
    permissions: true,
};
exports.PaymentRequestSelectBasic = {
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
exports.GateLogSelection = {
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
exports.ProductGroupSelection = {
    id: true,
    name: true,
    type: true,
};
exports.InsuranceSelection = {
    id: true,
    is_participating: true,
    rate: true,
    insurance_number: true,
    insurance_salary: true,
    start_date: true,
};
exports.QuotationRequestSelection = {
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
exports.PositionSelection = {
    id: true,
    name: true,
    level: true,
    description: true,
};
exports.RepresentativeSelection = {
    id: true,
    name: true,
    phone: true,
    salutation: true,
    title: true,
    email: true,
};
exports.InterestLogSelection = {
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
exports.PaymentSelect = {
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
        select: exports.TransactionSelect,
    },
};
exports.FacilitySelectionAll = Object.assign(Object.assign({}, exports.FacilitySelection), { unit: {
        select: exports.UnitSelection,
    }, partner: {
        select: exports.PartnerSelection,
    } });
exports.FacilityOrderSelection = {
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
        select: exports.FacilitySelectionAll,
    },
};
exports.EmployeeFinanceSelectionAll = Object.assign({}, exports.EmployeeFinanceSelection);
exports.EmployeeContractSelectionAll = Object.assign({}, exports.EmployeeContractSelection);
exports.EmergencyContactSelectionAll = Object.assign({}, exports.EmergencyContactSelection);
exports.EducationSelectionAll = Object.assign({}, exports.EducationSelection);
exports.JobPositionSelectionAll = Object.assign(Object.assign({}, exports.JobPositionSelection), { position: {
        select: exports.PositionSelection,
    }, organization: {
        select: exports.OrganizationSelection,
    } });
exports.EmployeeSelection = Object.assign(Object.assign({}, exports.EmployeeShortSelection), { marital_status: true, working_status: true, employee_status: true, date_of_birth: true, phone: true, tax: true, ethnicity: true, religion: true, attendance_code: true, description: true, avatar: true, base_salary: true, bank: true, bank_branch: true, bank_code: true, job_position: {
        select: exports.JobPositionSelectionAll,
    } });
exports.BankSelectionAll = Object.assign({}, exports.BankSelection);
exports.AddressesSelectionAll = Object.assign({}, exports.AddressesSelection);
exports.AreasSelectionAll = Object.assign({}, exports.AreasSelection);
exports.InsuranceSelectionAll = Object.assign({}, exports.InsuranceSelection);
exports.EmployeeSelectionAll = Object.assign(Object.assign({}, exports.EmployeeSelection), { identity_code: true, identity_issued_place: true, identity_issued_date: true, identity_expired_date: true, passport_code: true, passport_issued_place: true, passport_issued_date: true, trial_date: true, official_date: true, educations: {
        select: exports.EducationSelectionAll,
    }, employee_finances: {
        select: exports.EmployeeFinanceSelectionAll,
    }, addresses: {
        select: exports.AddressesSelectionAll,
    }, emergency_contacts: {
        select: exports.EmergencyContactSelectionAll,
    }, employee_contracts: {
        select: exports.EmployeeContractSelectionAll,
    }, insurances: {
        select: exports.InsuranceSelectionAll,
    } });
exports.UnitSelectionAll = Object.assign({}, exports.UnitSelection);
exports.ProductGroupSelectionAll = Object.assign({}, exports.ProductGroupSelection);
exports.WorkPricingSelectionAll = Object.assign(Object.assign({}, exports.WorkPricingSelection), { unit: {
        select: exports.UnitSelection,
    }, production_step: {
        select: exports.ProductionStepSelection,
    } });
exports.ProductSelectionAll = Object.assign(Object.assign({}, exports.ProductSelection), { product_group: {
        select: exports.ProductGroupSelectionAll,
    }, parent: {
        select: exports.ProductSelection,
    }, product_histories: {
        select: exports.ProductHistorySelection,
    }, bom: {
        select: Object.assign(Object.assign({}, exports.BomSelection), { details: {
                select: exports.BomDetailSelection,
            }, work_pricings: {
                select: exports.WorkPricingSelectionAll,
            } }),
    }, stock_trackings: {
        select: exports.StockTrackingSelection,
    }, stock_trackings_child: {
        select: exports.StockTrackingSelection,
    } });
exports.BomDetailSelectionAll = Object.assign(Object.assign({}, exports.BomDetailSelection), { material: {
        select: exports.ProductSelectionAll,
    }, unit: {
        select: exports.UnitSelectionAll,
    } });
exports.BomSelectionAllWithoutProduct = Object.assign(Object.assign({}, exports.BomSelection), { details: {
        select: exports.BomDetailSelectionAll,
    }, work_pricings: {
        select: exports.WorkPricingSelectionAll,
    } });
exports.CommonDetailSelectionAll = Object.assign(Object.assign({}, exports.CommonDetailSelection), { product: {
        select: exports.ProductSelectionAll,
    }, unit: {
        select: exports.UnitSelectionAll,
    }, commissions: {
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
                select: exports.RepresentativeSelection,
            },
        },
    }, quotation_request_detail: {
        select: exports.QuotationRequestDetailSelection,
    }, material: {
        select: exports.ProductSelectionAll,
    } });
exports.InventoryDetailSelectionProduct = Object.assign(Object.assign({}, exports.InventoryDetailSelection), { order_detail: {
        select: exports.CommonDetailSelectionAll,
    } });
exports.WarehouseSelectionAll = Object.assign(Object.assign({}, exports.WarehouseSelection), { employee: {
        select: exports.EmployeeSelection,
    } });
exports.InventoryForGetImportDetailSelection = Object.assign(Object.assign({}, exports.InventorySelection), { warehouse: {
        select: exports.WarehouseSelectionAll,
    } });
exports.InventoryDetailSelectionImportDetail = Object.assign(Object.assign({}, exports.InventoryDetailSelection), { order_detail: {
        select: exports.CommonDetailSelectionAll,
    }, inventory: {
        select: exports.InventoryForGetImportDetailSelection,
    } });
exports.InventoryDetailSelectionAll = Object.assign(Object.assign({}, exports.InventoryDetailSelection), { real_quantity: true, quantity_adjustment: true, kg: true, real_kg: true, order_detail: {
        select: exports.CommonDetailSelectionAll,
    } });
exports.InvoiceSelectionWithTotal = Object.assign(Object.assign({}, exports.InvoiceSelection), { total_amount: true, total_money: true, total_vat: true, total_commission: true, total_amount_paid: true, total_amount_debt: true, total_commission_paid: true, total_commission_debt: true });
exports.InvoiceDetailSelectionAll = Object.assign(Object.assign({}, exports.InvoiceDetailSelection), { order_detail: {
        select: exports.CommonDetailSelectionAll,
    } });
exports.RepresentativeShortSelectionAll = Object.assign(Object.assign({}, exports.RepresentativeSelection), { banks: {
        select: exports.BankSelectionAll,
    } });
exports.OrderSelectionPartner = Object.assign(Object.assign({}, exports.OrderSelection), { partner: {
        select: exports.PartnerSelection,
    }, representative: {
        select: exports.RepresentativeShortSelectionAll,
    } });
exports.InvoiceSelectionAll = Object.assign(Object.assign({}, exports.InvoiceSelectionWithTotal), { details: {
        select: exports.InvoiceDetailSelectionAll,
    }, shipping_plan: {
        select: exports.ShippingPlanSelection,
    }, bank: {
        select: exports.BankSelection,
    }, employee: {
        select: exports.EmployeeShortSelection,
    }, partner: {
        select: exports.PartnerSelection,
    }, order: {
        select: exports.OrderSelectionPartner,
    } });
exports.InvoiceSelectionWithDetails = Object.assign(Object.assign({}, exports.InvoiceSelectionWithTotal), { details: {
        select: exports.InvoiceDetailSelectionAll,
    } });
exports.LoanSelectionWithInterestLog = Object.assign(Object.assign({}, exports.LoanSelection), { bank: {
        select: exports.BankSelection,
    }, interest_logs: {
        select: exports.InterestLogSelection,
    } });
exports.LoanSelectionAll = Object.assign(Object.assign({}, exports.LoanSelectionWithInterestLog), { invoice: {
        select: exports.InvoiceSelection,
    }, order: {
        select: exports.OrderSelection,
    }, partner: {
        select: exports.PartnerSelection,
    }, bank: {
        select: exports.BankSelection,
    } });
exports.ShippingPlanSelectionAll = Object.assign(Object.assign({}, exports.ShippingPlanSelection), { order: {
        select: exports.OrderSelection,
    }, facility: {
        select: exports.FacilitySelection,
    } });
exports.RepresentativeSelectionAll = Object.assign(Object.assign({}, exports.RepresentativeSelection), { banks: {
        select: exports.BankSelectionAll,
    }, partner: {
        select: exports.PartnerSelection,
    } });
exports.PartnerSelectionAll = Object.assign(Object.assign({}, exports.PartnerSelection), { clause: {
        select: exports.ClauseSelection,
    }, representatives: {
        select: exports.RepresentativeSelectionAll,
    }, employee: {
        select: exports.EmployeeSelection,
    }, banks: {
        select: exports.BankSelection,
    } });
exports.CommissionSelectionAll = Object.assign(Object.assign({}, exports.CommissionSelection), { representative: {
        select: exports.RepresentativeSelection,
    } });
exports.FacilityOrderSelectionAll = Object.assign(Object.assign({}, exports.FacilityOrderSelection), { quotation: {
        select: exports.QuotationSelection,
    }, commissions: {
        select: exports.CommissionSelectionAll,
    } });
exports.OrderSelectionAll = Object.assign(Object.assign({}, exports.OrderSelection), { representative: {
        select: exports.RepresentativeShortSelectionAll,
    }, partner: {
        select: exports.PartnerSelectionAll,
    }, details: {
        select: exports.CommonDetailSelectionAll,
    }, productions: {
        select: exports.ProductionSelection,
    }, contracts: {
        select: exports.ContractSelection,
    }, inventories: {
        select: exports.InventorySelection,
    }, invoices: {
        select: exports.InvoiceSelection,
    }, employee: {
        select: exports.EmployeeShortSelection,
    }, bank: {
        select: exports.BankSelectionAll,
    }, shipping_plans: {
        select: exports.ShippingPlanSelectionAll,
    }, facility_orders: {
        select: exports.FacilityOrderSelectionAll,
    } });
exports.OrderSelectionDetails = Object.assign(Object.assign({}, exports.OrderSelection), { details: {
        select: exports.CommonDetailSelectionAll,
    } });
exports.OrganizationSelectionAll = Object.assign(Object.assign({}, exports.OrganizationSelection), { sub_organization: {
        select: exports.OrganizationSelection,
    }, parent: {
        select: exports.OrganizationSelection,
    }, leader: {
        select: exports.EmployeeSelection,
    } });
exports.OrganizationSelectionWithAllSubs = Object.assign(Object.assign({}, exports.OrganizationSelection), { sub_organization: {
        select: exports.OrganizationSelectionAll,
    }, parent: {
        select: exports.OrganizationSelection,
    }, leader: {
        select: exports.EmployeeSelection,
    } });
exports.PartnerGroupSelectionAll = Object.assign({}, exports.PartnerGroupSelection);
exports.PartnerSelectionWithRepresentative = Object.assign(Object.assign({}, exports.PartnerSelection), { representatives: {
        select: exports.RepresentativeSelection,
    }, employee: {
        select: exports.EmployeeSelection,
    } });
exports.PaymentRequestDetailSelectionAll = Object.assign(Object.assign({}, exports.PaymentRequestDetailSelection), { order: {
        select: exports.OrderSelectionDetails,
    }, invoice: {
        select: exports.InvoiceSelection,
    }, payment_request: {
        select: Object.assign(Object.assign({}, exports.PaymentRequestSelectBasic), { bank: {
                select: exports.BankSelectionAll,
            }, partner: {
                select: exports.PartnerSelection,
            }, representative: {
                select: exports.RepresentativeSelectionAll,
            } }),
    }, loan: {
        select: exports.LoanSelectionWithInterestLog,
    }, interest_log: {
        select: exports.InterestLogSelection,
    } });
exports.PaymentRequestSelect = Object.assign(Object.assign({}, exports.PaymentRequestSelectBasic), { employee: {
        select: exports.EmployeeSelection,
    }, approver: {
        select: exports.EmployeeSelection,
    }, partner: {
        select: exports.PartnerSelection,
    }, bank: {
        select: exports.BankSelection,
    } });
exports.PaymentRequestDetailWithFather = Object.assign(Object.assign({}, exports.PaymentRequestDetailSelection), { payment_request: {
        select: exports.PaymentRequestSelect,
    }, order: {
        select: exports.OrderSelection,
    } });
exports.PaymentRequestSelectAll = Object.assign(Object.assign({}, exports.PaymentRequestSelect), { details: {
        select: exports.PaymentRequestDetailSelectionAll,
    } });
exports.PaymentRequestSelectAllWithBank = Object.assign(Object.assign({}, exports.PaymentRequestSelectBasic), { bank: {
        select: exports.BankSelection,
    } });
exports.PaymentSelectAll = Object.assign(Object.assign({}, exports.PaymentSelect), { payment_request_detail: {
        select: exports.PaymentRequestDetailSelection,
    }, order: {
        select: exports.OrderSelectionPartner,
    }, invoice: {
        select: exports.InvoiceSelection,
    }, partner: {
        select: exports.PartnerSelection,
    }, bank: {
        select: exports.BankSelection,
    } });
exports.PositionSelectionAll = Object.assign({}, exports.PositionSelection);
exports.ProductHistorySelectionAll = Object.assign(Object.assign({}, exports.ProductHistorySelection), { product: {
        select: exports.ProductSelectionAll,
    } });
exports.ProductionDetailSelectionAll = Object.assign(Object.assign({}, exports.ProductionDetailSelection), { order_detail: {
        select: exports.CommonDetailSelectionAll,
    } });
exports.ProductionStepSelectionAll = Object.assign({}, exports.ProductionStepSelection);
exports.ProductionSelectionAll = Object.assign(Object.assign({}, exports.ProductionSelection), { partner: {
        select: exports.PartnerSelection,
    }, details: {
        select: exports.ProductionDetailSelectionAll,
    } });
exports.PurchaseRequestDetailSelectionAll = Object.assign(Object.assign({}, exports.PurchaseRequestDetailSelection), { material: {
        select: exports.ProductSelectionAll,
    }, unit: {
        select: exports.UnitSelectionAll,
    } });
exports.PurchaseRequestSelectionAll = Object.assign(Object.assign({}, exports.PurchaseRequestSelection), { employee: {
        select: exports.EmployeeShortSelection,
    }, details: {
        select: exports.PurchaseRequestDetailSelectionAll,
    }, order: {
        select: exports.OrderSelection,
    }, production: {
        select: exports.ProductionSelection,
    } });
exports.QuotationRequestDetailSelectionAll = Object.assign(Object.assign({}, exports.QuotationRequestDetailSelection), { product: {
        select: exports.ProductSelectionAll,
    }, unit: {
        select: exports.UnitSelectionAll,
    }, commissions: {
        select: exports.CommissionSelection,
    } });
exports.QuotationRequestSelectionAll = Object.assign(Object.assign({}, exports.QuotationRequestSelection), { partner: {
        select: exports.PartnerSelectionWithRepresentative,
    }, employee: {
        select: exports.EmployeeSelection,
    }, details: {
        select: exports.QuotationRequestDetailSelectionAll,
    } });
exports.ShippingPlanSelectionWithFacility = Object.assign(Object.assign({}, exports.ShippingPlanSelection), { facility: {
        select: exports.FacilitySelectionAll,
    } });
exports.QuotationSelectionAll = Object.assign(Object.assign({}, exports.QuotationSelection), { employee: {
        select: exports.EmployeeShortSelection,
    }, partner: {
        select: Object.assign(Object.assign({}, exports.PartnerSelection), { representatives: {
                select: exports.RepresentativeSelection,
            } }),
    }, purchase_request: {
        select: exports.PurchaseRequestSelection,
    }, details: {
        select: exports.CommonDetailSelectionAll,
    }, quotation_request: {
        select: exports.QuotationRequestSelection,
    }, shipping_plans: {
        select: exports.ShippingPlanSelectionWithFacility,
    }, facility_orders: {
        select: exports.FacilityOrderSelection,
    } });
exports.RepresentativeSelectionQuotation = Object.assign(Object.assign({}, exports.RepresentativeSelection), { partner: {
        select: Object.assign(Object.assign({}, exports.PartnerSelection), { representatives: {
                select: exports.RepresentativeSelectionAll,
            } }),
    } });
exports.ShippingPlanSelectionWithPartner = Object.assign(Object.assign({}, exports.ShippingPlanSelection), { partner: {
        select: exports.PartnerSelection,
    } });
exports.StockTrackingSelectionAll = Object.assign(Object.assign({}, exports.StockTrackingSelection), { product: {
        select: exports.ProductSelection,
    }, warehouse: {
        select: exports.WarehouseSelection,
    } });
exports.InventorySelectionDetails = Object.assign(Object.assign({}, exports.InventorySelection), { details: {
        select: exports.InventoryDetailSelectionAll,
    } });
exports.TransactionWarehouseSelectAll = Object.assign(Object.assign({}, exports.TransactionWarehouseSelect), { warehouse: {
        select: exports.WarehouseSelectionAll,
    }, inventory: {
        select: exports.InventorySelectionDetails,
    } });
exports.TransactionSelectAll = Object.assign(Object.assign({}, exports.TransactionSelect), { bank: {
        select: exports.BankSelectionAll,
    }, partner: {
        select: exports.PartnerSelection,
    }, employee: {
        select: exports.EmployeeSelection,
    }, organization: {
        select: exports.OrganizationSelection,
    }, order: {
        select: exports.OrderSelection,
    }, invoice: {
        select: exports.InvoiceSelection,
    }, representative: {
        select: exports.RepresentativeSelection,
    }, shipping_plan: {
        select: exports.ShippingPlanSelection,
    } });
exports.TransactionSelectWithBankOrder = Object.assign(Object.assign({}, exports.TransactionSelect), { bank: {
        select: exports.BankSelectionAll,
    }, partner: {
        select: exports.PartnerSelection,
    }, organization: {
        select: exports.OrganizationSelection,
    }, order: {
        select: exports.OrderSelection,
    }, payment: {
        select: {
            id: true,
            type: true,
        },
    }, invoice: {
        select: exports.InvoiceSelection,
    } });
exports.UnloadingCostSelectionAll = Object.assign(Object.assign({}, exports.UnloadingCostSelection), { unit: {
        select: exports.UnitSelectionAll,
    } });
exports.UserRoleSelection = {
    organization_id: true,
    organization: {
        select: exports.OrganizationSelection,
    },
    role_id: true,
    role: {
        select: exports.RoleSelection,
    },
};
exports.UserSelectionAll = Object.assign(Object.assign({}, exports.UserSelectionWithoutPassword), { employee: {
        select: exports.EmployeeSelection,
    }, organization: {
        select: exports.OrganizationSelectionWithAllSubs,
    }, user_roles: {
        select: exports.UserRoleSelection,
    } });
exports.UserSelectionInfo = Object.assign(Object.assign({}, exports.UserSelectionWithoutPassword), { employee: {
        select: exports.EmployeeSelection,
    } });
exports.BankSelectionDetail = Object.assign(Object.assign({}, exports.BankSelection), { employee: {
        select: exports.EmployeeSelection,
    }, organization: {
        select: exports.OrganizationSelection,
    }, representative: {
        select: exports.RepresentativeSelection,
    } });
exports.InventorySelectionAll = Object.assign(Object.assign({}, exports.InventorySelection), { organization: {
        select: exports.OrganizationSelection,
    }, employee: {
        select: exports.EmployeeSelection,
    }, supplier: {
        select: exports.PartnerSelection,
    }, customer: {
        select: exports.PartnerSelection,
    }, delivery: {
        select: exports.PartnerSelection,
    }, shipping_plan: {
        select: exports.ShippingPlanSelectionAll,
    }, warehouse: {
        select: exports.WarehouseSelectionAll,
    }, order: {
        select: exports.OrderSelectionAll,
    }, details: {
        select: exports.InventoryDetailSelectionAll,
    } });
exports.InventorSelectionWithShipping = Object.assign(Object.assign({}, exports.InventorySelection), { shipping_plan: {
        select: exports.ShippingPlanSelectionWithPartner,
    } });
exports.InventorSelectionWithGateLog = Object.assign(Object.assign({}, exports.InventorySelection), { shipping_plan: {
        select: exports.ShippingPlanSelectionWithPartner,
    }, warehouse: {
        select: exports.WarehouseSelectionAll,
    }, order: {
        select: Object.assign(Object.assign({}, exports.OrderSelectionPartner), { employee: {
                select: exports.EmployeeSelection,
            } }),
    } });
exports.InterestLogSelectionAll = Object.assign(Object.assign({}, exports.InterestLogSelection), { loan: {
        select: exports.LoanSelection,
    } });
exports.GateLogSelectionAll = Object.assign(Object.assign({}, exports.GateLogSelection), { inventory: {
        select: exports.InventorSelectionWithGateLog,
    }, employee: {
        select: exports.EmployeeShortSelection,
    }, organization: {
        select: exports.OrganizationSelection,
    } });
exports.DepositSelectionAll = Object.assign(Object.assign({}, exports.DepositSelection), { bank: {
        select: exports.BankSelection,
    }, organization: {
        select: exports.OrganizationSelection,
    }, employee: {
        select: exports.EmployeeSelection,
    } });
exports.ContractSelectionAll = Object.assign(Object.assign({}, exports.ContractSelection), { details: {
        select: exports.CommonDetailSelectionAll,
    }, order: {
        select: exports.OrderSelection,
    }, partner: {
        select: exports.PartnerSelection,
    }, organization: {
        select: exports.OrganizationSelection,
    }, employee: {
        select: exports.EmployeeSelection,
    } });
exports.ClauseSelectionAll = Object.assign(Object.assign({}, exports.ClauseSelection), { organization: {
        select: exports.OrganizationSelection,
    } });
exports.BomSelectionAll = Object.assign(Object.assign({}, exports.BomSelection), { product: {
        select: exports.ProductSelection,
    }, details: {
        select: exports.BomDetailSelectionAll,
    }, work_pricings: {
        select: exports.WorkPricingSelectionAll,
    } });
exports.MeshDetailSelectionAll = Object.assign(Object.assign({}, exports.MeshDetailSelection), { product: {
        select: exports.ProductSelection,
    }, area: {
        select: exports.AreasSelection,
    } });
exports.MeshSelectionAll = Object.assign(Object.assign({}, exports.MeshSelection), { quotation: {
        select: exports.QuotationSelectionAll,
    }, details: {
        select: exports.MeshDetailSelectionAll,
    } });
exports.NotificationSelectionAll = Object.assign(Object.assign({}, exports.NotificationSelection), { user: {
        select: exports.UserSelectionInfo,
    }, organization: {
        select: exports.OrganizationSelection,
    } });
exports.RawMaterialSelection = {
    id: true,
    quantity: true,
    note: true,
};
exports.RawMaterialSelectionAll = Object.assign(Object.assign({}, exports.RawMaterialSelection), { product: {
        select: exports.ProductSelection,
    } });
exports.MeshProductionDetailSelection = {
    id: true,
    quantity: true,
    area: true,
    weight: true,
    length_bar_plate: true,
    width_bar_plate: true,
    tolerance_length: true,
    tolerance_width: true,
};
exports.MeshProductionDetailSelectionAll = Object.assign(Object.assign({}, exports.MeshProductionDetailSelection), { mesh_detail: {
        select: exports.MeshDetailSelection,
    } });
exports.DebtSelectionAll = Object.assign({}, exports.DebtSelection);
