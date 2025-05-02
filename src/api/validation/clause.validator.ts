import { wrapSchema } from '@common/helpers/wrap-schema.helper';
import { ICreateClause, IUpdateClause } from '@common/interfaces/clause.interface';
import Joi from 'joi';

export const createClause = {
    body: wrapSchema(
        Joi.object<ICreateClause>({
            name: Joi.string().required(),
            content: Joi.string().optional().allow(null, ''),
            max_dept_amount: Joi.number().optional().allow(null),
            max_dept_day: Joi.number().optional().allow(null),
        }),
    ),
};

export const updateClause = {
    body: wrapSchema(
        Joi.object<IUpdateClause>({
            name: Joi.string().optional(),
            content: Joi.string().optional().allow(null, ''),
            max_dept_amount: Joi.number().optional().allow(null),
            max_dept_day: Joi.number().optional().allow(null),
        }),
    ),
};
