import { Prisma } from '.prisma/client';

export const PositionSelection: Prisma.PositionsSelect = {
    id: true,
    name: true,
    level: true,
    description: true,
};

export const PositionSelectionAll: Prisma.PositionsSelect = {
    ...PositionSelection,
};
