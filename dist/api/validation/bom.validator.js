"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.queryFilter = exports.update = exports.create = void 0;
const wrap_schema_helper_1 = require("../../common/helpers/wrap-schema.helper");
const express_validation_1 = require("express-validation");
const common_validator_1 = require("./common.validator");
exports.create = {
    body: (0, wrap_schema_helper_1.wrapSchema)(express_validation_1.Joi.object({
        note: express_validation_1.Joi.string().optional().allow(null, ''),
        product_id: express_validation_1.Joi.number().required(),
        details: express_validation_1.Joi.array().items(express_validation_1.Joi.object({
            material_id: express_validation_1.Joi.number().required(),
            quantity: express_validation_1.Joi.number().required(),
            unit_id: express_validation_1.Joi.number().required(),
            key: express_validation_1.Joi.string().optional().allow(null, ''),
            note: express_validation_1.Joi.string().optional().allow(null, ''),
        })).optional().default([]),
        work_pricings: express_validation_1.Joi.array()
            .items(express_validation_1.Joi.object({
            production_step_id: express_validation_1.Joi.number().required(),
            unit_id: express_validation_1.Joi.number().required(),
            price: express_validation_1.Joi.number().required(),
            key: express_validation_1.Joi.string().optional().allow(null, ''),
            note: express_validation_1.Joi.string().optional().allow(null, ''),
        }))
            .optional()
            .default([]),
    })),
};
exports.update = {
    params: (0, wrap_schema_helper_1.wrapSchema)(express_validation_1.Joi.object({
        id: express_validation_1.Joi.number().required(),
    })),
    body: (0, wrap_schema_helper_1.wrapSchema)(express_validation_1.Joi.object({
        product_id: express_validation_1.Joi.number().required(),
        note: express_validation_1.Joi.string().optional().allow(null, ''),
        add: express_validation_1.Joi.array().items(express_validation_1.Joi.object({
            material_id: express_validation_1.Joi.number().required(),
            quantity: express_validation_1.Joi.number().required(),
            unit_id: express_validation_1.Joi.number().required(),
            key: express_validation_1.Joi.string().optional().allow(null, ''),
            note: express_validation_1.Joi.string().optional().allow(null, ''),
        })),
        update: express_validation_1.Joi.array().items(express_validation_1.Joi.object({
            id: express_validation_1.Joi.number().required(),
            material_id: express_validation_1.Joi.number().required(),
            quantity: express_validation_1.Joi.number().required(),
            unit_id: express_validation_1.Joi.number().required(),
            key: express_validation_1.Joi.string().optional().allow(null, ''),
            note: express_validation_1.Joi.string().optional().allow(null, ''),
        })),
        delete: express_validation_1.Joi.array().items(express_validation_1.Joi.number()).optional().default([]),
        work_pricings_add: express_validation_1.Joi.array().items(express_validation_1.Joi.object({
            production_step_id: express_validation_1.Joi.number().required(),
            unit_id: express_validation_1.Joi.number().required(),
            price: express_validation_1.Joi.number().required(),
            key: express_validation_1.Joi.string().optional().allow(null, ''),
            note: express_validation_1.Joi.string().optional().allow(null, ''),
        })),
        work_pricings_update: express_validation_1.Joi.array().items(express_validation_1.Joi.object({
            id: express_validation_1.Joi.number().required(),
            production_step_id: express_validation_1.Joi.number().required(),
            unit_id: express_validation_1.Joi.number().required(),
            price: express_validation_1.Joi.number().required(),
            key: express_validation_1.Joi.string().optional().allow(null, ''),
            note: express_validation_1.Joi.string().optional().allow(null, ''),
        })),
        work_pricings_delete: express_validation_1.Joi.array().items(express_validation_1.Joi.number()).optional().default([]),
    })),
};
exports.queryFilter = {
    query: (0, wrap_schema_helper_1.wrapSchema)((0, wrap_schema_helper_1.extendFilterQuery)(common_validator_1.queryFilter.query, {})),
};
