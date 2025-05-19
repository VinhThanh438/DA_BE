import { Prisma } from '.prisma/client';

export const PartnerGroupSelection: Prisma.PartnerGroupsSelect = {
    id: true,
    name: true,
};

export const PartnerGroupSelectionAll: Prisma.PartnerGroupsSelect = {
    ...PartnerGroupSelection,
};
