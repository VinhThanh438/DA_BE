import { ICreateArea, IUpdateArea } from '@common/interfaces/area.interface';
import { extendFilterQuery, wrapSchema } from '@common/helpers/wrap-schema.helper';
import { queryFilter as baseQueryFilter } from './common.validator';
import { Joi, schema } from 'express-validation';
import { ObjectSchema } from 'joi/lib';

export const create: schema = {
    body: wrapSchema(
        Joi.object<ICreateArea>({
            name: Joi.string().trim().required().max(255),
            key: Joi.string().optional().allow(null, '').max(1000),
        }),
    ),
};
export const update: schema = {
    body: wrapSchema(
        Joi.object<IUpdateArea>({
            name: Joi.string().trim().required().max(255),
            key: Joi.string().optional().allow(null, '').max(1000),
        }),
    ),
    params: wrapSchema(
        Joi.object({
            id: Joi.number().required(),
        }),
    ),
};

export const queryFilter: schema = {
    query: wrapSchema(
        extendFilterQuery(baseQueryFilter.query as ObjectSchema<any>, {
        }),
    ),
};
