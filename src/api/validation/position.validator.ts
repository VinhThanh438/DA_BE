import { wrapSchema } from '@common/helpers/wrap-schema.helper';
import { Joi, schema } from 'express-validation';

export const create: schema = {
    body: wrapSchema(
        Joi.object({
            name: Joi.string().required().min(1).max(300),
            level: Joi.string().optional().allow('', null).max(150),
            description: Joi.string().optional().allow('', null).max(500),
        }),
    ),
};

export const update: schema = {
    params: wrapSchema(
        Joi.object({
            id: Joi.number().required(),
        }),
    ),
    body: wrapSchema(
        Joi.object({
            name: Joi.string().required().min(1).max(300),
            level: Joi.string().optional().allow('', null).max(150),
            description: Joi.string().optional().allow('', null).max(500),
        }),
    ),
};
