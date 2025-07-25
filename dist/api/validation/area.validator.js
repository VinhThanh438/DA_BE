"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.queryFilter = exports.update = exports.create = void 0;
const wrap_schema_helper_1 = require("../../common/helpers/wrap-schema.helper");
const common_validator_1 = require("./common.validator");
const express_validation_1 = require("express-validation");
exports.create = {
    body: (0, wrap_schema_helper_1.wrapSchema)(express_validation_1.Joi.object({
        name: express_validation_1.Joi.string().trim().required().max(255),
        key: express_validation_1.Joi.string().optional().allow(null, '').max(1000),
    })),
};
exports.update = {
    body: (0, wrap_schema_helper_1.wrapSchema)(express_validation_1.Joi.object({
        name: express_validation_1.Joi.string().trim().required().max(255),
        key: express_validation_1.Joi.string().optional().allow(null, '').max(1000),
    })),
    params: (0, wrap_schema_helper_1.wrapSchema)(express_validation_1.Joi.object({
        id: express_validation_1.Joi.number().required(),
    })),
};
exports.queryFilter = {
    query: (0, wrap_schema_helper_1.wrapSchema)((0, wrap_schema_helper_1.extendFilterQuery)(common_validator_1.queryFilter.query, {})),
};
