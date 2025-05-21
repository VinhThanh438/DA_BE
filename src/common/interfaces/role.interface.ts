export interface IRole {
    name: string;
    permissions?: Record<IRoleModule, IRoleAction[]>;
}

export const ROLE_MODULES = [
    'purchase_material',
    'purchase_order',
    'purchase_contract',
    'payment',
    'warehouse',
    'import_warehouse',
    'export_warehouse',
    'bill_of_material',
    'production',
    'product',
    'customer',
] as const;

// các đối tượng cụ thể
export const ROUTE_MODULES = ['customer', 'payment', 'production', 'product', 'purchase_order'] as const;

export type IRoleModule = (typeof ROLE_MODULES)[number];
export type IRouteModule = (typeof ROUTE_MODULES)[number];

// Define all possible actions
export type IRoleAction =
    | 'c' // create
    | 'r' // read
    | 'u' // update
    | 'd' // delete
    | 'a'; // approve

export interface IUserRole {
    user_id?: number;
    role_id: number;
    organization_id: number;
    key?: string;
}

export interface IPermissionCheck {
    module: IRoleModule;
    action: IRoleAction;
    organization_id?: number;
}
