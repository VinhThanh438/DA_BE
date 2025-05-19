import { Prisma } from '.prisma/client';

export const UnitSelection: Prisma.UnitsSelect = {
    id: true,
    name: true,
};

export const UnitSelectionAll: Prisma.UnitsSelect = {
    ...UnitSelection,
};
