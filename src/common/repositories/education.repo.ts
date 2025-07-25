import { Educations, Prisma } from '.prisma/client';
import { DatabaseAdapter } from '@common/infrastructure/database.adapter';
import { BaseRepo } from './base.repo';
import { EducationSelection, EducationSelectionAll } from './prisma/prisma.select';

export class EducationRepo extends BaseRepo<Educations, Prisma.EducationsSelect, Prisma.EducationsWhereInput> {
    protected db = DatabaseAdapter.getInstance().getClient().educations;
    protected defaultSelect = EducationSelection;
    protected detailSelect = EducationSelectionAll;
    protected modelKey = 'educations' as const;
}
