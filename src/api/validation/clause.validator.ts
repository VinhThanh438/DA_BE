import { wrapSchema } from '@common/helpers/wrap-schema.helper';
import { ICreateClause, IUpdateClause } from '@common/interfaces/clause.interface';
import Joi from 'joi';

export const createClause = {
    body: wrapSchema(
        Joi.object<ICreateClause>({
            name: Joi.string().required(),
            content: Joi.string().optional().allow(null, ''),
        }),
    ),
};

export const updateClause = {
    body: wrapSchema(
        Joi.object<IUpdateClause>({
            name: Joi.string().optional(),
            content: Joi.string().optional().allow(null, ''),
        }),
    ),
};
