"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.approveQuotationRequest = exports.queryFilter = exports.update = exports.create = void 0;
const wrap_schema_helper_1 = require("../../common/helpers/wrap-schema.helper");
const express_validation_1 = require("express-validation");
const lodash_1 = require("lodash");
const app_constant_1 = require("../../config/app.constant");
const common_validator_1 = require("./common.validator");
exports.create = {
    body: (0, wrap_schema_helper_1.wrapSchema)(express_validation_1.Joi.object({
        partner_id: express_validation_1.Joi.number().optional().allow(null, '').default(null),
        organization_name: express_validation_1.Joi.string().required().min(1).max(250),
        tax: express_validation_1.Joi.string().allow(null, '').max(100),
        code: express_validation_1.Joi.string().allow(null, '').max(100),
        requester_name: express_validation_1.Joi.string().required().min(1).max(250),
        phone: express_validation_1.Joi.string().allow(null, '').max(20),
        address: express_validation_1.Joi.string().allow(null, '').max(500),
        email: express_validation_1.Joi.string().allow(null, '').max(500),
        note: express_validation_1.Joi.string().allow(null, '').max(1000),
        files: express_validation_1.Joi.array().items(express_validation_1.Joi.string()).optional().allow(null, '').default([]),
        details: express_validation_1.Joi.array()
            .items(express_validation_1.Joi.object({
            product_id: express_validation_1.Joi.number().required(),
            unit_id: express_validation_1.Joi.number().required(),
            quantity: express_validation_1.Joi.number().min(0).required(),
            note: express_validation_1.Joi.string().allow(null, '').max(500),
            key: express_validation_1.Joi.string().allow(null, ''),
        }))
            .required()
            .min(1)
            .default([]),
    })),
};
exports.update = {
    params: (0, wrap_schema_helper_1.wrapSchema)(express_validation_1.Joi.object({
        id: express_validation_1.Joi.number().required(),
    })),
    body: (0, wrap_schema_helper_1.wrapSchema)(express_validation_1.Joi.object({
        organization_name: express_validation_1.Joi.string().required().min(1).max(250),
        tax: express_validation_1.Joi.string().allow(null, '').max(100),
        code: express_validation_1.Joi.string().allow(null, '').max(100),
        requester_name: express_validation_1.Joi.string().required().min(1).max(250),
        phone: express_validation_1.Joi.string().allow(null, '').max(20),
        address: express_validation_1.Joi.string().allow(null, '').max(500),
        note: express_validation_1.Joi.string().allow(null, '').max(1000),
        email: express_validation_1.Joi.string().allow(null, '').max(500),
        files: express_validation_1.Joi.array().items(express_validation_1.Joi.string()).optional().allow(null, '').default([]),
        details: express_validation_1.Joi.array()
            .items(express_validation_1.Joi.object({
            product_id: express_validation_1.Joi.number().required(),
            unit_id: express_validation_1.Joi.number().required(),
            quantity: express_validation_1.Joi.number().min(0).required(),
            note: express_validation_1.Joi.string().allow(null, '').max(500),
            key: express_validation_1.Joi.string().allow(null, ''),
        }))
            .optional()
            .default([]),
        add: express_validation_1.Joi.array()
            .items(express_validation_1.Joi.object({
            product_id: express_validation_1.Joi.number().required(),
            unit_id: express_validation_1.Joi.number().required(),
            quantity: express_validation_1.Joi.number().min(0).required(),
            note: express_validation_1.Joi.string().allow(null, '').max(500),
            key: express_validation_1.Joi.string().allow(null, ''),
        }))
            .optional()
            .default([]),
        update: express_validation_1.Joi.array()
            .items(express_validation_1.Joi.object({
            id: express_validation_1.Joi.number().required(),
            product_id: express_validation_1.Joi.number().required(),
            unit_id: express_validation_1.Joi.number().required(),
            quantity: express_validation_1.Joi.number().min(0).required(),
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
exports.queryFilter = {
    query: (0, wrap_schema_helper_1.wrapSchema)((0, wrap_schema_helper_1.extendFilterQuery)(common_validator_1.queryFilter.query, {
        type: express_validation_1.Joi.string()
            .valid(...(0, lodash_1.values)(app_constant_1.QuotationRequestType))
            .optional()
            .allow(null, ''),
        status: express_validation_1.Joi.string().optional().allow(null, ''),
    })),
};
const { CONFIRMED, CUSTOMER_PENDING, REJECTED, CUSTOMER_REJECTED } = app_constant_1.CommonApproveStatus;
exports.approveQuotationRequest = {
    params: (0, wrap_schema_helper_1.wrapSchema)(express_validation_1.Joi.object({
        id: express_validation_1.Joi.number().required(),
    })),
    body: (0, wrap_schema_helper_1.wrapSchema)(express_validation_1.Joi.object({
        status: express_validation_1.Joi.string()
            .valid(...Object.values([REJECTED, CONFIRMED, CUSTOMER_PENDING, CUSTOMER_REJECTED]))
            .required(),
        rejected_reason: express_validation_1.Joi.string().when('status', {
            is: express_validation_1.Joi.string().valid(REJECTED, CUSTOMER_REJECTED),
            then: express_validation_1.Joi.string().min(1).required(),
            otherwise: express_validation_1.Joi.string().allow(null, '').optional(),
        }),
        files: express_validation_1.Joi.array().items(express_validation_1.Joi.string()).optional().allow(null, '').default([]),
        employee_id: express_validation_1.Joi.number().when('status', {
            is: CONFIRMED,
            then: express_validation_1.Joi.number().required(),
            otherwise: express_validation_1.Joi.number().optional().allow(null, '').default(null),
        }),
        is_save: express_validation_1.Joi.boolean().optional().default(false),
    })),
};
