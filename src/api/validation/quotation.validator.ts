import { extendFilterQuery, wrapSchema } from '@common/helpers/wrap-schema.helper';
import { Joi, schema } from 'express-validation';
import { values } from 'lodash';
import { QuotationStatus, QuotationType } from '@config/app.constant';
import { IQuotation } from '@common/interfaces/quotation.interface';
import { ICommonDetails } from '@common/interfaces/common.interface';
import { ObjectSchema } from 'joi';
import { queryFilter as baseQueryFilter, detailsSchema } from './common.validator';

const QuotationBody = {
    partner_id: Joi.number().required(),
    code: Joi.string().optional().allow(null, '').max(100),
    time_at: Joi.string().isoDate().optional().allow(null),
    expired_date: Joi.string().isoDate().optional().allow(null),
    note: Joi.string().allow(null, '').max(1000),
    employee_id: Joi.number().optional(),
    status: Joi.string()
        .valid(...values(QuotationStatus))
        .optional(),
    files: Joi.array().items(Joi.string()).optional().allow(null, '').default([]),
};

const CustomerQuotationBody = {
    ...QuotationBody,
    details: Joi.array().items(Joi.object<ICommonDetails>(detailsSchema)).optional().default([]),
};

const SupplierQuotationBody = {
    organization_name: Joi.string().required(),
    tax: Joi.string().required(),
    name: Joi.string().required(),
    phone: Joi.string().required(),
    email: Joi.string().optional().allow(null, ''),
    address: Joi.string().optional().allow(null, ''),
    message: Joi.string().optional().allow(null, ''),
    files: Joi.array().items(Joi.string()).optional().allow(null, '').default([]),
    quotation_files: Joi.array().items(Joi.string()).optional().allow(null, '').default([]),

    purchase_request_id: Joi.number().optional().allow(null, ''),
    employee_id: Joi.number().optional().allow(null, ''),

    detail_ids: Joi.array().items(Joi.number()).optional().allow(null, '').default([]),
};

export const create: schema = {
    body: wrapSchema(
        Joi.object({
            type: Joi.string()
                .valid(...values(QuotationType))
                .required(),
        }).when(Joi.object({ type: Joi.valid(QuotationType.SUPPLIER) }).unknown(), {
            then: SupplierQuotationBody,
            otherwise: CustomerQuotationBody,
        }),
    ),
};
export const approve: schema = {
    params: wrapSchema(
        Joi.object({
            id: Joi.number().required(),
        }),
    ),
    body: wrapSchema(
        Joi.object({
            type: Joi.string()
                .valid(...values(QuotationType))
                .optional().allow(null, ''),
            status: Joi.string()
                .valid(...values([QuotationStatus.REJECTED, QuotationStatus.CONFIRMED]))
                .required(),
        }).when(
            Joi.object({
                status: Joi.valid(QuotationStatus.REJECTED),
            }).unknown(),
            {
                then: Joi.object({
                    rejected_reason: Joi.string().required(),
                }),
                otherwise: Joi.object({}),
            },
        ),
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
                .required()
                .valid(...values(QuotationType)),
            isMain: Joi.boolean().optional().default(false)
        }),
    ),
};

export const updateEntity: schema = {
    params: wrapSchema(
        Joi.object({
            id: Joi.number().required(),
        }),
    ),
    body: wrapSchema(
        Joi.object<IQuotation>({
            ...QuotationBody,

            add: Joi.array().items(Joi.object(detailsSchema)).optional().default([]),

            update: Joi.array().items(Joi.object(detailsSchema)).optional().default([]),

            delete: Joi.array().items(Joi.number()).optional().default([]),
        }),
    ),
};
