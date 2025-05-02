import { Educations, Prisma } from '.prisma/client';
import { DatabaseAdapter } from '@common/infrastructure/database.adapter';
import { BaseRepo } from './base.repo';

export const EducationSelection: Prisma.EducationsSelect = {
    id: true,
    education_level: true,
    training_level: true,
    graduated_place: true,
    faculty: true,
    major: true,
    graduation_year: true,
};

export const EducationSelectionAll: Prisma.EducationsSelect = {
    ...EducationSelection,
};

export class EducationRepo extends BaseRepo<Educations, Prisma.EducationsSelect, Prisma.EducationsWhereInput> {
    protected db = DatabaseAdapter.getInstance().educations;
    protected defaultSelect = EducationSelection;
    protected detailSelect = EducationSelectionAll;
    protected modelKey = 'educations' as const;
}
