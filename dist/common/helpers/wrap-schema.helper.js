"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extendFilterQuery = exports.wrapSchema = void 0;
const wrapSchema = (schema) => schema.options({
    abortEarly: false,
    allowUnknown: true,
    stripUnknown: true,
});
exports.wrapSchema = wrapSchema;
const extendFilterQuery = (base, extension) => base.keys(extension);
exports.extendFilterQuery = extendFilterQuery;
