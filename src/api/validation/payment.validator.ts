import { extendFilterQuery, wrapSchema } from '@common/helpers/wrap-schema.helper';
import { PaymentRequestStatus, PaymentRequestType } from '@config/app.constant';
import { values } from 'lodash';
import { Joi, schema } from 'express-validation';
import { IPayment } from '@common/interfaces/payment.interface';
import { ObjectSchema } from 'joi';
import { queryFilter as baseQueryFilter } from './common.validator';

export const queryFilter: schema = {
    query: wrapSchema(
        extendFilterQuery(baseQueryFilter.query as ObjectSchema<any>, {
            type: Joi.string()
                .valid(...values(PaymentRequestType))
                .optional(),
            status: Joi.string()
                .valid(...values(PaymentRequestStatus))
                .optional(),
        }),
    ),
};

export const create: schema = {
    body: wrapSchema(
        Joi.object<IPayment>({
            code: Joi.string().max(100).optional(),
            type: Joi.string()
                .valid(...Object.values(PaymentRequestType))
                .required(),
            note: Joi.string().allow(null, '').max(1000).optional(),
            time_at: Joi.string().isoDate().optional().allow(null),
            payment_date: Joi.string().isoDate().optional().allow(null),
            files: Joi.array().items(Joi.string()).optional().allow(null, '').default([]),

            payment_request_id: Joi.number().positive().required(),
            order_id: Joi.number().optional(),
            invoice_id: Joi.number().optional(),
        }).unknown(true),
    ),
};

export const update: schema = {
    params: wrapSchema(
        Joi.object({
            id: Joi.number().positive().required(),
        }),
    ),
    body: wrapSchema(
        Joi.object<IPayment>({
            code: Joi.string().max(100).optional(),
            type: Joi.string()
                .valid(...Object.values(PaymentRequestType))
                .optional(),
            note: Joi.string().allow(null, '').max(1000).optional(),
            time_at: Joi.string().isoDate().optional().allow(null),
            payment_date: Joi.string().isoDate().optional().allow(null),

            files_add: Joi.array().items(Joi.string()).optional().default([]),
            files_delete: Joi.array().items(Joi.string()).optional().default([]),

            payment_request_id: Joi.number().positive().optional(),
            order_id: Joi.number().optional(),
            invoice_id: Joi.number().optional(),
        }).unknown(true),
    ),
};

export const approve: schema = {
    params: wrapSchema(
        Joi.object({
            id: Joi.number().positive().required(),
        }),
    ),
    body: wrapSchema(
        Joi.object({
            status: Joi.string()
                .valid(...Object.values(PaymentRequestStatus))
                .required(),
            type: Joi.string()
                .valid(...values(PaymentRequestType))
                .required(),
            rejected_reason: Joi.string().when('status', {
                is: PaymentRequestStatus.REJECTED,
                then: Joi.string().min(1).required(),
                otherwise: Joi.string().allow(null, '').optional(),
            }),
            files: Joi.array().items(Joi.string()).optional().default([]),
        }),
    ),
};
