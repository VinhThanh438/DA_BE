import { extendFilterQuery, wrapSchema } from '@common/helpers/wrap-schema.helper';
import { Joi, schema } from 'express-validation';
import { IQuotationRequest } from '@common/interfaces/quotation-request.interface';
import { values } from 'lodash';
import { QuotationRequestType } from '@config/app.constant';
import { ObjectSchema } from 'joi';
import { queryFilter as baseQueryFilter } from './common.validator';

export const create: schema = {
    body: wrapSchema(
        Joi.object<IQuotationRequest>({
            organization_name: Joi.string().required().min(1).max(250),
            requester_name: Joi.string().required().min(1).max(250),
            tax: Joi.string().allow(null, '').max(100),
            phone: Joi.string().allow(null, '').max(20),
            email: Joi.string().email().allow(null, '').max(150),
            address: Joi.string().allow(null, '').max(500),
            note: Joi.string().allow(null, '').max(1000),
            files: Joi.array().items(Joi.string()).optional().allow(null, '').default([]),
            type: Joi.string()
                .valid(...values(QuotationRequestType))
                .required(),
        }),
    ),
};

export const update: schema = {
    params: wrapSchema(
        Joi.object({
            id: Joi.number().required(),
        }),
    ),
    body: create.body,
};

export const queryFilter: schema = {
    query: wrapSchema(
        extendFilterQuery(baseQueryFilter.query as ObjectSchema<any>, {
            type: Joi.string()
                .valid(...values(QuotationRequestType))
                .optional().allow(null, ''),
        }),
    ),
};
