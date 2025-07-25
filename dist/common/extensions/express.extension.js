"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const errors_1 = require("../errors");
const request_ip_1 = __importDefault(require("request-ip"));
/**
 * Extends the Express Response object by adding a custom `sendJson` method.
 * This method is designed to standardize the JSON response format for consistency
 * across the application, ensuring that all responses follow a consistent structure.
 *
 * The response will always include the following properties:
 * - `error_code`: A standard error code (0 for success).
 * - `status_code`: The HTTP status code (200 for success).
 * - `message`: A custom message or a default message ('OK').
 * - `data`: The actual response data (could be an array or an object).
 * - `pagination`: Pagination details, if applicable (included when the data has a `pagination` field).
 *
 * If the `data` object contains both `data` and `pagination` fields, the response will include both.
 * If only a single data object or array is provided, it will be returned directly as `data`.
 *
 * @param {object | any[]} [data] - The data to be sent in the response.
 *     It can be an object, an array, or an object that includes both `data` and `pagination` fields.
 * @returns {Response} The Express response object with the standardized JSON structure.
 */
express_1.default.response.sendJson = function (data) {
    const isArray = Array.isArray(data);
    const isObject = typeof data === 'object' && data !== null && !isArray;
    const isPrimitive = typeof data === 'string' || typeof data === 'number' || typeof data === 'boolean';
    if (isObject &&
        data.data &&
        data.pagination) {
        const response = {
            errorCode: 0,
            statusCode: errors_1.StatusCode.SUCCESS,
            message: (data === null || data === void 0 ? void 0 : data.message) || 'OK',
            data: data.data,
            pagination: data.pagination,
        };
        if (data.summary) {
            response.summary = data.summary;
        }
        if (data.boms) {
            response.boms = data.boms;
        }
        return this.json(response);
    }
    return this.json(Object.assign({ errorCode: 0, statusCode: errors_1.StatusCode.SUCCESS, message: (isObject && (data === null || data === void 0 ? void 0 : data.message)) || 'OK' }, (isArray ? { data } : isObject ? { data } : isPrimitive ? { data } : {})));
};
/**
 * Extends the Express Request object with a `getRequestInfo` method.
 * This method extracts useful metadata from the request, such as the client IP and User-Agent.
 *
 * @returns {IRequestInfo} An object containing request metadata.
 */
express_1.default.request.getRequestInfo = function () {
    var _a;
    return {
        ip: (_a = request_ip_1.default.getClientIp(this)) !== null && _a !== void 0 ? _a : undefined,
        ua: this.header('User-Agent') || undefined,
        device: this.query.deviceId || undefined,
    };
};
