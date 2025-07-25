"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connect = exports.assign = exports.update = exports.queryFilter = void 0;
const wrap_schema_helper_1 = require("../../common/helpers/wrap-schema.helper");
const express_validation_1 = require("express-validation");
const common_validator_1 = require("./common.validator");
exports.queryFilter = {
    query: (0, wrap_schema_helper_1.wrapSchema)((0, wrap_schema_helper_1.extendFilterQuery)(common_validator_1.queryFilter.query, {
        employee_id: express_validation_1.Joi.number().optional(),
        plate: express_validation_1.Joi.string().optional().allow(null, ''),
        childrenId: express_validation_1.Joi.number().optional(),
    })),
};
exports.update = {
    params: (0, wrap_schema_helper_1.wrapSchema)(express_validation_1.Joi.object({
        id: express_validation_1.Joi.number().required(),
    })),
    body: (0, wrap_schema_helper_1.wrapSchema)(express_validation_1.Joi.object({
        time_at: express_validation_1.Joi.isoDateTz().optional(),
        entry_time: express_validation_1.Joi.isoDateTz().optional(),
        exit_time: express_validation_1.Joi.isoDateTz().optional(),
        entry_note: express_validation_1.Joi.string().allow(null, '').max(1000).optional(),
        exit_note: express_validation_1.Joi.string().allow(null, '').max(1000).optional(),
        entry_plate_images: express_validation_1.Joi.array().items(express_validation_1.Joi.string()).optional().allow(null, ''),
        entry_container_images: express_validation_1.Joi.array().items(express_validation_1.Joi.string()).optional().allow(null, ''),
        exit_plate_images: express_validation_1.Joi.array().items(express_validation_1.Joi.string()).optional().allow(null, ''),
        exit_container_images: express_validation_1.Joi.array().items(express_validation_1.Joi.string()).optional().allow(null, ''),
        employee_id: express_validation_1.Joi.number().optional(),
    })),
};
exports.assign = {
    params: (0, wrap_schema_helper_1.wrapSchema)(express_validation_1.Joi.object({
        id: express_validation_1.Joi.number().required(),
    })),
    body: (0, wrap_schema_helper_1.wrapSchema)(express_validation_1.Joi.object({
        employee_id: express_validation_1.Joi.number().required(),
        note: express_validation_1.Joi.string().allow(null, '').max(1000).optional(),
    })),
};
exports.connect = {
    body: (0, wrap_schema_helper_1.wrapSchema)(express_validation_1.Joi.object({
        children_id: express_validation_1.Joi.number().required(),
        parent_id: express_validation_1.Joi.number().required(),
    })),
};
