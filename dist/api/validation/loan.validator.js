"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.queryFilter = exports.update = exports.create = void 0;
const wrap_schema_helper_1 = require("../../common/helpers/wrap-schema.helper");
const common_validator_1 = require("./common.validator");
const express_validation_1 = require("express-validation");
const app_constant_1 = require("../../config/app.constant");
const lodash_1 = require("lodash");
const LoanBody = {
    account_number: express_validation_1.Joi.string().required(),
    disbursement_date: express_validation_1.Joi.isoDateTz().optional().allow(null),
    interest_calculation_date: express_validation_1.Joi.isoDateTz().optional().allow(null),
    payment_day: express_validation_1.Joi.number().optional().allow(null),
    term: express_validation_1.Joi.number().optional().allow(null),
    amount: express_validation_1.Joi.number().optional().allow(null),
    interest_rate: express_validation_1.Joi.number().optional().allow(null),
    current_debt: express_validation_1.Joi.number().optional().allow(null),
    note: express_validation_1.Joi.string().optional().allow(null, ''),
    bank_id: express_validation_1.Joi.number(),
    partner_id: express_validation_1.Joi.number().optional(),
    invoice_id: express_validation_1.Joi.number().optional(),
    order_id: express_validation_1.Joi.number().optional(),
    order: express_validation_1.Joi.object().optional(),
};
exports.create = {
    body: (0, wrap_schema_helper_1.wrapSchema)(express_validation_1.Joi.object(LoanBody)),
};
exports.update = {
    params: (0, wrap_schema_helper_1.wrapSchema)(express_validation_1.Joi.object({
        id: express_validation_1.Joi.number().required(),
    })),
    body: exports.create.body,
};
exports.queryFilter = {
    query: (0, wrap_schema_helper_1.wrapSchema)((0, wrap_schema_helper_1.extendFilterQuery)(common_validator_1.queryFilter.query, {
        status: express_validation_1.Joi.string()
            .optional()
            .valid(...(0, lodash_1.values)(app_constant_1.LoanStatus)),
        bank: express_validation_1.Joi.string().optional().allow(null, ''),
    })),
};
