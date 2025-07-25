"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transferSchema = exports.fundBalance = exports.queryFilter = exports.update = exports.create = void 0;
const wrap_schema_helper_1 = require("../../common/helpers/wrap-schema.helper");
const express_validation_1 = require("express-validation");
const common_validator_1 = require("./common.validator");
const lodash_1 = require("lodash");
const app_constant_1 = require("../../config/app.constant");
const zod_1 = require("zod");
exports.create = {
    body: (0, wrap_schema_helper_1.wrapSchema)(express_validation_1.Joi.object({
        bank: express_validation_1.Joi.string().required(),
        account_number: express_validation_1.Joi.string().optional().allow(null, ''),
        name: express_validation_1.Joi.string().optional().allow(null, ''),
        description: express_validation_1.Joi.string().optional().allow(null, ''),
        code: express_validation_1.Joi.string().optional().allow(null, ''),
        balance: express_validation_1.Joi.number().optional().allow(null),
        type: express_validation_1.Joi.string()
            .valid(...(0, lodash_1.values)(app_constant_1.BankType))
            .optional()
            .allow(null, ''),
        partner_id: express_validation_1.Joi.number().optional().allow(null),
        organization_id: express_validation_1.Joi.number().optional().allow(null),
    })),
};
exports.update = {
    body: (0, wrap_schema_helper_1.wrapSchema)(express_validation_1.Joi.object({
        bank: express_validation_1.Joi.string().optional(),
        account_number: express_validation_1.Joi.string().optional().allow(null, ''),
        name: express_validation_1.Joi.string().optional(),
        description: express_validation_1.Joi.string().optional().allow(null, ''),
        code: express_validation_1.Joi.string().optional().allow(null, ''),
        balance: express_validation_1.Joi.number().optional().allow(null),
        type: express_validation_1.Joi.string()
            .valid(...(0, lodash_1.values)(app_constant_1.BankType))
            .optional()
            .allow(null, ''),
        partner_id: express_validation_1.Joi.number().optional().allow(null),
        organization_id: express_validation_1.Joi.number().optional().allow(null),
    })),
};
exports.queryFilter = {
    query: (0, wrap_schema_helper_1.wrapSchema)((0, wrap_schema_helper_1.extendFilterQuery)(common_validator_1.queryFilter.query, {
        type: express_validation_1.Joi.string()
            .valid(...(0, lodash_1.values)(app_constant_1.BankType))
            .optional()
            .allow(null, ''),
        partnerId: express_validation_1.Joi.number().optional().allow(null, ''),
    })),
};
exports.fundBalance = {
    params: (0, wrap_schema_helper_1.wrapSchema)(express_validation_1.Joi.object({
        id: express_validation_1.Joi.number().required(),
    })),
    query: (0, wrap_schema_helper_1.wrapSchema)((0, wrap_schema_helper_1.extendFilterQuery)(common_validator_1.queryFilter.query, {})),
};
exports.transferSchema = zod_1.z.object({
    bank_id: zod_1.z.number(),
    amount: zod_1.z.number(),
    time_at: zod_1.z.isoDateTz(),
    file: zod_1.z.string().optional().nullable(),
    note: zod_1.z.string().optional().nullable(),
    organization_id: zod_1.z.number().optional(),
});
