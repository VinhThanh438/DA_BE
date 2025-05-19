import { EmergencyContacts, Prisma } from '.prisma/client';
import { DatabaseAdapter } from '@common/infrastructure/database.adapter';
import { BaseRepo } from './base.repo';
import { EmergencyContactSelection, EmergencyContactSelectionAll } from './prisma/emergency-contact.select';

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
