"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseArrayQuery = void 0;
const parseArrayQuery = (query) => {
    try {
        if (!query)
            return [];
        if (Array.isArray(query))
            return query.map((item) => (isNaN(Number(item)) ? item : Number(item)));
        return JSON.parse(query.toString()).map((item) => (isNaN(Number(item)) ? item : Number(item)));
    }
    catch (_a) {
        return [];
    }
};
exports.parseArrayQuery = parseArrayQuery;
