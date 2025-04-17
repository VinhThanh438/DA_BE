import { wrapSchema } from '@common/helpers/wrap-schema.helper';
import { Joi, schema } from 'express-validation';
import { values } from 'lodash';

export const queryFilter: schema = {
    query: wrapSchema(
        Joi.object({
            page: Joi.number().required().min(1),
            size: Joi.number().required().min(1),
            keyword: Joi.string().optional().allow(null, ''),
        }),
    ),
};

export const queryById: schema = {
    params: wrapSchema(
        Joi.object({
            id: Joi.number().required(),
        }),
    ),
};
