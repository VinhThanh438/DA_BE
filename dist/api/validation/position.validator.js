"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.update = exports.create = void 0;
const wrap_schema_helper_1 = require("../../common/helpers/wrap-schema.helper");
const express_validation_1 = require("express-validation");
exports.create = {
    body: (0, wrap_schema_helper_1.wrapSchema)(express_validation_1.Joi.object({
        name: express_validation_1.Joi.string().required().min(1).max(300),
        level: express_validation_1.Joi.string().optional().allow('', null).max(150),
        description: express_validation_1.Joi.string().optional().allow('', null).max(500),
    })),
};
exports.update = {
    params: (0, wrap_schema_helper_1.wrapSchema)(express_validation_1.Joi.object({
        id: express_validation_1.Joi.number().required(),
    })),
    body: (0, wrap_schema_helper_1.wrapSchema)(express_validation_1.Joi.object({
        name: express_validation_1.Joi.string().required().min(1).max(300),
        level: express_validation_1.Joi.string().optional().allow('', null).max(150),
        description: express_validation_1.Joi.string().optional().allow('', null).max(500),
    })),
};
