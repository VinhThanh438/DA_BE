"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.queryFilter = exports.update = exports.create = void 0;
const wrap_schema_helper_1 = require("../../common/helpers/wrap-schema.helper");
const joi_1 = __importDefault(require("joi"));
const lodash_1 = require("lodash");
const app_constant_1 = require("../../config/app.constant");
const common_validator_1 = require("./common.validator");
exports.create = {
    body: (0, wrap_schema_helper_1.wrapSchema)(joi_1.default.object({
        id: joi_1.default.number().optional().allow(null, ''),
        price: joi_1.default.number().optional().allow(null, ''),
        vat: joi_1.default.number().optional().allow(null, ''),
        quantity: joi_1.default.number().optional().allow(null, ''),
        status: joi_1.default.string()
            .valid(...(0, lodash_1.values)(app_constant_1.ShippingPlanStatus))
            .optional()
            .allow(null, ''),
        note: joi_1.default.string().optional().allow(null, ''),
        facility_type: joi_1.default.string().optional().allow(null, ''),
        order_id: joi_1.default.number().optional().allow(null, ''),
        partner_id: joi_1.default.number().optional().allow(null, ''),
    })),
};
exports.update = {
    params: (0, wrap_schema_helper_1.wrapSchema)(joi_1.default.object({
        id: joi_1.default.number().required(),
    })),
    body: exports.create.body,
};
exports.queryFilter = {
    query: (0, wrap_schema_helper_1.wrapSchema)((0, wrap_schema_helper_1.extendFilterQuery)(common_validator_1.queryFilter.query, {
        isDone: joi_1.default.boolean().optional().allow(null, '').default(false),
    })),
};
