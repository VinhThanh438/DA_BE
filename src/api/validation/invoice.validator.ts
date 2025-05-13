import { extendFilterQuery, wrapSchema } from '@common/helpers/wrap-schema.helper';
import { Joi, schema } from 'express-validation';
import { values } from 'lodash';
import { InvoiceStatus } from '@config/app.constant';
import { IInvoice } from '@common/interfaces/invoice.interface';
import { queryFilter as baseQueryFilter, detailsSchema } from './common.validator';
import { ObjectSchema } from 'joi';

export const create: schema = {
    body: wrapSchema(
        Joi.object<IInvoice>({
            code: Joi.string().optional().allow(null, '').max(100),
            payment_method: Joi.string().allow(null, '').max(255).optional(),
            time_at: Joi.string().isoDate().optional().allow(null),

            status: Joi.string()
                .valid(...values(InvoiceStatus))
                .optional(),

            files: Joi.array().items(Joi.string()).optional().allow(null, '').default([]),

            partner_id: Joi.number().optional().allow(null),
            employee_id: Joi.number().optional().allow(null),
            bank_id: Joi.number().optional().allow(null),
            contract_id: Joi.number().optional().allow(null),
            organization_id: Joi.number().optional().allow(null),

            details: Joi.array().items(Joi.object(detailsSchema)).optional().default([]),
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
        Joi.object<IInvoice>({
            code: Joi.string().optional().allow(null, '').max(100),
            payment_method: Joi.string().allow(null, '').max(255).optional(),
            time_at: Joi.string().isoDate().optional().allow(null),

            status: Joi.string()
                .valid(...values(InvoiceStatus))
                .optional(),

            files: Joi.array().items(Joi.string()).optional().allow(null, '').default([]),

            partner_id: Joi.number().optional().allow(null),
            employee_id: Joi.number().optional().allow(null),
            bank_id: Joi.number().optional().allow(null),
            contract_id: Joi.number().optional().allow(null),
            organization_id: Joi.number().optional().allow(null),

            details: Joi.array().items(Joi.string()).optional().allow(null, '').default([]),
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
        Joi.object<IInvoice>({
            code: Joi.string().optional().allow(null, '').max(100),
            payment_method: Joi.string().allow(null, '').max(255).optional(),
            time_at: Joi.string().isoDate().optional().allow(null),

            status: Joi.string()
                .valid(...values(InvoiceStatus))
                .optional(),

            files: Joi.array().items(Joi.string()).optional().allow(null, '').default([]),

            partner_id: Joi.number().optional().allow(null),
            employee_id: Joi.number().optional().allow(null),
            bank_id: Joi.number().optional().allow(null),
            contract_id: Joi.number().optional().allow(null),
            organization_id: Joi.number().optional().allow(null),

            add: Joi.array().items(Joi.object(detailsSchema)).optional().default([]),

            update: Joi.array().items(Joi.object(detailsSchema)).optional().default([]),

            delete: Joi.array().items(Joi.number()).optional().default([]),
        }),
    ),
};

export const queryFilter: schema = {
    query: wrapSchema(extendFilterQuery(baseQueryFilter.query as ObjectSchema<any>, {})),
};
