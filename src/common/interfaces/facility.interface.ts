export interface IFacility {
    id: number;
    name: string;
    price: number;
    code: string;
    vat: number;
    commission: number;
    image?: string;
    note?: string;
    unit_id: number;
    partner_id?: number;
    key?: string;
    is_default?: boolean;
}

export interface ICreateFacility extends Omit<IFacility, 'id'> {}

export interface IUpdateFacility extends Partial<Omit<IFacility, 'id'>> {}
