import { Joi } from 'express-validation';
import express from 'express';
import { StringSchema } from 'joi';
import { TimeAdapter } from '@common/infrastructure/time.adapter';

Joi.isoDateTz = function (): StringSchema {
    const timezone = express.request.userTimezone;
    return Joi.string().custom((value, helpers) => {
        if (!value) return value;

        TimeAdapter.setTimezone(timezone);
        const isoDateString = TimeAdapter.toISOStringUTC(value);
        const dateObj = new Date(isoDateString);

        if (isNaN(dateObj.getTime())) {
            return helpers.error('string.isoDateTimezone', { timezone });
        }

        return isoDateString;
    }, 'ISO Date as JavaScript Date with Timezone');
};
