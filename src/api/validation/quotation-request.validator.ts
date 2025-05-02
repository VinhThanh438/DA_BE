import { wrapSchema } from '@common/helpers/wrap-schema.helper';
import { Joi, schema } from 'express-validation';
import { IQuotationRequest } from '@common/interfaces/quotation-request.interface';
import { values } from 'lodash';
import { QuotationStatus, QuotationRequestType } from '@config/app.constant';

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
            files: Joi.array().items(Joi.string()).optional().default([]),
            type: Joi.string()
                .valid(...values(QuotationRequestType))
                .required(),
        }),
    ),
};

export const queryFilter: schema = {
    query: wrapSchema(
        Joi.object({
            type: Joi.string()
                .required()
                .valid(...values(QuotationRequestType)),
            page: Joi.number().optional().allow(null, '').min(1),
            limit: Joi.number().optional().allow(null, '').min(1),
            keyword: Joi.string().optional().allow(null, ''),
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
        Joi.object<IQuotationRequest>({
            organization_name: Joi.string().required().min(1).max(250),
            requester_name: Joi.string().required().min(1).max(250),
            tax: Joi.string().allow(null, '').max(100),
            phone: Joi.string().allow(null, '').max(20),
            email: Joi.string().email().allow(null, '').max(150),
            address: Joi.string().allow(null, '').max(500),
            note: Joi.string().allow(null, '').max(1000),
            files: Joi.array().items(Joi.string()).optional().default([]),
            status: Joi.string()
                .valid(...values(QuotationStatus))
                .required(),
        }),
    ),
};
