"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAdjustQuantity = exports.updateRealQuantity = exports.report = exports.queryFilter = exports.update = exports.create = void 0;
const wrap_schema_helper_1 = require("../../common/helpers/wrap-schema.helper");
const lodash_1 = require("lodash");
const joi_1 = __importDefault(require("joi"));
const app_constant_1 = require("../../config/app.constant");
const common_validator_1 = require("./common.validator");
exports.create = {
    body: (0, wrap_schema_helper_1.wrapSchema)(joi_1.default.object({
        organization_id: joi_1.default.number().optional().allow(null, ''),
        employee_id: joi_1.default.number().optional().allow(null, ''),
        order_id: joi_1.default.number().optional().allow(null, ''),
        customer_id: joi_1.default.number().optional().allow(null, ''),
        shipping_plan_id: joi_1.default.number().optional().allow(null, ''),
        supplier_id: joi_1.default.number().optional().allow(null, ''),
        delivery_id: joi_1.default.number().optional().allow(null, ''),
        warehouse_id: joi_1.default.number().required(),
        code: joi_1.default.string().optional().allow(null, ''),
        time_at: joi_1.default.isoDateTz().optional().allow(null),
        note: joi_1.default.string().max(500).optional().allow('', null),
        plate: joi_1.default.string().max(20).optional().allow('', null),
        vehicle: joi_1.default.string().optional().allow('', null),
        representative_name: joi_1.default.string().optional().allow('', null),
        identity_code: joi_1.default.string().optional().allow('', null),
        delivery_cost: joi_1.default.number().optional().allow('', null).default(0),
        vat: joi_1.default.number().optional().allow('', null),
        files: joi_1.default.array().items(joi_1.default.string()).optional().allow(null, '').default([]),
        type: joi_1.default.string()
            .valid(...(0, lodash_1.values)(app_constant_1.InventoryType))
            .optional(),
        details: joi_1.default.array()
            .items(joi_1.default.object({
            order_detail_id: joi_1.default.number().required(),
            // product_id: Joi.number().required(),
            real_quantity: joi_1.default.number().min(0).optional(),
            quantity: joi_1.default.number().min(0).optional(),
            price: joi_1.default.number().min(0).optional().allow(null, ''),
            note: joi_1.default.string().allow(null, '').max(500).optional(),
            quantity_adjustment: joi_1.default.number().optional().allow(null, ''),
            kg: joi_1.default.number().optional().allow(null, ''),
            real_kg: joi_1.default.number().optional().allow(null, ''),
            key: joi_1.default.string().allow(null, ''),
            order_detail: joi_1.default.object().optional(),
        }))
            .optional()
            .default([]),
        order_detail: joi_1.default.object().optional().allow(null, ''),
    })),
};
exports.update = {
    params: (0, wrap_schema_helper_1.wrapSchema)(joi_1.default.object({
        id: joi_1.default.number().required(),
    })),
    body: (0, wrap_schema_helper_1.wrapSchema)(joi_1.default.object({
        organization_id: joi_1.default.number().optional().allow(null, ''),
        employee_id: joi_1.default.number().optional().allow(null, ''),
        order_id: joi_1.default.number().optional().allow(null, ''),
        customer_id: joi_1.default.number().optional().allow(null, ''),
        shipping_plan_id: joi_1.default.number().optional().allow(null, ''),
        supplier_id: joi_1.default.number().optional().allow(null, ''),
        delivery_id: joi_1.default.number().optional().allow(null, ''),
        warehouse_id: joi_1.default.number().optional(),
        code: joi_1.default.string().optional().allow(null, ''),
        time_at: joi_1.default.isoDateTz().optional().allow(null),
        note: joi_1.default.string().max(500).optional().allow('', null),
        plate: joi_1.default.string().max(20).optional().allow('', null),
        vehicle: joi_1.default.string().optional().allow('', null),
        representative_name: joi_1.default.string().optional().allow('', null),
        identity_code: joi_1.default.string().optional().allow('', null),
        delivery_cost: joi_1.default.number().optional().allow('', null).default(0),
        type: joi_1.default.string()
            .valid(...(0, lodash_1.values)(app_constant_1.InventoryType))
            .optional(),
        files_add: joi_1.default.array().items(joi_1.default.string()).optional().allow(null, '').default([]),
        files_delete: joi_1.default.array().items(joi_1.default.string()).optional().allow(null, '').default([]),
        add: joi_1.default.array()
            .items(joi_1.default.object({
            order_detail_id: joi_1.default.number().required(),
            real_quantity: joi_1.default.number().min(0).required(),
            quantity_adjustment: joi_1.default.number().optional().allow(null, ''),
            kg: joi_1.default.number().optional().allow(null, ''),
            real_kg: joi_1.default.number().optional().allow(null, ''),
            note: joi_1.default.string().allow(null, '').max(500),
            key: joi_1.default.string().allow(null, ''),
            order_detail: joi_1.default.object().optional(),
        }))
            .optional()
            .default([]),
        update: joi_1.default.array()
            .items(joi_1.default.object({
            id: joi_1.default.number().required(),
            // order_detail_id: Joi.number().required(),
            real_quantity: joi_1.default.number().min(0).required(),
            quantity_adjustment: joi_1.default.number().optional().allow(null, ''),
            kg: joi_1.default.number().optional().allow(null, ''),
            real_kg: joi_1.default.number().optional().allow(null, ''),
            note: joi_1.default.string().allow(null, '').max(500),
            key: joi_1.default.string().allow(null, ''),
            order_detail: joi_1.default.object().optional(),
        }))
            .optional()
            .default([]),
        delete: joi_1.default.array().items(joi_1.default.number()).optional().default([]),
    })),
};
exports.queryFilter = {
    query: (0, wrap_schema_helper_1.wrapSchema)((0, wrap_schema_helper_1.extendFilterQuery)(common_validator_1.queryFilter.query, {
        type: joi_1.default.string()
            .valid(...(0, lodash_1.values)(app_constant_1.InventoryType))
            .optional()
            .allow(null, ''),
        supplierIds: joi_1.default.alternatives()
            .try(joi_1.default.array().items(joi_1.default.number()), joi_1.default.string().custom((value, helpers) => {
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
        deliveryIds: joi_1.default.alternatives()
            .try(joi_1.default.array().items(joi_1.default.number()), joi_1.default.string().custom((value, helpers) => {
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
exports.report = {
    query: (0, wrap_schema_helper_1.wrapSchema)((0, wrap_schema_helper_1.extendFilterQuery)(common_validator_1.queryFilter.query, {
        warehouseIds: joi_1.default.alternatives()
            .try(joi_1.default.array().items(joi_1.default.number()), joi_1.default.string().custom((value, helpers) => {
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
        productIds: joi_1.default.alternatives()
            .try(joi_1.default.array().items(joi_1.default.number()), joi_1.default.string().custom((value, helpers) => {
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
exports.updateRealQuantity = {
    params: (0, wrap_schema_helper_1.wrapSchema)(joi_1.default.object({
        id: joi_1.default.number().required(),
    })),
    body: (0, wrap_schema_helper_1.wrapSchema)(joi_1.default.object({
        files: joi_1.default.array().items(joi_1.default.string()).optional().allow(null, '').default([]),
        details: joi_1.default.array()
            .items(joi_1.default.object({
            id: joi_1.default.number().min(0).required(),
            real_quantity: joi_1.default.number().min(0).required(),
            price: joi_1.default.number().min(0).optional().allow(null, ''),
            note: joi_1.default.string().allow(null, '').max(500).optional(),
            key: joi_1.default.string().allow(null, ''),
        }))
            .optional()
            .default([]),
    })),
};
exports.updateAdjustQuantity = {
    params: (0, wrap_schema_helper_1.wrapSchema)(joi_1.default.object({
        id: joi_1.default.number().required(),
    })),
    body: (0, wrap_schema_helper_1.wrapSchema)(joi_1.default.object({
        files: joi_1.default.array().items(joi_1.default.string()).optional().allow(null, '').default([]),
        details: joi_1.default.array()
            .items(joi_1.default.object({
            id: joi_1.default.number().min(0).required(),
            quantity_adjustment: joi_1.default.number().required(),
            note: joi_1.default.string().allow(null, '').max(500).optional(),
            key: joi_1.default.string().allow(null, ''),
        }))
            .optional()
            .default([]),
    })),
};
