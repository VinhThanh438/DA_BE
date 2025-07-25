"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.queryFilter = exports.update = exports.create = void 0;
const wrap_schema_helper_1 = require("../../common/helpers/wrap-schema.helper");
const express_validation_1 = require("express-validation");
const lodash_1 = require("lodash");
const app_constant_1 = require("../../config/app.constant");
const common_validator_1 = require("./common.validator");
const quotation_validator_1 = require("./quotation.validator");
const InvoiceDetail = {
    id: express_validation_1.Joi.number().optional().min(1),
    key: express_validation_1.Joi.string().allow(null, ''),
    order_detail_id: express_validation_1.Joi.number().required(),
    note: express_validation_1.Joi.string().optional().allow(null, ''),
};
exports.create = {
    body: (0, wrap_schema_helper_1.wrapSchema)(express_validation_1.Joi.object({
        code: express_validation_1.Joi.string().optional().allow(null, '').max(100),
        time_at: express_validation_1.Joi.isoDateTz().optional().allow(null),
        invoice_date: express_validation_1.Joi.isoDateTz().optional().allow(null),
        files: express_validation_1.Joi.array().items(express_validation_1.Joi.string()).optional().allow(null, '').default([]),
        note: express_validation_1.Joi.string().optional().allow(null, ''),
        organization_id: express_validation_1.Joi.number().optional().allow(null),
        order_id: express_validation_1.Joi.number().optional().allow(null),
        shipping_plan_id: express_validation_1.Joi.number().optional().allow(null),
        facility_id: express_validation_1.Joi.number().optional().allow(null),
        type: express_validation_1.Joi.string()
            .valid(...(0, lodash_1.values)(app_constant_1.InvoiceType))
            .optional()
            .allow(null, ''),
        details: express_validation_1.Joi.array().items(express_validation_1.Joi.object(InvoiceDetail)).optional().default([]),
        facility_orders: express_validation_1.Joi.array().items(express_validation_1.Joi.object(quotation_validator_1.FacilityOrderBody)).optional(),
    })),
};
exports.update = {
    params: (0, wrap_schema_helper_1.wrapSchema)(express_validation_1.Joi.object({
        id: express_validation_1.Joi.number().required(),
    })),
    body: (0, wrap_schema_helper_1.wrapSchema)(express_validation_1.Joi.object({
        code: express_validation_1.Joi.string().optional().allow(null, '').max(100),
        time_at: express_validation_1.Joi.isoDateTz().optional().allow(null),
        invoice_date: express_validation_1.Joi.isoDateTz().optional().allow(null),
        note: express_validation_1.Joi.string().optional().allow(null, ''),
        files: express_validation_1.Joi.array().items(express_validation_1.Joi.string()).optional().allow(null, '').default([]),
        partner_id: express_validation_1.Joi.number().optional().allow(null),
        employee_id: express_validation_1.Joi.number().optional().allow(null),
        bank_id: express_validation_1.Joi.number().optional().allow(null),
        contract_id: express_validation_1.Joi.number().optional().allow(null),
        organization_id: express_validation_1.Joi.number().optional().allow(null),
        order_id: express_validation_1.Joi.number().optional().allow(null),
        shipping_plan_id: express_validation_1.Joi.number().optional().allow(null),
        // add: Joi.array().items(Joi.object(InvoiceDetai)).optional().default([]),
        // update: Joi.array().items(Joi.object(InvoiceDetai)).optional().default([]),
        delete: express_validation_1.Joi.array().items(express_validation_1.Joi.number()).optional().default([]),
    })),
};
exports.queryFilter = {
    query: (0, wrap_schema_helper_1.wrapSchema)((0, wrap_schema_helper_1.extendFilterQuery)(common_validator_1.queryFilter.query, {
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
        type: express_validation_1.Joi.string()
            .valid(...(0, lodash_1.values)(app_constant_1.InvoiceType))
            .optional(),
    })),
};
