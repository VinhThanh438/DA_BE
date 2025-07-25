"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.update = exports.queryFilter = exports.create = void 0;
const wrap_schema_helper_1 = require("../../common/helpers/wrap-schema.helper");
const lodash_1 = require("lodash");
const express_validation_1 = require("express-validation");
const app_constant_1 = require("../../config/app.constant");
const common_validator_1 = require("./common.validator");
exports.create = {
    body: (0, wrap_schema_helper_1.wrapSchema)(express_validation_1.Joi.object({
        name: express_validation_1.Joi.string().required().max(250),
        type: express_validation_1.Joi.string()
            .required()
            .valid(...(0, lodash_1.values)(app_constant_1.PartnerType)),
    })),
};
exports.queryFilter = {
    query: (0, wrap_schema_helper_1.wrapSchema)((0, wrap_schema_helper_1.extendFilterQuery)(common_validator_1.queryFilter.query, {
        type: express_validation_1.Joi.string()
            .optional().allow(null, '')
            .valid(...(0, lodash_1.values)(app_constant_1.PartnerType)),
    })),
};
exports.update = {
    params: (0, wrap_schema_helper_1.wrapSchema)(express_validation_1.Joi.object({
        id: express_validation_1.Joi.number().required(),
    })),
    body: exports.create.body
};
