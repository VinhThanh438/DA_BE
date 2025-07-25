import { wrapSchema, extendFilterQuery } from '@common/helpers/wrap-schema.helper';
import { schema } from 'express-validation';
import Joi, { ObjectSchema } from 'joi';
import { queryFilter as baseQueryFilter } from './common.validator';
import { ProductType } from '@config/app.constant';
import { values } from 'lodash';

export const queryFilter: schema = {
    query: wrapSchema(
        extendFilterQuery(baseQueryFilter.query as ObjectSchema<any>, {
            type: Joi.string()
                .valid(...values([ProductType.FINISHED]))
                .required(),
        }),
    ),
};
