"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.queryFilter = exports.update = exports.create = void 0;
const wrap_schema_helper_1 = require("../../common/helpers/wrap-schema.helper");
const common_validator_1 = require("./common.validator");
const express_validation_1 = require("express-validation");
const meshSchema = {
    code: express_validation_1.Joi.string().optional().allow(null, '').max(1000),
    quantity: express_validation_1.Joi.number().required().min(0),
    width: express_validation_1.Joi.number().required().min(0),
    width_spacing: express_validation_1.Joi.number().required().min(0),
    width_phi: express_validation_1.Joi.number().required().min(0),
    width_left: express_validation_1.Joi.number().required().min(0),
    width_right: express_validation_1.Joi.number().required().min(0),
    length: express_validation_1.Joi.number().required().min(0),
    length_spacing: express_validation_1.Joi.number().required().min(0),
    length_phi: express_validation_1.Joi.number().required().min(0),
    length_left: express_validation_1.Joi.number().required().min(0),
    length_right: express_validation_1.Joi.number().required().min(0),
    product_id: express_validation_1.Joi.number().required(),
    area_id: express_validation_1.Joi.number().optional().allow(null, ''),
    key: express_validation_1.Joi.string().optional().allow(null, '').max(1000),
};
exports.create = {
    body: (0, wrap_schema_helper_1.wrapSchema)(express_validation_1.Joi.object({
        quotation_id: express_validation_1.Joi.number().required(),
        note: express_validation_1.Joi.string().optional().allow(null, '').max(1000),
        details: express_validation_1.Joi.array().items(express_validation_1.Joi.object(meshSchema)).default([]),
        scope_name: express_validation_1.Joi.string().optional().allow(null, '').max(1000),
        quantity_name: express_validation_1.Joi.string().optional().allow(null, '').max(1000),
        length_name: express_validation_1.Joi.string().optional().allow(null, '').max(1000),
        width_name: express_validation_1.Joi.string().optional().allow(null, '').max(1000),
        weight_name: express_validation_1.Joi.string().optional().allow(null, '').max(1000),
        area_name: express_validation_1.Joi.string().optional().allow(null, '').max(1000),
    })),
};
exports.update = {
    body: (0, wrap_schema_helper_1.wrapSchema)(express_validation_1.Joi.object({
        quotation_id: express_validation_1.Joi.number().required(),
        note: express_validation_1.Joi.string().optional().allow(null, '').max(1000),
        add: express_validation_1.Joi.array().items(express_validation_1.Joi.object(meshSchema)).optional().default([]),
        update: express_validation_1.Joi.array()
            .items(express_validation_1.Joi.object(Object.assign(Object.assign({}, meshSchema), { id: express_validation_1.Joi.number().required() })))
            .optional()
            .default([]),
        delete: express_validation_1.Joi.array().items(express_validation_1.Joi.number()).optional().default([]),
        scope_name: express_validation_1.Joi.string().optional().allow(null, '').max(1000),
        quantity_name: express_validation_1.Joi.string().optional().allow(null, '').max(1000),
        length_name: express_validation_1.Joi.string().optional().allow(null, '').max(1000),
        width_name: express_validation_1.Joi.string().optional().allow(null, '').max(1000),
        weight_name: express_validation_1.Joi.string().optional().allow(null, '').max(1000),
        area_name: express_validation_1.Joi.string().optional().allow(null, '').max(1000),
    })),
    params: (0, wrap_schema_helper_1.wrapSchema)(express_validation_1.Joi.object({
        id: express_validation_1.Joi.number().required(),
    })),
};
exports.queryFilter = {
    query: (0, wrap_schema_helper_1.wrapSchema)((0, wrap_schema_helper_1.extendFilterQuery)(common_validator_1.queryFilter.query, {
        hasMesh: express_validation_1.Joi.boolean().optional().allow(null, ''),
    })),
};
