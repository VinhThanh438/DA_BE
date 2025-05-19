import { Prisma } from '.prisma/client';

export const BankSelection: Prisma.BanksSelect = {
    id: true,
    bank: true,
    account_number: true,
    branch: true,
    name: true,
    responsibility: true,
};
export const BankSelectionAll: Prisma.BanksSelect = {
    ...BankSelection,
};
