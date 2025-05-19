import { Addresses, Prisma } from '.prisma/client';
import { DatabaseAdapter } from '@common/infrastructure/database.adapter';
import { BaseRepo } from './base.repo';
import { AddressesSelection, AddressesSelectionAll } from './prisma/address.select';

export class AddressesRepo extends BaseRepo<Addresses, Prisma.AddressesSelect, Prisma.AddressesWhereInput> {
    protected db = DatabaseAdapter.getInstance().addresses;
    protected defaultSelect = AddressesSelection;
    protected detailSelect = AddressesSelectionAll;
    protected modelKey = 'addresses' as const;
}
