"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePermission = exports.update = exports.create = void 0;
const wrap_schema_helper_1 = require("../../common/helpers/wrap-schema.helper");
const lib_1 = __importDefault(require("joi/lib"));
exports.create = {
    body: (0, wrap_schema_helper_1.wrapSchema)(lib_1.default.object({
        name: lib_1.default.string().trim().required().max(255),
    })),
};
exports.update = {
    body: (0, wrap_schema_helper_1.wrapSchema)(lib_1.default.object({
        name: lib_1.default.string().trim().optional().max(255),
    })),
    params: (0, wrap_schema_helper_1.wrapSchema)(lib_1.default.object({
        id: lib_1.default.number().required(),
    })),
};
exports.updatePermission = {
    body: (0, wrap_schema_helper_1.wrapSchema)(lib_1.default.object({
        permissions: lib_1.default.object().optional(),
    })),
    params: (0, wrap_schema_helper_1.wrapSchema)(lib_1.default.object({
        id: lib_1.default.number().required(),
    })),
};
