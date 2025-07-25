"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.queryDebtFilter = void 0;
const wrap_schema_helper_1 = require("../../common/helpers/wrap-schema.helper");
const app_constant_1 = require("../../config/app.constant");
const lodash_1 = require("lodash");
const common_validator_1 = require("./common.validator");
const joi_1 = __importDefault(require("joi"));
exports.queryDebtFilter = {
    query: (0, wrap_schema_helper_1.wrapSchema)((0, wrap_schema_helper_1.extendFilterQuery)(common_validator_1.queryFilter.query, {
        type: joi_1.default.string()
            .valid(...(0, lodash_1.values)(app_constant_1.DeptType))
            .optional()
            .allow(null, ''),
        representativeId: joi_1.default.number().required(),
    })),
};
