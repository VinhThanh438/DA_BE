import { EmergencyContacts, Prisma } from '.prisma/client';
import { DatabaseAdapter } from '@common/infrastructure/database.adapter';
import { BaseRepo } from './base.repo';
import { EmergencyContactSelection, EmergencyContactSelectionAll } from './prisma/prisma.select';

export class EmergencyContactRepo extends BaseRepo<
    EmergencyContacts,
    Prisma.EmergencyContactsSelect,
    Prisma.EmergencyContactsWhereInput
> {
    protected db = DatabaseAdapter.getInstance().getClient().emergencyContacts;
    protected defaultSelect = EmergencyContactSelection;
    protected detailSelect = EmergencyContactSelectionAll;
    protected modelKey = 'emergencyContacts' as const;
}
