"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.queryFilter = exports.updateEmployee = exports.createEmployee = void 0;
const wrap_schema_helper_1 = require("../../common/helpers/wrap-schema.helper");
const app_constant_1 = require("../../config/app.constant");
const client_1 = require("@prisma/client");
const lodash_1 = require("lodash");
const express_validation_1 = require("express-validation");
const common_validator_1 = require("./common.validator");
const EmployeeFinance = {
    id: express_validation_1.Joi.number().optional().min(1),
    name: express_validation_1.Joi.string().optional().allow(null, '').max(100),
    amount: express_validation_1.Joi.number().optional(),
    note: express_validation_1.Joi.string().optional().allow(null, '').max(255),
    status: express_validation_1.Joi.string().optional().allow(null, '').max(50),
    type: express_validation_1.Joi.string()
        .valid(...Object.values(client_1.PrsFinanceType))
        .optional()
        .allow(null, ''),
    key: express_validation_1.Joi.string().allow(null, ''),
};
const EmployeeContract = {
    id: express_validation_1.Joi.number().optional().min(1),
    code: express_validation_1.Joi.string().optional().max(50).allow(null, ''),
    type: express_validation_1.Joi.string().optional().allow(null, '').max(50),
    salary: express_validation_1.Joi.number().optional().allow(null, ''),
    start_date: express_validation_1.Joi.isoDateTz().optional().allow(null),
    end_date: express_validation_1.Joi.isoDateTz().optional().allow(null),
    is_applied: express_validation_1.Joi.boolean().optional().allow(null),
    key: express_validation_1.Joi.string().allow(null, ''),
    file: express_validation_1.Joi.string().optional().allow(null, ''),
};
const EmployeeBody = {
    code: express_validation_1.Joi.string().optional().allow(null, '').max(50),
    email: express_validation_1.Joi.string().email().optional().allow(null, ''),
    name: express_validation_1.Joi.string().optional().allow(null, '').max(100),
    gender: express_validation_1.Joi.string()
        .valid(...(0, lodash_1.values)(app_constant_1.Gender))
        .optional()
        .default(app_constant_1.Gender.OTHER),
    marital_status: express_validation_1.Joi.string().optional().allow(null, ''),
    working_status: express_validation_1.Joi.string().optional().allow(null, ''),
    employee_status: express_validation_1.Joi.string().optional().allow(null, '').max(100),
    date_of_birth: express_validation_1.Joi.isoDateTz().optional().allow(null),
    phone: express_validation_1.Joi.string().optional().allow(null, '').max(20),
    tax: express_validation_1.Joi.string().optional().allow(null, '').max(50),
    ethnicity: express_validation_1.Joi.string().optional().allow(null, '').max(100),
    religion: express_validation_1.Joi.string().optional().allow(null, '').max(100),
    attendance_code: express_validation_1.Joi.string().optional().allow(null, '').max(50),
    description: express_validation_1.Joi.string().optional().allow(null, '').max(255),
    bank: express_validation_1.Joi.string().optional().allow(null, '').max(255),
    bank_code: express_validation_1.Joi.string().optional().allow(null, '').max(255),
    bank_branch: express_validation_1.Joi.string().optional().allow(null, '').max(255),
    avatar: express_validation_1.Joi.string().optional().allow(null, ''),
    base_salary: express_validation_1.Joi.number().optional().allow(null, ''),
    // Identity
    identity_code: express_validation_1.Joi.string().optional().allow(null, '').max(20),
    identity_issued_place: express_validation_1.Joi.string().optional().allow(null, '').max(100),
    identity_issued_date: express_validation_1.Joi.isoDateTz().optional().allow(null),
    identity_expired_date: express_validation_1.Joi.isoDateTz().optional().allow(null),
    // Passport
    passport_code: express_validation_1.Joi.string().optional().allow(null, '').max(20),
    passport_issued_place: express_validation_1.Joi.string().optional().allow(null, '').max(100),
    passport_issued_date: express_validation_1.Joi.isoDateTz().optional().allow(null),
    passport_expired_date: express_validation_1.Joi.isoDateTz().optional().allow(null),
    organization_id: express_validation_1.Joi.number().integer().optional(),
    job_position_id: express_validation_1.Joi.number().integer().optional(),
    trial_date: express_validation_1.Joi.isoDateTz().optional().allow(null),
    official_date: express_validation_1.Joi.isoDateTz().optional().allow(null),
    // Education
    educations: express_validation_1.Joi.array()
        .items(express_validation_1.Joi.object({
        education_level: express_validation_1.Joi.string().optional().allow(null, '').max(100),
        training_level: express_validation_1.Joi.string().optional().allow(null, '').max(100),
        graduated_place: express_validation_1.Joi.string().optional().allow(null, '').max(255),
        faculty: express_validation_1.Joi.string().optional().allow(null, '').max(100),
        major: express_validation_1.Joi.string().optional().allow(null, '').max(100),
        graduation_year: express_validation_1.Joi.number().integer().optional().allow(null, ''),
        key: express_validation_1.Joi.string().allow(null, ''),
        files: express_validation_1.Joi.array().items(express_validation_1.Joi.string()).optional().allow(null, '').default([]),
    }))
        .optional()
        .allow(null),
    // Finance (EmployeeFinances)
    employee_finances: express_validation_1.Joi.array().items(express_validation_1.Joi.object(EmployeeFinance)).optional().allow(null),
    // Address
    addresses: express_validation_1.Joi.array()
        .items(express_validation_1.Joi.object({
        country: express_validation_1.Joi.string().optional().allow(null, '').max(100).default('Việt Nam'),
        province: express_validation_1.Joi.string().optional().allow(null, '').max(100),
        district: express_validation_1.Joi.string().optional().allow(null, '').max(100),
        ward: express_validation_1.Joi.string().optional().allow(null, '').max(100),
        details: express_validation_1.Joi.string().optional().allow(null, '').max(255),
        type: express_validation_1.Joi.string()
            .valid(...Object.values(client_1.PrsAddressType))
            .optional()
            .allow(null, ''),
        key: express_validation_1.Joi.string().allow(null, ''),
    }))
        .optional()
        .allow(null),
    // Emergency Contact
    emergency_contacts: express_validation_1.Joi.array()
        .items(express_validation_1.Joi.object({
        name: express_validation_1.Joi.string().optional().allow(null, '').max(100),
        email: express_validation_1.Joi.string().email().optional().allow(null, ''),
        relationship: express_validation_1.Joi.string().optional().allow(null, '').max(50),
        address: express_validation_1.Joi.string().optional().allow(null, '').max(255),
        phone: express_validation_1.Joi.string().optional().allow(null, '').max(20),
        key: express_validation_1.Joi.string().allow(null, ''),
    }))
        .optional()
        .allow(null),
    // Employee Contracts
    employee_contracts: express_validation_1.Joi.array().items(express_validation_1.Joi.object(EmployeeContract)).optional().allow(null),
    // Insurance
    insurances: express_validation_1.Joi.array()
        .items(express_validation_1.Joi.object({
        is_participating: express_validation_1.Joi.boolean().default(false),
        rate: express_validation_1.Joi.number().optional().allow(null, ''),
        insurance_number: express_validation_1.Joi.string().optional().allow(null, '').max(50),
        insurance_salary: express_validation_1.Joi.number().optional().allow(null, ''),
        start_date: express_validation_1.Joi.isoDateTz().optional().allow(null),
        key: express_validation_1.Joi.string().allow(null, ''),
    }))
        .optional()
        .allow(null),
};
exports.createEmployee = {
    body: (0, wrap_schema_helper_1.wrapSchema)(express_validation_1.Joi.object(EmployeeBody)),
};
exports.updateEmployee = {
    params: (0, wrap_schema_helper_1.wrapSchema)(express_validation_1.Joi.object({
        id: express_validation_1.Joi.number().required(),
    })),
    body: (0, wrap_schema_helper_1.wrapSchema)(express_validation_1.Joi.object(Object.assign(Object.assign({}, EmployeeBody), { employee_finances_add: express_validation_1.Joi.array().items(express_validation_1.Joi.object(EmployeeFinance)).optional().allow(null), employee_finances_update: express_validation_1.Joi.array().items(express_validation_1.Joi.object(EmployeeFinance)).optional().allow(null), employee_finances_delete: express_validation_1.Joi.array().items(express_validation_1.Joi.number()).optional().default([]), employee_contracts_add: express_validation_1.Joi.array().items(express_validation_1.Joi.object(EmployeeContract)).optional().allow(null), employee_contracts_update: express_validation_1.Joi.array().items(express_validation_1.Joi.object(EmployeeContract)).optional().allow(null), employee_contracts_delete: express_validation_1.Joi.array().items(express_validation_1.Joi.number()).optional().default([]) }))),
};
exports.queryFilter = {
    query: (0, wrap_schema_helper_1.wrapSchema)((0, wrap_schema_helper_1.extendFilterQuery)(common_validator_1.queryFilter.query, {
        isCreateUser: express_validation_1.Joi.boolean().optional().allow('').default(false),
    })),
};
