import { wrapSchema, extendFilterQuery } from '@common/helpers/wrap-schema.helper';
import { DeptType } from '@config/app.constant';
import { values } from 'lodash';
import { schema } from 'express-validation';
import { queryFilter as baseQueryFilter } from './common.validator';
import Joi, { ObjectSchema } from 'joi';

export const queryDebtFilter: schema = {
    query: wrapSchema(
        extendFilterQuery(baseQueryFilter.query as ObjectSchema<any>, {
            type: Joi.string()
                .valid(...values(DeptType))
                .optional()
                .allow(null, ''),
            representativeId: Joi.number().required(),
        }),
    ),
};
