import { extendFilterQuery, wrapSchema } from '@common/helpers/wrap-schema.helper';
import { PaymentRequestStatus, PaymentRequestType } from '@config/app.constant';
import { values } from 'lodash';
import { Joi, schema } from 'express-validation';
import { IPaymentRequest } from '@common/interfaces/payment-request.interface';
import { ICommonDetails } from '@common/interfaces/common.interface';
import { ObjectSchema } from 'joi';
import { queryFilter as baseQueryFilter } from './common.validator';

export const queryFilter: schema = {
    query: wrapSchema(
        extendFilterQuery(baseQueryFilter.query as ObjectSchema<any>, {
            type: Joi.string()
                .required()
                .valid(...values(PaymentRequestType)),
        }),
    ),
};

export const create: schema = {
    body: wrapSchema(
        Joi.object<IPaymentRequest>({
            code: Joi.string().max(100).optional(),
            status: Joi.string()
                .valid(...Object.values(PaymentRequestStatus))
                .optional(),
            note: Joi.string().allow(null, '').max(1000).optional(),
            type: Joi.string()
                .valid(...Object.values(PaymentRequestType))
                .optional(),
            rejected_reason: Joi.string().allow(null, '').optional(),
            time_at: Joi.string().isoDate().optional().allow(null),
            payment_date: Joi.string().isoDate().optional().allow(null),
            files: Joi.array().items(Joi.string()).optional().allow(null, '').default([]),

            employee_id: Joi.number().optional(),

            details: Joi.array()
                .items(
                    Joi.object<ICommonDetails>({
                        order_detail_id: Joi.number().required(),
                        amount: Joi.number().min(0).optional(),
                        note: Joi.string().allow(null, '').max(500),
                        key: Joi.string().allow(null, ''),
                    }),
                )
                .required()
                .default([]),
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

export const approve: schema = {
    params: wrapSchema(
        Joi.object({
            id: Joi.number().required(),
        }),
    ),
    body: wrapSchema(
        Joi.object({
            status: Joi.string()
                .valid(...values([PaymentRequestStatus.REJECTED, PaymentRequestStatus.CONFIRMED]))
                .required(),
        }).when(
            Joi.object({
                status: Joi.valid(PaymentRequestStatus.REJECTED),
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
