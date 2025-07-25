"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.queryFilter = void 0;
const app_constant_1 = require("../../config/app.constant");
const common_validator_1 = require("./common.validator");
const wrap_schema_helper_1 = require("../../common/helpers/wrap-schema.helper");
const lodash_1 = require("lodash");
const joi_1 = __importDefault(require("joi"));
exports.queryFilter = {
    query: (0, wrap_schema_helper_1.wrapSchema)((0, wrap_schema_helper_1.extendFilterQuery)(common_validator_1.queryFilter.query, {
        status: joi_1.default.string()
            .optional()
            .valid(...(0, lodash_1.values)(app_constant_1.PaymentRequestDetailStatus))
            .allow(null),
        paymentMethod: joi_1.default.string()
            .optional()
            .valid(...(0, lodash_1.values)(app_constant_1.PaymentMethod))
            .allow(null, ''),
    })),
};
