"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.queryFilter = exports.update = exports.create = void 0;
const wrap_schema_helper_1 = require("../../common/helpers/wrap-schema.helper");
const express_validation_1 = require("express-validation");
const lodash_1 = require("lodash");
const app_constant_1 = require("../../config/app.constant");
const common_validator_1 = require("./common.validator");
exports.create = {
    body: (0, wrap_schema_helper_1.wrapSchema)(express_validation_1.Joi.object({
        type: express_validation_1.Joi.string()
            .valid(...(0, lodash_1.values)(app_constant_1.OrderType))
            .required(),
        code: express_validation_1.Joi.string().max(100).optional(),
        address: express_validation_1.Joi.string().allow(null, '').max(500).optional(),
        phone: express_validation_1.Joi.string().allow(null, '').max(50).optional(),
        payment_method: express_validation_1.Joi.string().allow(null, '').max(255).optional(),
        note: express_validation_1.Joi.string().allow(null, '').max(1000).optional(),
        tolerance: express_validation_1.Joi.number().required(),
        time_at: express_validation_1.Joi.isoDateTz().optional(),
        files: express_validation_1.Joi.array().items(express_validation_1.Joi.string()).optional().allow(null, '').default([]),
        product_quality: express_validation_1.Joi.string().allow(null, '').max(500).optional(),
        delivery_location: express_validation_1.Joi.string().allow(null, '').max(500).optional(),
        delivery_method: express_validation_1.Joi.string().allow(null, '').max(255).optional(),
        delivery_time: express_validation_1.Joi.string().allow(null, '').max(255).optional(),
        payment_note: express_validation_1.Joi.string().allow(null, '').max(500).optional(),
        additional_note: express_validation_1.Joi.string().allow(null, '').max(500).optional(),
        detail_note: express_validation_1.Joi.string().allow(null, '').max(500).optional(),
        employee_id: express_validation_1.Joi.number().optional(),
        partner_id: express_validation_1.Joi.number().optional(),
        representative_id: express_validation_1.Joi.number().optional(),
        bank_id: express_validation_1.Joi.number().optional(),
        details: express_validation_1.Joi.array()
            .items(express_validation_1.Joi.object({
            product_id: express_validation_1.Joi.number().required(),
            unit_id: express_validation_1.Joi.number().optional().allow(null, ''),
            quantity: express_validation_1.Joi.number().min(0).required(),
            discount: express_validation_1.Joi.number().min(0).optional(),
            commission: express_validation_1.Joi.number().min(0).optional(),
            price: express_validation_1.Joi.number().min(0).required(),
            vat: express_validation_1.Joi.number().min(0).optional().allow('', null),
            note: express_validation_1.Joi.string().allow(null, '').max(500),
            key: express_validation_1.Joi.string().allow(null, ''),
        }))
            .optional()
            .default([]),
        shipping_plans: express_validation_1.Joi.array()
            .items(express_validation_1.Joi.object({
            partner_id: express_validation_1.Joi.number().required(),
            quantity: express_validation_1.Joi.number().min(0).optional(),
            price: express_validation_1.Joi.number().min(0).optional(),
            note: express_validation_1.Joi.string().allow(null, '').max(500),
            key: express_validation_1.Joi.string().allow(null, ''),
            vat: express_validation_1.Joi.number().optional().allow('', null),
        }))
            .optional()
            .default([]),
        unloading_costs: express_validation_1.Joi.array()
            .items(express_validation_1.Joi.object({
            price: express_validation_1.Joi.number().min(0).required(),
            quantity: express_validation_1.Joi.number().min(0).required(),
            vat: express_validation_1.Joi.number().min(0).optional().allow('', null),
            note: express_validation_1.Joi.string().allow(null, '').max(500).optional(),
            files: express_validation_1.Joi.array().items(express_validation_1.Joi.string()).optional().allow(null, '').default([]),
            key: express_validation_1.Joi.string().allow(null, ''),
        }))
            .optional()
            .default([]),
    })),
};
exports.update = {
    params: (0, wrap_schema_helper_1.wrapSchema)(express_validation_1.Joi.object({
        id: express_validation_1.Joi.number().required(),
    })),
    body: (0, wrap_schema_helper_1.wrapSchema)(express_validation_1.Joi.object({
        type: express_validation_1.Joi.string()
            .valid(...(0, lodash_1.values)(app_constant_1.OrderType))
            .required(),
        code: express_validation_1.Joi.string().max(100).optional(),
        address: express_validation_1.Joi.string().allow(null, '').max(500).optional(),
        phone: express_validation_1.Joi.string().allow(null, '').max(50).optional(),
        payment_method: express_validation_1.Joi.string().allow(null, '').max(255).optional(),
        note: express_validation_1.Joi.string().allow(null, '').max(1000).optional(),
        tolerance: express_validation_1.Joi.number().optional(),
        time_at: express_validation_1.Joi.isoDateTz().optional(),
        files: express_validation_1.Joi.array().items(express_validation_1.Joi.string()).optional().allow(null, '').default([]),
        product_quality: express_validation_1.Joi.string().allow(null, '').max(500).optional(),
        delivery_location: express_validation_1.Joi.string().allow(null, '').max(500).optional(),
        delivery_method: express_validation_1.Joi.string().allow(null, '').max(255).optional(),
        delivery_time: express_validation_1.Joi.string().allow(null, '').max(255).optional(),
        payment_note: express_validation_1.Joi.string().allow(null, '').max(500).optional(),
        additional_note: express_validation_1.Joi.string().allow(null, '').max(500).optional(),
        detail_note: express_validation_1.Joi.string().allow(null, '').max(500).optional(),
        employee_id: express_validation_1.Joi.number().optional(),
        partner_id: express_validation_1.Joi.number().optional(),
        representative_id: express_validation_1.Joi.number().optional(),
        bank_id: express_validation_1.Joi.number().optional(),
        details: express_validation_1.Joi.array()
            .items(express_validation_1.Joi.object({
            product_id: express_validation_1.Joi.number().required(),
            unit_id: express_validation_1.Joi.number().optional().allow(null, ''),
            quantity: express_validation_1.Joi.number().min(0).required(),
            discount: express_validation_1.Joi.number().min(0).optional(),
            price: express_validation_1.Joi.number().min(0).required(),
            vat: express_validation_1.Joi.number().min(0).optional().allow('', null),
            note: express_validation_1.Joi.string().allow(null, '').max(500),
            key: express_validation_1.Joi.string().allow(null, ''),
        }))
            .optional()
            .default([]),
        add: express_validation_1.Joi.array()
            .items(express_validation_1.Joi.object({
            product_id: express_validation_1.Joi.number().required(),
            unit_id: express_validation_1.Joi.number().optional().allow(null, ''),
            quantity: express_validation_1.Joi.number().min(0).required(),
            discount: express_validation_1.Joi.number().min(0).optional(),
            commission: express_validation_1.Joi.number().min(0).optional(),
            price: express_validation_1.Joi.number().min(0).required(),
            vat: express_validation_1.Joi.number().min(0).optional().allow('', null),
            note: express_validation_1.Joi.string().allow(null, '').max(500),
            key: express_validation_1.Joi.string().allow(null, ''),
        }))
            .optional()
            .default([]),
        update: express_validation_1.Joi.array()
            .items(express_validation_1.Joi.object({
            id: express_validation_1.Joi.number().required(),
            product_id: express_validation_1.Joi.number().required(),
            unit_id: express_validation_1.Joi.number().optional().allow(null, ''),
            quantity: express_validation_1.Joi.number().min(0).required(),
            discount: express_validation_1.Joi.number().min(0).optional(),
            commission: express_validation_1.Joi.number().min(0).optional(),
            price: express_validation_1.Joi.number().min(0).required(),
            vat: express_validation_1.Joi.number().min(0).optional().allow('', null),
            note: express_validation_1.Joi.string().allow(null, '').max(500),
            key: express_validation_1.Joi.string().allow(null, ''),
        }))
            .optional()
            .default([]),
        delete: express_validation_1.Joi.array().items(express_validation_1.Joi.number()).optional().default([]),
        files_add: express_validation_1.Joi.array().items(express_validation_1.Joi.string()).optional().allow(null, '').default([]),
        files_delete: express_validation_1.Joi.array().items(express_validation_1.Joi.string()).optional().allow(null, '').default([]),
        shipping_plans_add: express_validation_1.Joi.array()
            .items(express_validation_1.Joi.object({
            partner_id: express_validation_1.Joi.number().optional(),
            quantity: express_validation_1.Joi.number().min(0).optional(),
            price: express_validation_1.Joi.number().min(0).optional(),
            note: express_validation_1.Joi.string().allow(null, '').max(500),
            key: express_validation_1.Joi.string().allow(null, ''),
        }))
            .optional()
            .default([]),
        shipping_plans_update: express_validation_1.Joi.array()
            .items(express_validation_1.Joi.object({
            id: express_validation_1.Joi.number().required(),
            partner_id: express_validation_1.Joi.number().optional(),
            quantity: express_validation_1.Joi.number().min(0).optional(),
            price: express_validation_1.Joi.number().min(0).optional(),
            note: express_validation_1.Joi.string().allow(null, '').max(500),
            key: express_validation_1.Joi.string().allow(null, ''),
        }))
            .optional()
            .default([]),
        shipping_plans_delete: express_validation_1.Joi.array().items(express_validation_1.Joi.number()).optional().default([]),
        unloading_costs_add: express_validation_1.Joi.array()
            .items(express_validation_1.Joi.object({
            price: express_validation_1.Joi.number().min(0).required(),
            quantity: express_validation_1.Joi.number().min(0).required(),
            vat: express_validation_1.Joi.number().min(0).optional().allow('', null),
            note: express_validation_1.Joi.string().allow(null, '').max(500).optional(),
            files: express_validation_1.Joi.array().items(express_validation_1.Joi.string()).optional().allow(null, '').default([]),
            key: express_validation_1.Joi.string().allow(null, ''),
        }))
            .optional()
            .default([]),
        unloading_costs_update: express_validation_1.Joi.array()
            .items(express_validation_1.Joi.object({
            id: express_validation_1.Joi.number().required(),
            price: express_validation_1.Joi.number().min(0).required(),
            quantity: express_validation_1.Joi.number().min(0).required(),
            vat: express_validation_1.Joi.number().min(0).optional().allow('', null),
            note: express_validation_1.Joi.string().allow(null, '').max(500).optional(),
            files: express_validation_1.Joi.array().items(express_validation_1.Joi.string()).optional().allow(null, '').default([]),
            key: express_validation_1.Joi.string().allow(null, ''),
        }))
            .optional()
            .default([]),
        unloading_costs_delete: express_validation_1.Joi.array().items(express_validation_1.Joi.number()).optional().default([]),
    })),
};
exports.queryFilter = {
    query: (0, wrap_schema_helper_1.wrapSchema)((0, wrap_schema_helper_1.extendFilterQuery)(common_validator_1.queryFilter.query, {
        type: express_validation_1.Joi.string()
            .valid(...(0, lodash_1.values)(app_constant_1.OrderType))
            .optional()
            .allow(null, ''),
        types: express_validation_1.Joi.alternatives()
            .try(express_validation_1.Joi.array().items(express_validation_1.Joi.string().valid(...(0, lodash_1.values)(app_constant_1.OrderType))), express_validation_1.Joi.string().custom((value, helpers) => {
            if (!value || value === '')
                return null;
            const types = value.split(',').map((type) => type.trim());
            if (types.some((type) => !(0, lodash_1.values)(app_constant_1.OrderType).includes(type))) {
                return helpers.error('any.invalid');
            }
            return types;
        }))
            .optional()
            .allow(null, ''),
        status: express_validation_1.Joi.string().optional().allow(null, ''),
        partner_id: express_validation_1.Joi.number().optional(),
        isDone: express_validation_1.Joi.boolean().optional().allow(null),
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
