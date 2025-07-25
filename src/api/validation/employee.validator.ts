import { extendFilterQuery, wrapSchema } from '@common/helpers/wrap-schema.helper';
import { IEmployee, IUpdateEmployee } from '@common/interfaces/employee.interface';
import { Gender } from '@config/app.constant';
import { PrsAddressType, PrsFinanceType } from '@prisma/client';
import { values } from 'lodash';
import { Joi, schema } from 'express-validation';
import { ObjectSchema } from 'joi';
import { queryFilter as baseQueryFilter } from './common.validator';

const EmployeeFinance = {
    id: Joi.number().optional().min(1),
    name: Joi.string().optional().allow(null, '').max(100),
    amount: Joi.number().optional(),
    note: Joi.string().optional().allow(null, '').max(255),
    status: Joi.string().optional().allow(null, '').max(50),
    type: Joi.string()
        .valid(...Object.values(PrsFinanceType))
        .optional()
        .allow(null, ''),
    key: Joi.string().allow(null, ''),
};

const EmployeeContract = {
    id: Joi.number().optional().min(1),
    code: Joi.string().optional().max(50).allow(null, ''),
    type: Joi.string().optional().allow(null, '').max(50),
    salary: Joi.number().optional().allow(null, ''),
    start_date: Joi.isoDateTz().optional().allow(null),
    end_date: Joi.isoDateTz().optional().allow(null),
    is_applied: Joi.boolean().optional().allow(null),
    key: Joi.string().allow(null, ''),
    file: Joi.string().optional().allow(null, ''),
};

const EmployeeBody = {
    code: Joi.string().optional().allow(null, '').max(50),
    email: Joi.string().email().optional().allow(null, ''),
    name: Joi.string().optional().allow(null, '').max(100),
    gender: Joi.string()
        .valid(...values(Gender))
        .optional()
        .default(Gender.OTHER),
    marital_status: Joi.string().optional().allow(null, ''),
    working_status: Joi.string().optional().allow(null, ''),
    employee_status: Joi.string().optional().allow(null, '').max(100),
    date_of_birth: Joi.isoDateTz().optional().allow(null),
    phone: Joi.string().optional().allow(null, '').max(20),
    tax: Joi.string().optional().allow(null, '').max(50),
    ethnicity: Joi.string().optional().allow(null, '').max(100),
    religion: Joi.string().optional().allow(null, '').max(100),
    attendance_code: Joi.string().optional().allow(null, '').max(50),
    description: Joi.string().optional().allow(null, '').max(255),
    bank: Joi.string().optional().allow(null, '').max(255),
    bank_code: Joi.string().optional().allow(null, '').max(255),
    bank_branch: Joi.string().optional().allow(null, '').max(255),
    avatar: Joi.string().optional().allow(null, ''),
    base_salary: Joi.number().optional().allow(null, ''),

    // Identity
    identity_code: Joi.string().optional().allow(null, '').max(20),
    identity_issued_place: Joi.string().optional().allow(null, '').max(100),
    identity_issued_date: Joi.isoDateTz().optional().allow(null),
    identity_expired_date: Joi.isoDateTz().optional().allow(null),

    // Passport
    passport_code: Joi.string().optional().allow(null, '').max(20),
    passport_issued_place: Joi.string().optional().allow(null, '').max(100),
    passport_issued_date: Joi.isoDateTz().optional().allow(null),
    passport_expired_date: Joi.isoDateTz().optional().allow(null),

    organization_id: Joi.number().integer().optional(),
    job_position_id: Joi.number().integer().optional(),

    trial_date: Joi.isoDateTz().optional().allow(null),
    official_date: Joi.isoDateTz().optional().allow(null),

    // Education
    educations: Joi.array()
        .items(
            Joi.object({
                education_level: Joi.string().optional().allow(null, '').max(100),
                training_level: Joi.string().optional().allow(null, '').max(100),
                graduated_place: Joi.string().optional().allow(null, '').max(255),
                faculty: Joi.string().optional().allow(null, '').max(100),
                major: Joi.string().optional().allow(null, '').max(100),
                graduation_year: Joi.number().integer().optional().allow(null, ''),
                key: Joi.string().allow(null, ''),
                files: Joi.array().items(Joi.string()).optional().allow(null, '').default([]),
            }),
        )
        .optional()
        .allow(null),

    // Finance (EmployeeFinances)
    employee_finances: Joi.array().items(Joi.object(EmployeeFinance)).optional().allow(null),

    // Address
    addresses: Joi.array()
        .items(
            Joi.object({
                country: Joi.string().optional().allow(null, '').max(100).default('Việt Nam'),
                province: Joi.string().optional().allow(null, '').max(100),
                district: Joi.string().optional().allow(null, '').max(100),
                ward: Joi.string().optional().allow(null, '').max(100),
                details: Joi.string().optional().allow(null, '').max(255),
                type: Joi.string()
                    .valid(...Object.values(PrsAddressType))
                    .optional()
                    .allow(null, ''),
                key: Joi.string().allow(null, ''),
            }),
        )
        .optional()
        .allow(null),

    // Emergency Contact
    emergency_contacts: Joi.array()
        .items(
            Joi.object({
                name: Joi.string().optional().allow(null, '').max(100),
                email: Joi.string().email().optional().allow(null, ''),
                relationship: Joi.string().optional().allow(null, '').max(50),
                address: Joi.string().optional().allow(null, '').max(255),
                phone: Joi.string().optional().allow(null, '').max(20),
                key: Joi.string().allow(null, ''),
            }),
        )
        .optional()
        .allow(null),

    // Employee Contracts
    employee_contracts: Joi.array().items(Joi.object(EmployeeContract)).optional().allow(null),

    // Insurance
    insurances: Joi.array()
        .items(
            Joi.object({
                is_participating: Joi.boolean().default(false),
                rate: Joi.number().optional().allow(null, ''),
                insurance_number: Joi.string().optional().allow(null, '').max(50),
                insurance_salary: Joi.number().optional().allow(null, ''),
                start_date: Joi.isoDateTz().optional().allow(null),
                key: Joi.string().allow(null, ''),
            }),
        )
        .optional()
        .allow(null),
};

export const createEmployee: schema = {
    body: wrapSchema(Joi.object<IEmployee>(EmployeeBody)),
};

export const updateEmployee: schema = {
    params: wrapSchema(
        Joi.object({
            id: Joi.number().required(),
        }),
    ),
    body: wrapSchema(
        Joi.object<IUpdateEmployee>({
            ...EmployeeBody,
            employee_finances_add: Joi.array().items(Joi.object(EmployeeFinance)).optional().allow(null),
            employee_finances_update: Joi.array().items(Joi.object(EmployeeFinance)).optional().allow(null),
            employee_finances_delete: Joi.array().items(Joi.number()).optional().default([]),

            employee_contracts_add: Joi.array().items(Joi.object(EmployeeContract)).optional().allow(null),
            employee_contracts_update: Joi.array().items(Joi.object(EmployeeContract)).optional().allow(null),
            employee_contracts_delete: Joi.array().items(Joi.number()).optional().default([]),
        }),
    ),
};

export const queryFilter: schema = {
    query: wrapSchema(
        extendFilterQuery(baseQueryFilter.query as ObjectSchema<any>, {
            isCreateUser: Joi.boolean().optional().allow('').default(false),
        }),
    ),
};
