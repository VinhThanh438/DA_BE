import { EmergencyContacts, Prisma } from '.prisma/client';
import { DatabaseAdapter } from '@common/infrastructure/database.adapter';
import { BaseRepo } from './base.repo';

export const EmergencyContactSelection: Prisma.EmergencyContactsSelect = {
    id: true,
    name: true,
    email: true,
    relationship: true,
    address: true,
    phone: true
};

export const EmergencyContactSelectionAll: Prisma.EmergencyContactsSelect = {
    ...EmergencyContactSelection,
};

export class EmergencyContactRepo extends BaseRepo<
    EmergencyContacts,
    Prisma.EmergencyContactsSelect,
    Prisma.EmergencyContactsWhereInput
> {
    protected db = DatabaseAdapter.getInstance().emergencyContacts;
    protected defaultSelect = EmergencyContactSelection;
    protected detailSelect = EmergencyContactSelectionAll;
    protected modelKey = 'emergencyContacts' as const;
}