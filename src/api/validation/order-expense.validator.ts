import { extendFilterQuery, wrapSchema } from '@common/helpers/wrap-schema.helper';
import { Joi, schema } from 'express-validation';
import { OrderExpenseType } from '@config/app.constant';
import { values } from 'lodash';
import { IOrderExpense } from '@common/interfaces/order-expense.interface';
import { ObjectSchema } from 'joi';
import { queryFilter as baseQueryFilter } from './common.validator';

export const queryFilter: schema = {
    query: wrapSchema(
        extendFilterQuery(baseQueryFilter.query as ObjectSchema<any>, {
            type: Joi.string()
                .required()
                .valid(...values(OrderExpenseType)),
        }),
    ),
};

export const create: schema = {
    body: wrapSchema(
        Joi.object<IOrderExpense>({
            code: Joi.string().optional().allow(null, '').max(100),
            time_at: Joi.string().isoDate().required(),

            description: Joi.string().optional().allow(null, '').max(500),
            payment_method: Joi.string().optional().allow(null, '').max(255),
            amount: Joi.number().precision(2).optional().allow(null),
            transaction_person: Joi.string().optional().allow(null, '').max(255),
            address: Joi.string().optional().allow(null, '').max(255),
            attached_documents: Joi.string().optional().allow(null, '').max(255),

            type: Joi.string()
                .valid(...values(OrderExpenseType))
                .required(),
            files: Joi.array().items(Joi.string()).optional().allow(null, '').default([]),

            order_id: Joi.number().optional().allow(null, ''),
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
        Joi.object<IOrderExpense>({
            code: Joi.string().optional().allow(null, '').max(100),
            time_at: Joi.string().isoDate().required(),

            description: Joi.string().optional().allow(null, '').max(500),
            payment_method: Joi.string().optional().allow(null, '').max(255),
            amount: Joi.number().precision(2).optional().allow(null),
            transaction_person: Joi.string().optional().allow(null, '').max(255),
            address: Joi.string().optional().allow(null, '').max(255),
            attached_documents: Joi.string().optional().allow(null, '').max(255),

            type: Joi.string()
                .valid(...values(OrderExpenseType))
                .required(),

            files: Joi.array().items(Joi.string()).optional().allow(null, '').default([]),

            order_id: Joi.number().optional().allow(null, ''),
        }),
    ),
};

