"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformDecimal = void 0;
const app_constant_1 = require("../../config/app.constant");
const client_1 = require("@prisma/client");
const transformDecimal = (data) => {
    if (data === null || data === undefined)
        return data;
    if (data instanceof Date)
        return data;
    if (data instanceof client_1.Prisma.Decimal || (data === null || data === void 0 ? void 0 : data._hex) !== undefined) {
        return Number(data.toString());
    }
    if (Array.isArray(data)) {
        return data.map((item) => (0, exports.transformDecimal)(item));
    }
    if (typeof data === 'object' && !Buffer.isBuffer(data)) {
        const transformed = Object.assign({}, data);
        for (const key in transformed) {
            if (!Object.prototype.hasOwnProperty.call(transformed, key))
                continue;
            const value = transformed[key];
            if (value instanceof client_1.Prisma.Decimal ||
                (value === null || value === void 0 ? void 0 : value._hex) !== undefined ||
                typeof value === 'string' ||
                typeof value === 'number') {
                if (app_constant_1.DECIMAL_KEYS.includes(key)) {
                    transformed[key] = Number(value);
                }
                else {
                    transformed[key] = (0, exports.transformDecimal)(value);
                }
            }
            else {
                transformed[key] = (0, exports.transformDecimal)(value);
            }
        }
        return transformed;
    }
    return data;
};
exports.transformDecimal = transformDecimal;
