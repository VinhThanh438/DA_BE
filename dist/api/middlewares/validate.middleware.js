"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequest = void 0;
const express_validation_1 = require("express-validation");
/**
 * Middleware for automatically configuring validation to simplify usage
 * @param schema Joi schema to validate
 */
const validateRequest = (schema) => (0, express_validation_1.validate)(schema, {
    context: true,
    // keyByField: true,
});
exports.validateRequest = validateRequest;
