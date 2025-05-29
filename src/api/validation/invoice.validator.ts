import { wrapSchema } from '@common/helpers/wrap-schema.helper';
import { Joi, schema } from 'express-validation';
import { values } from 'lodash';
import { InvoiceStatus } from '@config/app.constant';
import { IInvoice } from '@common/interfaces/invoice.interface';

const InvoiceDetail = {
    id: Joi.number().optional().min(1),
    key: Joi.string().allow(null, ''),
    order_detail_id: Joi.number().required(),
    note: Joi.string().optional().allow(null, ''),
};

export const create: schema = {
    body: wrapSchema(
        Joi.object<IInvoice>({
            code: Joi.string().optional().allow(null, '').max(100),
            time_at: Joi.string().isoDate().optional().allow(null),
            invoice_date: Joi.string().isoDate().optional().allow(null),

            status: Joi.string()
                .valid(...values(InvoiceStatus))
                .optional(),

            files: Joi.array().items(Joi.string()).optional().allow(null, '').default([]),
            note: Joi.string().optional().allow(null, ''),

            organization_id: Joi.number().optional().allow(null),
            order_id: Joi.number().optional().allow(null),

            details: Joi.array().items(Joi.object(InvoiceDetail)).optional().default([]),
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
            time_at: Joi.string().isoDate().optional().allow(null),
            invoice_date: Joi.string().isoDate().optional().allow(null),
            note: Joi.string().optional().allow(null, ''),

            status: Joi.string()
                .valid(...values(InvoiceStatus))
                .optional(),

            files: Joi.array().items(Joi.string()).optional().allow(null, '').default([]),

            partner_id: Joi.number().optional().allow(null),
            employee_id: Joi.number().optional().allow(null),
            bank_id: Joi.number().optional().allow(null),
            contract_id: Joi.number().optional().allow(null),
            organization_id: Joi.number().optional().allow(null),
            order_id: Joi.number().optional().allow(null),

            // add: Joi.array().items(Joi.object(InvoiceDetai)).optional().default([]),

            // update: Joi.array().items(Joi.object(InvoiceDetai)).optional().default([]),

            delete: Joi.array().items(Joi.number()).optional().default([]),
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
            status: Joi.string()
                .valid(...values([InvoiceStatus.REJECTED, InvoiceStatus.CONFIRMED]))
                .required(),
        }).when(
            Joi.object({
                status: Joi.valid(InvoiceStatus.REJECTED),
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
