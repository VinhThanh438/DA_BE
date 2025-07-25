"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.queryFilter = exports.updateEntity = exports.update = exports.create = void 0;
const wrap_schema_helper_1 = require("../../common/helpers/wrap-schema.helper");
const express_validation_1 = require("express-validation");
const lodash_1 = require("lodash");
const app_constant_1 = require("../../config/app.constant");
const common_validator_1 = require("./common.validator");
const common_validator_2 = require("./common.validator");
exports.create = {
    body: (0, wrap_schema_helper_1.wrapSchema)(express_validation_1.Joi.object({
        code: express_validation_1.Joi.string().optional().allow(null, '').max(100),
        tax: express_validation_1.Joi.string().optional().allow(null, '').max(20),
        note: express_validation_1.Joi.string().optional().allow(null, ''),
        time_at: express_validation_1.Joi.isoDateTz().optional().allow(null),
        contract_date: express_validation_1.Joi.isoDateTz().optional().allow(null),
        delivery_date: express_validation_1.Joi.isoDateTz().optional().allow(null),
        partner_id: express_validation_1.Joi.number().required(),
        employee_id: express_validation_1.Joi.number().optional(),
        order_id: express_validation_1.Joi.number().optional(),
        organization_id: express_validation_1.Joi.number().optional(),
        status: express_validation_1.Joi.string()
            .valid(...(0, lodash_1.values)(app_constant_1.ContractStatus))
            .optional()
            .allow(null, ''),
        type: express_validation_1.Joi.string()
            .valid(...(0, lodash_1.values)(app_constant_1.ContractType))
            .optional()
            .allow(null, ''),
        files: express_validation_1.Joi.array().items(express_validation_1.Joi.string()).optional().allow(null, '').default([]),
        details: express_validation_1.Joi.array().items(express_validation_1.Joi.object(common_validator_1.detailsSchema)).optional().default([]),
    })),
};
exports.update = {
    params: (0, wrap_schema_helper_1.wrapSchema)(express_validation_1.Joi.object({
        id: express_validation_1.Joi.number().required(),
    })),
    body: (0, wrap_schema_helper_1.wrapSchema)(express_validation_1.Joi.object({
        code: express_validation_1.Joi.string().optional().allow(null, '').max(100),
        tax: express_validation_1.Joi.string().optional().allow(null, '').max(20),
        note: express_validation_1.Joi.string().optional().allow(null, ''),
        time_at: express_validation_1.Joi.isoDateTz().optional().allow(null),
        delivery_date: express_validation_1.Joi.isoDateTz().optional().allow(null),
        contract_date: express_validation_1.Joi.isoDateTz().optional().allow(null),
        partner_id: express_validation_1.Joi.number().required(),
        employee_id: express_validation_1.Joi.number().optional(),
        order_id: express_validation_1.Joi.number().optional(),
        organization_id: express_validation_1.Joi.number().optional(),
        status: express_validation_1.Joi.string()
            .valid(...(0, lodash_1.values)(app_constant_1.ContractStatus))
            .optional()
            .allow(null, ''),
        files: express_validation_1.Joi.array().items(express_validation_1.Joi.string()).optional().allow(null, '').default([]),
        details: express_validation_1.Joi.array().items(common_validator_1.detailsSchema).optional().default([]),
    })),
};
exports.updateEntity = {
    params: (0, wrap_schema_helper_1.wrapSchema)(express_validation_1.Joi.object({
        id: express_validation_1.Joi.number().required(),
    })),
    body: (0, wrap_schema_helper_1.wrapSchema)(express_validation_1.Joi.object({
        code: express_validation_1.Joi.string().optional().allow(null, '').max(100),
        tax: express_validation_1.Joi.string().optional().allow(null, '').max(20),
        note: express_validation_1.Joi.string().optional().allow(null, ''),
        time_at: express_validation_1.Joi.isoDateTz().optional().allow(null),
        delivery_date: express_validation_1.Joi.isoDateTz().optional().allow(null),
        contract_date: express_validation_1.Joi.isoDateTz().optional().allow(null),
        partner_id: express_validation_1.Joi.number().required(),
        employee_id: express_validation_1.Joi.number().optional(),
        order_id: express_validation_1.Joi.number().optional(),
        organization_id: express_validation_1.Joi.number().optional(),
        status: express_validation_1.Joi.string()
            .valid(...(0, lodash_1.values)(app_constant_1.ContractStatus))
            .optional()
            .allow(null, ''),
        files: express_validation_1.Joi.array().items(express_validation_1.Joi.string()).optional().allow(null, '').default([]),
        add: express_validation_1.Joi.array().items(express_validation_1.Joi.object(common_validator_1.detailsSchema)).optional().default([]),
        update: express_validation_1.Joi.array().items(express_validation_1.Joi.object(common_validator_1.detailsSchema)).optional().default([]),
        delete: express_validation_1.Joi.array().items(express_validation_1.Joi.number()).optional().default([]),
    })),
};
exports.queryFilter = {
    query: (0, wrap_schema_helper_1.wrapSchema)((0, wrap_schema_helper_1.extendFilterQuery)(common_validator_2.queryFilter.query, {
        supplierIds: express_validation_1.Joi.alternatives()
            .try(express_validation_1.Joi.array().items(express_validation_1.Joi.number()), express_validation_1.Joi.string().custom((value, helpers) => {
            if (!value || value === '')
                return null;
            const ids = value.split(',').map((id) => parseInt(id.trim(), 10));
            if (ids.some((id) => isNaN(id))) {
                return helpers.error('any.invalid');
            }
            return ids;
        }))
            .optional()
            .allow(null, ''),
    })),
};
