import { extendFilterQuery, wrapSchema } from '@common/helpers/wrap-schema.helper';
import { values } from 'lodash';
import { Joi, schema } from 'express-validation';
import { PartnerType } from '@config/app.constant';
import { ObjectSchema } from 'joi';
import { queryFilter as baseQueryFilter } from './common.validator';

export const create: schema = {
    body: wrapSchema(
        Joi.object({
            name: Joi.string().required().max(250),
            type: Joi.string()
                .required()
                .valid(...values(PartnerType)),
        }),
    ),
};

export const queryFilter: schema = {
    query: wrapSchema(
        extendFilterQuery(baseQueryFilter.query as ObjectSchema<any>, {
            type: Joi.string()
                .optional().allow(null, '')
                .valid(...values(PartnerType)),
        }),
    ),
};

export const update: schema = {
    params: wrapSchema(
        Joi.object({
            id: Joi.number().required(),
        }),
    ),
    body: create.body
};
