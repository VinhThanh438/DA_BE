import { extendFilterQuery, wrapSchema } from '@common/helpers/wrap-schema.helper';
import { Joi, schema } from 'express-validation';
import { IQuotationRequest } from '@common/interfaces/quotation-request.interface';
import { values } from 'lodash';
import { CommonApproveStatus, QuotationRequestType } from '@config/app.constant';
import { ObjectSchema } from 'joi';
import { queryFilter as baseQueryFilter } from './common.validator';
import { IQuotationRequestDetailRequest } from '@common/interfaces/quotation-request-detail.interface';

export const create: schema = {
    body: wrapSchema(
        Joi.object<IQuotationRequest>({
            partner_id: Joi.number().optional().allow(null, '').default(null),
            organization_name: Joi.string().required().min(1).max(250),
            tax: Joi.string().allow(null, '').max(100),
            code: Joi.string().allow(null, '').max(100),
            requester_name: Joi.string().required().min(1).max(250),
            phone: Joi.string().allow(null, '').max(20),
            address: Joi.string().allow(null, '').max(500),
            email: Joi.string().allow(null, '').max(500),
            note: Joi.string().allow(null, '').max(1000),
            files: Joi.array().items(Joi.string()).optional().allow(null, '').default([]),

            details: Joi.array()
                .items(
                    Joi.object<IQuotationRequestDetailRequest>({
                        product_id: Joi.number().required(),
                        unit_id: Joi.number().required(),
                        quantity: Joi.number().min(0).required(),
                        note: Joi.string().allow(null, '').max(500),
                        key: Joi.string().allow(null, ''),
                    }),
                )
                .required()
                .min(1)
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
    body: wrapSchema(
        Joi.object<IQuotationRequest>({
            organization_name: Joi.string().required().min(1).max(250),
            tax: Joi.string().allow(null, '').max(100),
            code: Joi.string().allow(null, '').max(100),
            requester_name: Joi.string().required().min(1).max(250),
            phone: Joi.string().allow(null, '').max(20),
            address: Joi.string().allow(null, '').max(500),
            note: Joi.string().allow(null, '').max(1000),
            email: Joi.string().allow(null, '').max(500),
            files: Joi.array().items(Joi.string()).optional().allow(null, '').default([]),

            details: Joi.array()
                .items(
                    Joi.object<IQuotationRequestDetailRequest>({
                        product_id: Joi.number().required(),
                        unit_id: Joi.number().required(),
                        quantity: Joi.number().min(0).required(),
                        note: Joi.string().allow(null, '').max(500),
                        key: Joi.string().allow(null, ''),
                    }),
                )
                .optional()
                .default([]),

            add: Joi.array()
                .items(
                    Joi.object<IQuotationRequestDetailRequest>({
                        product_id: Joi.number().required(),
                        unit_id: Joi.number().required(),
                        quantity: Joi.number().min(0).required(),
                        note: Joi.string().allow(null, '').max(500),
                        key: Joi.string().allow(null, ''),
                    }),
                )
                .optional()
                .default([]),
            update: Joi.array()
                .items(
                    Joi.object<IQuotationRequestDetailRequest>({
                        id: Joi.number().required(),
                        product_id: Joi.number().required(),
                        unit_id: Joi.number().required(),
                        quantity: Joi.number().min(0).required(),
                        note: Joi.string().allow(null, '').max(500),
                        key: Joi.string().allow(null, ''),
                    }),
                )
                .optional()
                .default([]),
            delete: Joi.array().items(Joi.number()).optional().default([]),

            files_add: Joi.array().items(Joi.string()).optional().allow(null, '').default([]),
            files_delete: Joi.array().items(Joi.string()).optional().allow(null, '').default([]),
        }),
    ),
};

export const queryFilter: schema = {
    query: wrapSchema(
        extendFilterQuery(baseQueryFilter.query as ObjectSchema<any>, {
            type: Joi.string()
                .valid(...values(QuotationRequestType))
                .optional()
                .allow(null, ''),
            status: Joi.string().optional().allow(null, ''),
        }),
    ),
};

const { CONFIRMED, CUSTOMER_PENDING, REJECTED, CUSTOMER_REJECTED } = CommonApproveStatus;
export const approveQuotationRequest: schema = {
    params: wrapSchema(
        Joi.object({
            id: Joi.number().required(),
        }),
    ),
    body: wrapSchema(
        Joi.object({
            status: Joi.string()
                .valid(...Object.values([REJECTED, CONFIRMED, CUSTOMER_PENDING, CUSTOMER_REJECTED]))
                .required(),
            rejected_reason: Joi.string().when('status', {
                is: Joi.string().valid(REJECTED, CUSTOMER_REJECTED),
                then: Joi.string().min(1).required(),
                otherwise: Joi.string().allow(null, '').optional(),
            }),
            files: Joi.array().items(Joi.string()).optional().allow(null, '').default([]),
            employee_id: Joi.number().when('status', {
                is: CONFIRMED,
                then: Joi.number().required(),
                otherwise: Joi.number().optional().allow(null, '').default(null),
            }),
            is_save: Joi.boolean().optional().default(false),
        }),
    ),
};
