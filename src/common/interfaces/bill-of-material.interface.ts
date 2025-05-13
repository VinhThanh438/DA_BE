import { IProducts } from "./product.interface";

export interface IBillOfMaterialDetails {
    id?: number;
    quantity?: number;
    material_id?: number;
    bom_id?: number;
    unit_id?: number;
    key?: string;
}

export interface IBillOfMaterial {
    id?: number
    product_id?: number;
    salary?: number
    
    product?: IProducts

    details: IBillOfMaterialDetails[]    
}