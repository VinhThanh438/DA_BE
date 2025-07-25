"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.update = exports.create = exports.queryFilter = void 0;
const wrap_schema_helper_1 = require("../../common/helpers/wrap-schema.helper");
const app_constant_1 = require("../../config/app.constant");
const express_validation_1 = require("express-validation");
const lodash_1 = require("lodash");
const common_validator_1 = require("./common.validator");
exports.queryFilter = {
    query: (0, wrap_schema_helper_1.wrapSchema)((0, wrap_schema_helper_1.extendFilterQuery)(common_validator_1.queryFilter.query, {
        parentId: express_validation_1.Joi.number().optional().allow(null, ''),
    })),
};
exports.create = {
    body: (0, wrap_schema_helper_1.wrapSchema)(express_validation_1.Joi.object({
        name: express_validation_1.Joi.string().required().min(1).max(300),
        code: express_validation_1.Joi.string().optional().allow(null, '').min(1).max(100),
        logo: express_validation_1.Joi.string().optional().allow(null, ''),
        industry: express_validation_1.Joi.string().optional().allow(null, ''),
        responsibility: express_validation_1.Joi.string().optional().allow(null, '').min(1).max(100),
        establishment: express_validation_1.Joi.string().optional().allow(null, '').min(1).max(500),
        files: express_validation_1.Joi.array().items(express_validation_1.Joi.string()).optional().allow(null, '').default([]),
        type: express_validation_1.Joi.string()
            .required()
            .valid(...(0, lodash_1.values)([app_constant_1.OrganizationType.COMPANY, app_constant_1.OrganizationType.DEPARTMENT, app_constant_1.OrganizationType.BRANCH])),
        parent_id: express_validation_1.Joi.number().required(),
        leader_id: express_validation_1.Joi.number().optional().allow(null, ''),
        address: express_validation_1.Joi.string().optional().allow(null, '').min(1).max(500),
        phone: express_validation_1.Joi.string().optional().allow(null, '').min(1).max(100),
        hotline: express_validation_1.Joi.string().optional().allow(null, '').min(1).max(100),
        email: express_validation_1.Joi.string().optional().allow(null, '').email().min(1).max(100),
        website: express_validation_1.Joi.string().optional().allow(null, '').min(1).max(100),
        tax_code: express_validation_1.Joi.string().optional().allow(null, '').min(1).max(100),
    })),
};
exports.update = {
    params: (0, wrap_schema_helper_1.wrapSchema)(express_validation_1.Joi.object({
        id: express_validation_1.Joi.number().required(),
    })),
    body: (0, wrap_schema_helper_1.wrapSchema)(express_validation_1.Joi.object({
        name: express_validation_1.Joi.string().required().min(1).max(300),
        code: express_validation_1.Joi.string().optional().allow(null, '').min(1).max(100),
        logo: express_validation_1.Joi.string().optional().allow(null, ''),
        industry: express_validation_1.Joi.string().optional().allow(null, ''),
        responsibility: express_validation_1.Joi.string().optional().allow(null, '').min(1).max(100),
        establishment: express_validation_1.Joi.string().optional().allow(null, '').min(1).max(500),
        files: express_validation_1.Joi.array().items(express_validation_1.Joi.string()).optional().allow(null, '').default([]),
        type: express_validation_1.Joi.string()
            .required()
            .valid(...(0, lodash_1.values)([app_constant_1.OrganizationType.COMPANY, app_constant_1.OrganizationType.DEPARTMENT])),
        parent_id: express_validation_1.Joi.number().required(),
        leader_id: express_validation_1.Joi.number().optional().allow(null, ''),
        address: express_validation_1.Joi.string().optional().allow(null, '').min(1).max(500),
        phone: express_validation_1.Joi.string().optional().allow(null, '').min(1).max(100),
        hotline: express_validation_1.Joi.string().optional().allow(null, '').min(1).max(100),
        email: express_validation_1.Joi.string().optional().allow(null, '').email().min(1).max(100),
        website: express_validation_1.Joi.string().optional().allow(null, '').min(1).max(100),
        tax_code: express_validation_1.Joi.string().optional().allow(null, '').min(1).max(100),
    })),
};
