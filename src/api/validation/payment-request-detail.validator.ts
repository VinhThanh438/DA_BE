import { PaymentMethod, PaymentRequestDetailStatus } from '@config/app.constant';
import { queryFilter as baseQueryFilter } from './common.validator';
import { wrapSchema, extendFilterQuery } from '@common/helpers/wrap-schema.helper';
import { values } from 'lodash';
import { schema } from 'express-validation';
import Joi, { ObjectSchema } from 'joi';

export const queryFilter: schema = {
    query: wrapSchema(
        extendFilterQuery(baseQueryFilter.query as ObjectSchema<any>, {
            status: Joi.string()
                .optional()
                .valid(...values(PaymentRequestDetailStatus))
                .allow(null),
            paymentMethod: Joi.string()
                .optional()
                .valid(...values(PaymentMethod))
                .allow(null, ''),
        }),
    ),
};
