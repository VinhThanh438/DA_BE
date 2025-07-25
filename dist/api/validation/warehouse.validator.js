"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAndUpdate = void 0;
const wrap_schema_helper_1 = require("../../common/helpers/wrap-schema.helper");
const express_validation_1 = require("express-validation");
exports.createAndUpdate = {
    body: (0, wrap_schema_helper_1.wrapSchema)(express_validation_1.Joi.object({
        name: express_validation_1.Joi.string().required().min(1).max(255),
        code: express_validation_1.Joi.string().optional().allow(null, '').min(1).max(100),
        phone: express_validation_1.Joi.string().optional().allow(null, '').max(20),
        address: express_validation_1.Joi.string().optional().allow(null, '').max(255),
        note: express_validation_1.Joi.string().optional().allow(null, '').max(1000),
        employee_id: express_validation_1.Joi.number().optional().allow(null, ''),
    })),
};
