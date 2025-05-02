import { Address, Prisma } from '.prisma/client';
import { DatabaseAdapter } from '@common/infrastructure/database.adapter';
import { BaseRepo } from './base.repo';

export const AddressSelection: Prisma.AddressSelect = {
    id: true,
    country: true,
    province: true,
    district: true,
    ward: true,
    details: true,
    type: true
};

export const AddressSelectionAll: Prisma.AddressSelect = {
    ...AddressSelection,
};

export class AddressRepo extends BaseRepo<Address, Prisma.AddressSelect, Prisma.AddressWhereInput> {
    protected db = DatabaseAdapter.getInstance().address;
    protected defaultSelect = AddressSelection;
    protected detailSelect = AddressSelectionAll;
    protected modelKey = 'address' as const;
}
