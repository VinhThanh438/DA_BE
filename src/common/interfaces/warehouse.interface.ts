export interface IWarehouse {
    code: string;
    name: string;
    phone?: string;
    address?: string;
    note?: string;
    employee_id?: number;
}

export interface IDataImportWarehousePDF {
    id: number;
    product_name: string;
    product_code: string;
    unit: string;
    unit_name: string;
    quantity: number;
    document: number;
    real: number;
    price: number;
    total_price: number;
    incidental_costs: number;
    kg: number;
    money: number;
}
