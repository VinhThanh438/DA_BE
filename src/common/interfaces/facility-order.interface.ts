export interface IFacilityOrder {
    id?: string;
    code?: string;
    status?: string;
    quantity?: number;
    price?: number;
    vat?: number;
    files?: string[];
    note?: string;
    facility_type?: string;
    rejected_reason?: string;
    current_price?: number;
    temp_cost?: number;
    real_quantity?: number;
    real_price?: number;
    main_quantity?: number;
    facility_id: string;
    quotation_id?: string;
    invoice_id?: string;
    commissions?: any[]; // Array of commission objects
    commissions_add?: any[]; // Array of commission objects to be added
    commissions_delete?: any[]; // Array of commission objects to be deleted
    commissions_update?: any[]; // Array of commission objects to be updated
}
