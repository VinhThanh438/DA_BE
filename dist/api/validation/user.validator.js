"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserById = exports.filterUser = exports.updateUser = exports.createUser = void 0;
const wrap_schema_helper_1 = require("../../common/helpers/wrap-schema.helper");
const express_validation_1 = require("express-validation");
exports.createUser = {
    body: (0, wrap_schema_helper_1.wrapSchema)(express_validation_1.Joi.object({
        username: express_validation_1.Joi.string().required().min(1).max(50),
        password: express_validation_1.Joi.string().required().min(6).max(45),
        email: express_validation_1.Joi.string().optional().allow(null, '').min(6).max(45),
        employee_id: express_validation_1.Joi.number().required(),
        user_roles: express_validation_1.Joi.array()
            .items(express_validation_1.Joi.object({
            role_id: express_validation_1.Joi.number().required(),
            organization_id: express_validation_1.Joi.number().required(),
            key: express_validation_1.Joi.string().allow(null, '').optional(),
        }))
            .optional()
            .default([]),
    })),
};
exports.updateUser = {
    params: express_validation_1.Joi.object({
        id: express_validation_1.Joi.number().required(),
    }),
    body: (0, wrap_schema_helper_1.wrapSchema)(express_validation_1.Joi.object({
        username: express_validation_1.Joi.string().required().min(1).max(50),
        password: express_validation_1.Joi.string().optional().min(6).max(45),
        email: express_validation_1.Joi.string().optional().allow(null, '').min(6).max(45),
        employee_id: express_validation_1.Joi.number().required(),
        user_roles: express_validation_1.Joi.array()
            .items(express_validation_1.Joi.object({
            role_id: express_validation_1.Joi.number().optional(),
            organization_id: express_validation_1.Joi.number().optional(),
            key: express_validation_1.Joi.string().allow(null, '').optional(),
        }))
            .optional()
            .default([]),
    })),
};
exports.filterUser = {
    query: (0, wrap_schema_helper_1.wrapSchema)(express_validation_1.Joi.object({
        page: express_validation_1.Joi.number().optional().min(1).default(1),
        size: express_validation_1.Joi.number().optional().min(1).default(10),
        // keyword: Joi.string().optional().allow(null, ''),
    })),
};
exports.getUserById = {
    params: express_validation_1.Joi.object({
        id: express_validation_1.Joi.number().required(),
    }),
};
