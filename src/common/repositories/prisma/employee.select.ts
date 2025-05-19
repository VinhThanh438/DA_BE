import { Prisma } from '.prisma/client';
import { AddressesSelectionAll } from './address.select';
import { EmergencyContactSelectionAll } from './emergency-contact.select';
import { EmployeeContractSelectionAll } from './employee-contract.select';
import { EmployeeFinanceSelectionAll } from './employee-finance.select';
import { InsuranceSelectionAll } from './insurance.select';
import { JobPositionSelectionAll } from './job-position.select';
import { EducationSelectionAll } from './education.select';

export const EmployeeShortSelection: Prisma.EmployeesSelect = {
    id: true,
    code: true,
    email: true,
    name: true,
    gender: true,
};

export const EmployeeSelection: Prisma.EmployeesSelect = {
    ...EmployeeShortSelection,
    marital_status: true,
    working_status: true,
    employee_status: true,
    date_of_birth: true,
    phone: true,
    tax: true,
    ethnicity: true,
    religion: true,
    attendance_code: true,
    description: true,
    avatar: true,
    base_salary: true,
    bank: true,
    bank_branch: true,
    bank_code: true,
    job_position: {
        select: JobPositionSelectionAll,
    },
};

export const EmployeeSelectionAll: Prisma.EmployeesSelect = {
    ...EmployeeSelection,
    identity_code: true,
    identity_issued_place: true,
    identity_issued_date: true,
    identity_expired_date: true,
    indentity_files: true,

    passport_code: true,
    passport_issued_place: true,
    passport_issued_date: true,
    passport_expired_date: true,
    passport_files: true,
    trial_date: true,
    official_date: true,

    educations: {
        select: EducationSelectionAll,
    },
    employee_finances: {
        select: EmployeeFinanceSelectionAll,
    },
    addresses: {
        select: AddressesSelectionAll,
    },
    emergency_contacts: {
        select: EmergencyContactSelectionAll,
    },
    employee_contracts: {
        select: EmployeeContractSelectionAll,
    },
    insurances: {
        select: InsuranceSelectionAll,
    },
};
