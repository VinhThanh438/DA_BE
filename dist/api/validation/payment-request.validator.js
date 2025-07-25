"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.approve = exports.update = exports.create = exports.queryFilter = void 0;
const wrap_schema_helper_1 = require("../../common/helpers/wrap-schema.helper");
const app_constant_1 = require("../../config/app.constant");
const lodash_1 = require("lodash");
const express_validation_1 = require("express-validation");
const common_validator_1 = require("./common.validator");
exports.queryFilter = {
    query: (0, wrap_schema_helper_1.wrapSchema)((0, wrap_schema_helper_1.extendFilterQuery)(common_validator_1.queryFilter.query, {
        type: express_validation_1.Joi.string()
            .optional()
            .valid(...(0, lodash_1.values)(app_constant_1.PaymentRequestType)),
        status: express_validation_1.Joi.string().optional().allow(null, ''),
        partnerId: express_validation_1.Joi.number().optional().allow(null, ''),
        types: express_validation_1.Joi.any(),
    })),
};
exports.create = {
    body: (0, wrap_schema_helper_1.wrapSchema)(express_validation_1.Joi.object({
        code: express_validation_1.Joi.string().max(100).optional(),
        status: express_validation_1.Joi.string()
            .valid(...Object.values(app_constant_1.PaymentRequestStatus))
            .optional(),
        note: express_validation_1.Joi.string().allow(null, '').max(1000).optional(),
        type: express_validation_1.Joi.string()
            .valid(...Object.values(app_constant_1.PaymentRequestType))
            .optional(),
        rejected_reason: express_validation_1.Joi.string().allow(null, '').optional(),
        time_at: express_validation_1.Joi.isoDateTz().optional().allow(null),
        payment_date: express_validation_1.Joi.isoDateTz().optional().allow(null),
        files: express_validation_1.Joi.array().items(express_validation_1.Joi.string()).optional().allow(null, '').default([]),
        employee_id: express_validation_1.Joi.number().optional().allow(null),
        approver_id: express_validation_1.Joi.number().optional().allow(null),
        partner_id: express_validation_1.Joi.number().optional().allow(null),
        bank_id: express_validation_1.Joi.number().optional().allow(null),
        representative_id: express_validation_1.Joi.number().optional().allow(null),
        details: express_validation_1.Joi.array()
            .items(express_validation_1.Joi.object({
            order_id: express_validation_1.Joi.number().optional().allow(null),
            invoice_id: express_validation_1.Joi.number().optional().allow(null),
            loan_id: express_validation_1.Joi.number().optional().allow(null),
            interest_log_id: express_validation_1.Joi.number().optional().allow(null),
            amount: express_validation_1.Joi.number().min(0).optional(),
            note: express_validation_1.Joi.string().allow(null, '').max(500),
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
    body: exports.create.body,
};
exports.approve = {
    params: (0, wrap_schema_helper_1.wrapSchema)(express_validation_1.Joi.object({
        id: express_validation_1.Joi.number().required(),
    })),
    body: (0, wrap_schema_helper_1.wrapSchema)(express_validation_1.Joi.object({
        status: express_validation_1.Joi.string()
            .valid(...(0, lodash_1.values)([app_constant_1.PaymentRequestStatus.REJECTED, app_constant_1.PaymentRequestStatus.CONFIRMED]))
            .required(),
    }).when(express_validation_1.Joi.object({
        status: express_validation_1.Joi.valid(app_constant_1.PaymentRequestStatus.REJECTED),
    }).unknown(), {
        then: express_validation_1.Joi.object({
            rejected_reason: express_validation_1.Joi.string().required(),
        }),
        otherwise: express_validation_1.Joi.object({}),
    })),
};
