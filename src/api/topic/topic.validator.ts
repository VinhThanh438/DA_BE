import { Joi, schema } from 'express-validation';
import { values } from 'lodash';

export const create: schema = {
    body: Joi.object({
        name: Joi.string().required().min(1).max(50),
    }).unknown(true),
};
