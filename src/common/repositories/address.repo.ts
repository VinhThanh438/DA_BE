import { Addresses, Prisma } from '.prisma/client';
import { DatabaseAdapter } from '@common/infrastructure/database.adapter';
import { BaseRepo } from './base.repo';

export const AddressesSelection: Prisma.AddressesSelect = {
    id: true,
    country: true,
    province: true,
    district: true,
    ward: true,
    details: true,
    type: true
};

export const AddressesSelectionAll: Prisma.AddressesSelect = {
    ...AddressesSelection,
};

export class AddressesRepo extends BaseRepo<Addresses, Prisma.AddressesSelect, Prisma.AddressesWhereInput> {
    protected db = DatabaseAdapter.getInstance().addresses;
    protected defaultSelect = AddressesSelection;
    protected detailSelect = AddressesSelectionAll;
    protected modelKey = 'addresses' as const;
}
