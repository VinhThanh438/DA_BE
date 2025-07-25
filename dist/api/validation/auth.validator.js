"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logIn = void 0;
const wrap_schema_helper_1 = require("../../common/helpers/wrap-schema.helper");
const express_validation_1 = require("express-validation");
exports.logIn = {
    body: (0, wrap_schema_helper_1.wrapSchema)(express_validation_1.Joi.object({
        username: express_validation_1.Joi.string().required().min(1).max(50),
        password: express_validation_1.Joi.string().required().min(6).max(45),
    })),
};
