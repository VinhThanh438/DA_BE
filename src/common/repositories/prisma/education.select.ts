import { Prisma } from '.prisma/client';

export const EducationSelection: Prisma.EducationsSelect = {
    id: true,
    education_level: true,
    training_level: true,
    graduated_place: true,
    faculty: true,
    major: true,
    graduation_year: true,
    files: true,
};

export const EducationSelectionAll: Prisma.EducationsSelect = {
    ...EducationSelection,
};
