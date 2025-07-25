"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.queryFilter = exports.update = exports.create = exports.queryByConditions = exports.queryDebtFilter = void 0;
const wrap_schema_helper_1 = require("../../common/helpers/wrap-schema.helper");
const lodash_1 = require("lodash");
const express_validation_1 = require("express-validation");
const app_constant_1 = require("../../config/app.constant");
const common_validator_1 = require("./common.validator");
exports.queryDebtFilter = {
    query: (0, wrap_schema_helper_1.wrapSchema)((0, wrap_schema_helper_1.extendFilterQuery)(common_validator_1.queryFilter.query, {
        partnerId: express_validation_1.Joi.number().required(),
        type: express_validation_1.Joi.string()
            .optional()
            .valid(...(0, lodash_1.values)(app_constant_1.PartnerType)),
    })),
};
exports.queryByConditions = {
    query: (0, wrap_schema_helper_1.wrapSchema)(express_validation_1.Joi.object({
        tax: express_validation_1.Joi.string().optional(),
    })),
};
const PartnerBody = {
    id: express_validation_1.Joi.number().optional().allow(null, ''),
    code: express_validation_1.Joi.string().optional(),
    name: express_validation_1.Joi.string().optional().allow(null, ''),
    phone: express_validation_1.Joi.string().optional().allow(null, '').max(20),
    note: express_validation_1.Joi.string().optional().allow(null, '').max(500),
    tax: express_validation_1.Joi.string().optional().allow(null, '').max(50),
    address: express_validation_1.Joi.string().optional().allow(null, '').max(500),
    representative_name: express_validation_1.Joi.string().optional().allow(null, ''),
    representative_phone: express_validation_1.Joi.string().optional().allow(null, '').min(10).max(15),
    representative_email: express_validation_1.Joi.string().optional().allow(null, ''),
    representative_position: express_validation_1.Joi.string().optional().allow(null, ''),
    type: express_validation_1.Joi.string()
        .valid(...(0, lodash_1.values)(app_constant_1.PartnerType))
        .optional(),
    clause_id: express_validation_1.Joi.number().optional().allow(null),
    employee_id: express_validation_1.Joi.number().optional().allow(null),
    partner_group_id: express_validation_1.Joi.number().optional().allow(null),
};
const BankBody = {
    bank: express_validation_1.Joi.string().optional().allow(null, ''),
    account_number: express_validation_1.Joi.string().optional().allow(null, ''),
    name: express_validation_1.Joi.string()
        .optional()
        .allow(null, '')
        .pattern(/^[A-Z\s]+$/),
    branch: express_validation_1.Joi.string().optional().allow(null, ''),
    responsibility: express_validation_1.Joi.string().optional().allow(null, ''),
    partner_id: express_validation_1.Joi.number().optional().allow(null, ''), // This is optional for bank creation
};
const RepresentativeBody = {
    id: express_validation_1.Joi.number().optional().allow(null, ''),
    name: express_validation_1.Joi.string().optional().allow(null, ''),
    phone: express_validation_1.Joi.string().optional().allow(null, '').min(10).max(15),
    title: express_validation_1.Joi.string().optional().allow(null, ''),
    email: express_validation_1.Joi.string().optional().allow(null, ''),
    salutation: express_validation_1.Joi.string().optional().allow(null, ''),
    key: express_validation_1.Joi.string().allow(null, ''),
    banks: express_validation_1.Joi.array()
        .items(express_validation_1.Joi.object({
        bank: express_validation_1.Joi.string().optional().allow(null, ''),
        account_number: express_validation_1.Joi.string().optional().allow(null, ''),
        name: express_validation_1.Joi.string()
            .optional()
            .allow(null, '')
            .pattern(/^[A-Z\s]+$/),
        branch: express_validation_1.Joi.string().optional().allow(null, ''),
        responsibility: express_validation_1.Joi.string().optional().allow(null, ''),
    }))
        .optional()
        .allow(null),
};
exports.create = {
    body: (0, wrap_schema_helper_1.wrapSchema)(express_validation_1.Joi.object(Object.assign(Object.assign({}, PartnerBody), { representatives: express_validation_1.Joi.array().items(express_validation_1.Joi.object(RepresentativeBody)).optional().allow(null), banks: express_validation_1.Joi.array().items(express_validation_1.Joi.object(BankBody)).optional().allow(null) }))),
};
exports.update = {
    body: (0, wrap_schema_helper_1.wrapSchema)(express_validation_1.Joi.object(Object.assign(Object.assign({}, PartnerBody), { add: express_validation_1.Joi.array().items(express_validation_1.Joi.object(RepresentativeBody)).optional().allow(null), update: express_validation_1.Joi.array().items(express_validation_1.Joi.object(RepresentativeBody)).optional().allow(null), delete: express_validation_1.Joi.array().items(express_validation_1.Joi.number()).optional().default([]), banks_add: express_validation_1.Joi.array().items(express_validation_1.Joi.object(BankBody)).optional().allow(null), banks_update: express_validation_1.Joi.array().items(express_validation_1.Joi.object(BankBody)).optional().allow(null), banks_delete: express_validation_1.Joi.array().items(express_validation_1.Joi.number()).optional().default([]) }))),
};
exports.queryFilter = {
    query: (0, wrap_schema_helper_1.wrapSchema)((0, wrap_schema_helper_1.extendFilterQuery)(common_validator_1.queryFilter.query, {
        type: express_validation_1.Joi.string()
            .optional()
            .valid(...(0, lodash_1.values)(app_constant_1.PartnerType)),
        isCommission: express_validation_1.Joi.boolean().optional(),
        types: express_validation_1.Joi.array().items(express_validation_1.Joi.string()).optional().default([]),
    })),
};
