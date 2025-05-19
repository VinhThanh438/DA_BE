import { Prisma } from '.prisma/client';
import { BankSelectionAll } from './bank.select';
import { PartnerSelection } from './partner.select';

export const RepresentativeSelection: Prisma.RepresentativesSelect = {
    id: true,
    name: true,
    phone: true,
    salutation: true,
    title: true,
    email: true,
};

export const RepresentativeSelectionAll: Prisma.RepresentativesSelect = {
    ...RepresentativeSelection,
    banks: {
        select: BankSelectionAll,
    },
    partner: {
        select: PartnerSelection,
    },
};

export const RepresentativeShortSelectionAll: Prisma.RepresentativesSelect = {
    ...RepresentativeSelection,
    banks: {
        select: BankSelectionAll,
    },
};
