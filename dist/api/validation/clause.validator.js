"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateClause = exports.createClause = void 0;
const wrap_schema_helper_1 = require("../../common/helpers/wrap-schema.helper");
const joi_1 = __importDefault(require("joi"));
exports.createClause = {
    body: (0, wrap_schema_helper_1.wrapSchema)(joi_1.default.object({
        name: joi_1.default.string().required(),
        content: joi_1.default.string().optional().allow(null, ''),
        max_dept_amount: joi_1.default.number().optional().allow(null),
        max_dept_day: joi_1.default.number().optional().allow(null),
        organization_id: joi_1.default.number().optional().allow(null, ''),
    })),
};
exports.updateClause = {
    body: (0, wrap_schema_helper_1.wrapSchema)(joi_1.default.object({
        name: joi_1.default.string().optional(),
        content: joi_1.default.string().optional().allow(null, ''),
        max_dept_amount: joi_1.default.number().optional().allow(null),
        max_dept_day: joi_1.default.number().optional().allow(null),
        organization_id: joi_1.default.number().optional().allow(null, ''),
    })),
};
