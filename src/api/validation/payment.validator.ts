import { extendFilterQuery, wrapSchema } from '@common/helpers/wrap-schema.helper';
import { PaymentRequestStatus, PaymentRequestType, PaymentType } from '@config/app.constant';
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
            bankId: Joi.number().optional(),
        }),
    ),
};

export const create: schema = {
    body: wrapSchema(
        Joi.object<IPayment>({
            code: Joi.string().max(100).optional(),
            type: Joi.string()
                .valid(...Object.values(PaymentType))
                .required(),
            note: Joi.string().allow(null, '').max(1000).optional(),
            time_at: Joi.string().isoDate().optional().allow(null),
            payment_date: Joi.string().isoDate().required(),
            files: Joi.array().items(Joi.string()).optional().allow(null, '').default([]),
            category: Joi.string().allow(null, '').optional(),

            payment_request_detail_id: Joi.number().positive().optional(),
            order_id: Joi.number().optional(),
            invoice_id: Joi.number().optional(),
            partner_id: Joi.number().optional(),
            interest_log_id: Joi.number().optional(),
            loan_id: Joi.number().optional(),

            bank_id: Joi.number().optional(),
            amount: Joi.number().optional(),
            description: Joi.string().allow(null, '').optional(),
            payment_method: Joi.string().allow(null, '').optional(),
            counterparty: Joi.string().allow(null, '').optional(),
            attached_documents: Joi.string().allow(null, '').optional(),
        }),
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
                .valid(...Object.values(PaymentType))
                .optional(),
            note: Joi.string().allow(null, '').max(1000).optional(),
            time_at: Joi.string().isoDate().optional().allow(null),
            payment_date: Joi.string().isoDate().optional().allow(null),

            files_add: Joi.array().items(Joi.string()).optional().default([]),
            files_delete: Joi.array().items(Joi.string()).optional().default([]),

            order_id: Joi.number().optional(),
            invoice_id: Joi.number().optional(),
            partner_id: Joi.number().optional(),

            bank_id: Joi.number().optional(),
            amount: Joi.number().min(0).optional(),
            description: Joi.string().allow(null, '').optional(),
            payment_method: Joi.string().allow(null, '').optional(),
            counterparty: Joi.string().allow(null, '').optional(),
            // payment_type: Joi.string()
            //     .valid(...Object.values(PaymentType))
            //     .optional(),
            attached_documents: Joi.string().allow(null, '').optional(),
        }),
    ),
};

export const close: schema = {
    query: wrapSchema(
        extendFilterQuery(baseQueryFilter.query as ObjectSchema<any>, {
            bankId: Joi.number().required(),
        }),
    ),
};
