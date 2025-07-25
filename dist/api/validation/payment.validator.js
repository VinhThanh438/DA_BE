"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.close = exports.update = exports.create = exports.queryFilter = void 0;
const wrap_schema_helper_1 = require("../../common/helpers/wrap-schema.helper");
const app_constant_1 = require("../../config/app.constant");
const lodash_1 = require("lodash");
const express_validation_1 = require("express-validation");
const common_validator_1 = require("./common.validator");
exports.queryFilter = {
    query: (0, wrap_schema_helper_1.wrapSchema)((0, wrap_schema_helper_1.extendFilterQuery)(common_validator_1.queryFilter.query, {
        type: express_validation_1.Joi.string()
            .valid(...(0, lodash_1.values)(app_constant_1.PaymentRequestType))
            .optional(),
        status: express_validation_1.Joi.string()
            .valid(...(0, lodash_1.values)(app_constant_1.PaymentRequestStatus))
            .optional(),
        bankId: express_validation_1.Joi.number().optional(),
    })),
};
exports.create = {
    body: (0, wrap_schema_helper_1.wrapSchema)(express_validation_1.Joi.object({
        code: express_validation_1.Joi.string().max(100).optional(),
        type: express_validation_1.Joi.string()
            .valid(...Object.values(app_constant_1.PaymentType))
            .required(),
        note: express_validation_1.Joi.string().allow(null, '').max(1000).optional(),
        time_at: express_validation_1.Joi.isoDateTz().optional().allow(null),
        payment_date: express_validation_1.Joi.isoDateTz().required(),
        files: express_validation_1.Joi.array().items(express_validation_1.Joi.string()).optional().allow(null, '').default([]),
        category: express_validation_1.Joi.string().allow(null, '').optional(),
        payment_request_detail_id: express_validation_1.Joi.number().positive().optional(),
        order_id: express_validation_1.Joi.number().optional(),
        invoice_id: express_validation_1.Joi.number().optional(),
        partner_id: express_validation_1.Joi.number().optional(),
        interest_log_id: express_validation_1.Joi.number().optional(),
        loan_id: express_validation_1.Joi.number().optional(),
        bank_id: express_validation_1.Joi.number().optional(),
        amount: express_validation_1.Joi.number().optional(),
        description: express_validation_1.Joi.string().allow(null, '').optional(),
        payment_method: express_validation_1.Joi.string().allow(null, '').optional(),
        counterparty: express_validation_1.Joi.string().allow(null, '').optional(),
        attached_documents: express_validation_1.Joi.string().allow(null, '').optional(),
    })),
};
exports.update = {
    params: (0, wrap_schema_helper_1.wrapSchema)(express_validation_1.Joi.object({
        id: express_validation_1.Joi.number().positive().required(),
    })),
    body: (0, wrap_schema_helper_1.wrapSchema)(express_validation_1.Joi.object({
        code: express_validation_1.Joi.string().max(100).optional(),
        type: express_validation_1.Joi.string()
            .valid(...Object.values(app_constant_1.PaymentType))
            .optional(),
        note: express_validation_1.Joi.string().allow(null, '').max(1000).optional(),
        time_at: express_validation_1.Joi.isoDateTz().optional().allow(null),
        payment_date: express_validation_1.Joi.isoDateTz().optional().allow(null),
        files_add: express_validation_1.Joi.array().items(express_validation_1.Joi.string()).optional().default([]),
        files_delete: express_validation_1.Joi.array().items(express_validation_1.Joi.string()).optional().default([]),
        order_id: express_validation_1.Joi.number().optional(),
        invoice_id: express_validation_1.Joi.number().optional(),
        partner_id: express_validation_1.Joi.number().optional(),
        bank_id: express_validation_1.Joi.number().optional(),
        amount: express_validation_1.Joi.number().min(0).optional(),
        description: express_validation_1.Joi.string().allow(null, '').optional(),
        payment_method: express_validation_1.Joi.string().allow(null, '').optional(),
        counterparty: express_validation_1.Joi.string().allow(null, '').optional(),
        // payment_type: Joi.string()
        //     .valid(...Object.values(PaymentType))
        //     .optional(),
        attached_documents: express_validation_1.Joi.string().allow(null, '').optional(),
    })),
};
exports.close = {
    query: (0, wrap_schema_helper_1.wrapSchema)((0, wrap_schema_helper_1.extendFilterQuery)(common_validator_1.queryFilter.query, {
        bankId: express_validation_1.Joi.number().required(),
    })),
};
