"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.queryFilter = exports.approve = exports.update = exports.create = void 0;
const wrap_schema_helper_1 = require("../../common/helpers/wrap-schema.helper");
const app_constant_1 = require("../../config/app.constant");
const lodash_1 = require("lodash");
const express_validation_1 = require("express-validation");
const common_validator_1 = require("./common.validator");
exports.create = {
    body: (0, wrap_schema_helper_1.wrapSchema)(express_validation_1.Joi.object({
        code: express_validation_1.Joi.string().max(100).optional(),
        status: express_validation_1.Joi.string()
            .valid(...Object.values(app_constant_1.PurchaseRequestStatus))
            .optional(),
        note: express_validation_1.Joi.string().allow(null, '').max(1000).optional(),
        files: express_validation_1.Joi.array().items(express_validation_1.Joi.string()).optional().allow(null, '').default([]),
        time_at: express_validation_1.Joi.isoDateTz().optional().allow(null),
        employee_id: express_validation_1.Joi.number().optional().allow(null, ''),
        production_id: express_validation_1.Joi.number().optional().allow(null, ''),
        order_id: express_validation_1.Joi.number().optional().allow(null, ''),
        organization_id: express_validation_1.Joi.number().optional().allow(null, ''),
        details: express_validation_1.Joi.array()
            .items(express_validation_1.Joi.object({
            material_id: express_validation_1.Joi.number().required(),
            unit_id: express_validation_1.Joi.number().optional().allow(null, ''),
            quantity: express_validation_1.Joi.number().min(0).required(),
            note: express_validation_1.Joi.string().allow(null, '').max(500),
            key: express_validation_1.Joi.string().allow(null, ''),
        }))
            .required()
            .default([]),
    })),
};
exports.update = {
    params: (0, wrap_schema_helper_1.wrapSchema)(express_validation_1.Joi.object({
        id: express_validation_1.Joi.number().required(),
    })),
    body: (0, wrap_schema_helper_1.wrapSchema)(express_validation_1.Joi.object({
        code: express_validation_1.Joi.string().max(100).optional(),
        status: express_validation_1.Joi.string()
            .valid(...Object.values(app_constant_1.PurchaseRequestStatus))
            .optional(),
        note: express_validation_1.Joi.string().allow(null, '').max(1000).optional(),
        // files: Joi.array().items(Joi.string()).optional().allow(null, '').default([]),
        time_at: express_validation_1.Joi.isoDateTz().optional().allow(null),
        employee_id: express_validation_1.Joi.number().optional(),
        production_id: express_validation_1.Joi.number().optional(),
        order_id: express_validation_1.Joi.number().optional(),
        organization_id: express_validation_1.Joi.number().optional(),
        add: express_validation_1.Joi.array()
            .items(express_validation_1.Joi.object({
            material_id: express_validation_1.Joi.number().optional(),
            unit_id: express_validation_1.Joi.number().optional().allow(null, ''),
            quantity: express_validation_1.Joi.number().min(0).optional(),
            note: express_validation_1.Joi.string().allow(null, '').max(500),
            key: express_validation_1.Joi.string().allow(null, ''),
        }))
            .optional()
            .default([]),
        update: express_validation_1.Joi.array()
            .items(express_validation_1.Joi.object({
            id: express_validation_1.Joi.number().required(),
            material_id: express_validation_1.Joi.number().optional(),
            unit_id: express_validation_1.Joi.number().optional().allow(null, ''),
            quantity: express_validation_1.Joi.number().min(0).optional(),
            note: express_validation_1.Joi.string().allow(null, '').max(500),
            key: express_validation_1.Joi.string().allow(null, ''),
        }))
            .optional()
            .default([]),
        delete: express_validation_1.Joi.array().items(express_validation_1.Joi.number()).optional().default([]),
        files_add: express_validation_1.Joi.array().items(express_validation_1.Joi.string()).optional().allow(null, '').default([]),
        files_delete: express_validation_1.Joi.array().items(express_validation_1.Joi.string()).optional().allow(null, '').default([]),
    })),
};
exports.approve = {
    params: (0, wrap_schema_helper_1.wrapSchema)(express_validation_1.Joi.object({
        id: express_validation_1.Joi.number().required(),
    })),
    body: (0, wrap_schema_helper_1.wrapSchema)(express_validation_1.Joi.object({
        status: express_validation_1.Joi.string()
            .valid(...(0, lodash_1.values)([app_constant_1.PurchaseRequestStatus.REJECTED, app_constant_1.PurchaseRequestStatus.CONFIRMED]))
            .required(),
    }).when(express_validation_1.Joi.object({
        status: express_validation_1.Joi.valid(app_constant_1.PurchaseRequestStatus.REJECTED),
    }).unknown(), {
        then: express_validation_1.Joi.object({
            rejected_reason: express_validation_1.Joi.string().required(),
        }),
        otherwise: express_validation_1.Joi.object({}),
    })),
};
exports.queryFilter = {
    query: (0, wrap_schema_helper_1.wrapSchema)((0, wrap_schema_helper_1.extendFilterQuery)(common_validator_1.queryFilter.query, {
        employeeIds: express_validation_1.Joi.alternatives()
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
