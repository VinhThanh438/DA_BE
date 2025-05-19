import { Prisma } from '.prisma/client';

export const EmergencyContactSelection: Prisma.EmergencyContactsSelect = {
    id: true,
    name: true,
    email: true,
    relationship: true,
    address: true,
    phone: true,
};

export const EmergencyContactSelectionAll: Prisma.EmergencyContactsSelect = {
    ...EmergencyContactSelection,
};
