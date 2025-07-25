"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_validation_1 = require("express-validation");
const express_1 = __importDefault(require("express"));
const time_adapter_1 = require("../infrastructure/time.adapter");
express_validation_1.Joi.isoDateTz = function () {
    const timezone = express_1.default.request.userTimezone;
    return express_validation_1.Joi.string().custom((value, helpers) => {
        if (!value)
            return value;
        time_adapter_1.TimeAdapter.setTimezone(timezone);
        const isoDateString = time_adapter_1.TimeAdapter.toISOStringUTC(value);
        const dateObj = new Date(isoDateString);
        if (isNaN(dateObj.getTime())) {
            return helpers.error('string.isoDateTimezone', { timezone });
        }
        return isoDateString;
    }, 'ISO Date as JavaScript Date with Timezone');
};
