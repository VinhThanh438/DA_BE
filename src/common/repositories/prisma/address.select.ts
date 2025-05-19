import { Prisma } from '.prisma/client';

export const AddressesSelection: Prisma.AddressesSelect = {
    id: true,
    country: true,
    province: true,
    district: true,
    ward: true,
    details: true,
    type: true,
};

export const AddressesSelectionAll: Prisma.AddressesSelect = {
    ...AddressesSelection,
};
