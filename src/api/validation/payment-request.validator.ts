import { extendFilterQuery, wrapSchema } from '@common/helpers/wrap-schema.helper';
import { PaymentRequestStatus, PaymentRequestType } from '@config/app.constant';
import { values } from 'lodash';
import { Joi, schema } from 'express-validation';
import { IPaymentRequest, IPaymentRequestDetail } from '@common/interfaces/payment-request.interface';
import { ObjectSchema } from 'joi';
import { queryFilter as baseQueryFilter } from './common.validator';

export const queryFilter: schema = {
    query: wrapSchema(
        extendFilterQuery(baseQueryFilter.query as ObjectSchema<any>, {
            type: Joi.string()
                .optional()
                .valid(...values(PaymentRequestType)),
            status: Joi.string().optional().allow(null, ''),
            partnerId: Joi.number().optional().allow(null, ''),
            types: Joi.any(),
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
            time_at: Joi.isoDateTz().optional().allow(null),
            payment_date: Joi.isoDateTz().optional().allow(null),
            files: Joi.array().items(Joi.string()).optional().allow(null, '').default([]),

            employee_id: Joi.number().optional().allow(null),
            approver_id: Joi.number().optional().allow(null),
            partner_id: Joi.number().optional().allow(null),
            bank_id: Joi.number().optional().allow(null),
            representative_id: Joi.number().optional().allow(null),

            details: Joi.array()
                .items(
                    Joi.object<IPaymentRequestDetail>({
                        order_id: Joi.number().optional().allow(null),
                        invoice_id: Joi.number().optional().allow(null),
                        loan_id: Joi.number().optional().allow(null),
                        interest_log_id: Joi.number().optional().allow(null),
                        amount: Joi.number().min(0).optional(),
                        note: Joi.string().allow(null, '').max(500),
                        key: Joi.string().allow(null, ''),
                    }),
                )
                .optional()
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
