"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.queryFilter = exports.updateProductGroup = exports.createProductGroup = exports.updateProduct = exports.createProduct = void 0;
const wrap_schema_helper_1 = require("../../common/helpers/wrap-schema.helper");
const common_validator_1 = require("./common.validator");
const app_constant_1 = require("../../config/app.constant");
const express_validation_1 = require("express-validation");
const lodash_1 = require("lodash");
exports.createProduct = {
    body: (0, wrap_schema_helper_1.wrapSchema)(express_validation_1.Joi.object({
        name: express_validation_1.Joi.string().trim().required().max(255),
        code: express_validation_1.Joi.string().trim().required().max(100),
        vat: express_validation_1.Joi.number().optional().allow('', null).min(0).max(100),
        packing_standard: express_validation_1.Joi.string().allow('', null).optional().max(255),
        current_price: express_validation_1.Joi.number().optional().min(0).allow('', null),
        note: express_validation_1.Joi.string().allow('', null).max(1000),
        image: express_validation_1.Joi.string().allow('', null).max(250),
        unit_id: express_validation_1.Joi.number().integer().min(1).required(),
        type: express_validation_1.Joi.string()
            .valid(...(0, lodash_1.values)(app_constant_1.ProductType))
            .optional()
            .allow(null, ''),
        extra_units: express_validation_1.Joi.array()
            .items(express_validation_1.Joi.object({
            unit_id: express_validation_1.Joi.number().integer().min(1).required(),
            conversion_rate: express_validation_1.Joi.number().integer().min(1).required(),
            key: express_validation_1.Joi.string().allow(null, ''),
        }))
            // .min(1)
            .optional(),
        product_group_id: express_validation_1.Joi.number().integer().min(1).optional(),
        is_public: express_validation_1.Joi.boolean().optional().default(false),
        // details: Joi.array().items(createProductDetailSchema).optional().default([]),
    })),
};
exports.updateProduct = {
    body: (0, wrap_schema_helper_1.wrapSchema)(express_validation_1.Joi.object({
        name: express_validation_1.Joi.string().trim().optional().max(255),
        code: express_validation_1.Joi.string().trim().optional().max(100),
        vat: express_validation_1.Joi.number().optional().allow('', null).min(0).max(100),
        packing_standard: express_validation_1.Joi.string().allow('', null).optional().max(255),
        current_price: express_validation_1.Joi.number().optional().min(0).allow('', null),
        note: express_validation_1.Joi.string().allow('', null).optional().max(1000),
        image: express_validation_1.Joi.string().allow('', null).max(250),
        type: express_validation_1.Joi.string()
            .valid(...(0, lodash_1.values)(app_constant_1.ProductType))
            .optional()
            .allow(null, ''),
        is_public: express_validation_1.Joi.boolean().optional().default(false),
        unit_id: express_validation_1.Joi.number().integer().optional().min(1),
        product_group_id: express_validation_1.Joi.number().integer().optional().min(1),
        add: express_validation_1.Joi.array()
            .items(express_validation_1.Joi.object({
            unit_id: express_validation_1.Joi.number().integer().min(1).required(),
            conversion_rate: express_validation_1.Joi.number().integer().min(1).required(),
            key: express_validation_1.Joi.string().allow(null, ''),
        }))
            // .min(1)
            .optional(),
        update: express_validation_1.Joi.array()
            .items(express_validation_1.Joi.object({
            unit_id: express_validation_1.Joi.number().integer().min(1).required(),
            conversion_rate: express_validation_1.Joi.number().integer().min(1).required(),
            key: express_validation_1.Joi.string().allow(null, ''),
        }))
            // .min(1)
            .optional(),
        delete: express_validation_1.Joi.array().items(express_validation_1.Joi.object({
            unit_id: express_validation_1.Joi.number().integer().min(1).required(),
            key: express_validation_1.Joi.string().allow(null, ''),
        })),
        // chi tiết lưới
        // details_add: Joi.array().items(createProductDetailSchema).optional().default([]),
        // details_update: Joi.array().items(updateProductDetailSchema).optional().default([]),
        // details_delete: Joi.array().items(Joi.number()).optional().default([])
    })),
    params: (0, wrap_schema_helper_1.wrapSchema)(express_validation_1.Joi.object({
        id: express_validation_1.Joi.number().required(),
    })),
};
exports.createProductGroup = {
    body: (0, wrap_schema_helper_1.wrapSchema)(express_validation_1.Joi.object({
        name: express_validation_1.Joi.string().trim().required().max(255),
        type: express_validation_1.Joi.string()
            .valid(...(0, lodash_1.values)(app_constant_1.ProductType))
            .optional()
            .allow(null, ''),
    })),
};
exports.updateProductGroup = {
    body: (0, wrap_schema_helper_1.wrapSchema)(express_validation_1.Joi.object({
        name: express_validation_1.Joi.string().trim().optional().max(255),
        type: express_validation_1.Joi.string()
            .valid(...(0, lodash_1.values)(app_constant_1.ProductType))
            .optional()
            .allow(null, ''),
    })),
    params: (0, wrap_schema_helper_1.wrapSchema)(express_validation_1.Joi.object({
        id: express_validation_1.Joi.number().required(),
    })),
};
exports.queryFilter = {
    query: (0, wrap_schema_helper_1.wrapSchema)((0, wrap_schema_helper_1.extendFilterQuery)(common_validator_1.queryFilter.query, {
        type: express_validation_1.Joi.string()
            .valid(...(0, lodash_1.values)(app_constant_1.ProductType))
            .optional()
            .allow(null, ''),
        unitId: express_validation_1.Joi.number().optional().allow(null, ''),
        hasMesh: express_validation_1.Joi.boolean().optional().allow(null, ''),
        warehouseId: express_validation_1.Joi.number().optional().allow(null, ''),
    })),
};
