"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.approve = exports.getCode = exports.queryById = exports.queryFilter = exports.detailsSchema = void 0;
const wrap_schema_helper_1 = require("../../common/helpers/wrap-schema.helper");
const app_constant_1 = require("../../config/app.constant");
const express_validation_1 = require("express-validation");
const lodash_1 = require("lodash");
exports.detailsSchema = {
    id: express_validation_1.Joi.number().optional().allow(null, ''),
    product_id: express_validation_1.Joi.number().optional().allow(null, ''),
    unit_id: express_validation_1.Joi.number().optional().allow(null, ''),
    quotation_request_detail_id: express_validation_1.Joi.number().optional().allow(null, ''),
    quantity: express_validation_1.Joi.number().min(0).optional().allow(null, ''),
    price: express_validation_1.Joi.number().min(0).optional().allow(null, ''),
    discount: express_validation_1.Joi.number().min(0).optional().allow('', null).default(0),
    vat: express_validation_1.Joi.number().min(0).optional().allow('', null).default(0),
    commission: express_validation_1.Joi.number().min(0).optional().allow('', null).default(0),
    note: express_validation_1.Joi.string().allow(null, '').max(500),
    key: express_validation_1.Joi.string().allow(null, ''),
};
exports.queryFilter = {
    query: (0, wrap_schema_helper_1.wrapSchema)(express_validation_1.Joi.object({
        page: express_validation_1.Joi.number().optional().min(1),
        size: express_validation_1.Joi.number().optional().min(1),
        startAt: express_validation_1.Joi.isoDateTz().optional().allow(null),
        endAt: express_validation_1.Joi.isoDateTz().optional().allow(null),
        keyword: express_validation_1.Joi.string().optional().allow(null, ''),
        organization_id: express_validation_1.Joi.any().optional().allow(null, ''),
        OR: express_validation_1.Joi.any().optional().allow(null, ''),
        warehouseIds: express_validation_1.Joi.alternatives()
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
        productIds: express_validation_1.Joi.alternatives()
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
exports.queryById = {
    params: (0, wrap_schema_helper_1.wrapSchema)(express_validation_1.Joi.object({
        id: express_validation_1.Joi.number().required(),
    })),
};
exports.getCode = {
    query: (0, wrap_schema_helper_1.wrapSchema)(express_validation_1.Joi.object({
        type: express_validation_1.Joi.string()
            .required()
            .valid(...(0, lodash_1.values)(app_constant_1.CodeType)),
    })),
};
const { CONFIRMED, REJECTED } = app_constant_1.CommonApproveStatus;
exports.approve = {
    params: (0, wrap_schema_helper_1.wrapSchema)(express_validation_1.Joi.object({
        id: express_validation_1.Joi.number().required(),
    })),
    body: (0, wrap_schema_helper_1.wrapSchema)(express_validation_1.Joi.object({
        status: express_validation_1.Joi.string()
            .valid(...Object.values([REJECTED, CONFIRMED]))
            .required(),
        rejected_reason: express_validation_1.Joi.string().when('status', {
            is: express_validation_1.Joi.string().valid(REJECTED),
            then: express_validation_1.Joi.string().min(1).required(),
            otherwise: express_validation_1.Joi.string().allow(null, '').optional(),
        }),
        files: express_validation_1.Joi.array().items(express_validation_1.Joi.string()).optional().allow(null, '').default([]),
    })),
};
