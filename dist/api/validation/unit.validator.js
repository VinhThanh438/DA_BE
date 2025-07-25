"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUnit = exports.createUnit = void 0;
const wrap_schema_helper_1 = require("../../common/helpers/wrap-schema.helper");
const lib_1 = __importDefault(require("joi/lib"));
exports.createUnit = {
    body: (0, wrap_schema_helper_1.wrapSchema)(lib_1.default.object({
        name: lib_1.default.string().trim().required().max(255),
    })),
};
exports.updateUnit = {
    body: (0, wrap_schema_helper_1.wrapSchema)(lib_1.default.object({
        name: lib_1.default.string().trim().optional().max(255),
        is_default: lib_1.default.boolean().optional(),
    })),
    params: (0, wrap_schema_helper_1.wrapSchema)(lib_1.default.object({
        id: lib_1.default.number().required(),
    })),
};
