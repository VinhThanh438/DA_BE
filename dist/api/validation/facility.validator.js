"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.update = exports.create = exports.queryFilter = exports.updateFacilitySchema = exports.createFacilitySchema = void 0;
const wrap_schema_helper_1 = require("../../common/helpers/wrap-schema.helper");
const express_validation_1 = require("express-validation");
const common_validator_1 = require("./common.validator");
exports.createFacilitySchema = express_validation_1.Joi.object({
    name: express_validation_1.Joi.string().required().max(255),
    price: express_validation_1.Joi.number().required().min(0),
    code: express_validation_1.Joi.string().required().max(100),
    vat: express_validation_1.Joi.number().required().min(0).max(100),
    commission: express_validation_1.Joi.number().optional().allow(null, '').min(0).max(100),
    image: express_validation_1.Joi.string().optional().allow(null, '').max(500),
    note: express_validation_1.Joi.string().optional().allow(null, '').max(1000),
    unit_id: express_validation_1.Joi.number().required(),
    partner_id: express_validation_1.Joi.number().optional().allow(null, ''),
    key: express_validation_1.Joi.string().optional().allow(null, '').max(1000),
});
exports.updateFacilitySchema = express_validation_1.Joi.object({
    name: express_validation_1.Joi.string().optional().max(255),
    price: express_validation_1.Joi.number().optional().min(0),
    code: express_validation_1.Joi.string().optional().max(100),
    vat: express_validation_1.Joi.number().optional().min(0).max(100),
    image: express_validation_1.Joi.string().optional().allow(null, '').max(500),
    note: express_validation_1.Joi.string().optional().allow(null, '').max(1000),
    unit_id: express_validation_1.Joi.number().optional(),
    partner_id: express_validation_1.Joi.number().optional().allow(null, ''),
    key: express_validation_1.Joi.string().optional().allow(null, '').max(1000),
});
exports.queryFilter = {
    query: (0, wrap_schema_helper_1.wrapSchema)((0, wrap_schema_helper_1.extendFilterQuery)(common_validator_1.queryFilter.query, {})),
};
exports.create = {
    body: (0, wrap_schema_helper_1.wrapSchema)(exports.createFacilitySchema),
};
exports.update = {
    params: (0, wrap_schema_helper_1.wrapSchema)(express_validation_1.Joi.object({
        id: express_validation_1.Joi.number().required(),
    })),
    body: (0, wrap_schema_helper_1.wrapSchema)(exports.updateFacilitySchema),
};
