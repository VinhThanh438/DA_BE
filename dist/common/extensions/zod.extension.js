"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const zod_1 = require("zod");
const time_adapter_1 = require("../infrastructure/time.adapter");
const express_1 = __importDefault(require("express"));
function isoDateTz() {
    return zod_1.z
        .string()
        .refine((value) => {
        var _a;
        if (!value)
            return true;
        try {
            const tz = ((_a = express_1.default.request) === null || _a === void 0 ? void 0 : _a.userTimezone) || time_adapter_1.TimeAdapter.getTimezone();
            time_adapter_1.TimeAdapter.setTimezone(tz);
            const isoDateString = time_adapter_1.TimeAdapter.toISOStringUTC(value);
            const dateObj = new Date(isoDateString);
            return !isNaN(dateObj.getTime());
        }
        catch (_b) {
            return false;
        }
    }, { message: 'Invalid date or timezone' })
        .transform((value) => {
        var _a;
        const tz = ((_a = express_1.default.request) === null || _a === void 0 ? void 0 : _a.userTimezone) || time_adapter_1.TimeAdapter.getTimezone();
        time_adapter_1.TimeAdapter.setTimezone(tz);
        return time_adapter_1.TimeAdapter.toISOStringUTC(value);
    });
}
zod_1.z.isoDateTz = isoDateTz;
