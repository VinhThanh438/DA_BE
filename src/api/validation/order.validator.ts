import { extendFilterQuery, wrapSchema } from '@common/helpers/wrap-schema.helper';
import { Joi, schema } from 'express-validation';
import { values } from 'lodash';
import { OrderType } from '@config/app.constant';
import { IOrder } from '@common/interfaces/order.interface';
import { ICommonDetails } from '@common/interfaces/common.interface';
import { create as createProduction } from './production.validator';
import { create as createOrderExpense } from './order-expense.validator';
import { create as createInvoice } from './invoice.validator';
import { create as createContract } from './contract.validator';
import { queryFilter as baseQueryFilter } from './common.validator';
import { ObjectSchema } from 'joi';

export const create: schema = {
    body: wrapSchema(
        Joi.object<IOrder>({
            type: Joi.string()
                .valid(...values(OrderType))
                .required(),
            code: Joi.string().max(100).optional(),
            address: Joi.string().allow(null, '').max(500).optional(),
            phone: Joi.string().allow(null, '').max(50).optional(),
            note: Joi.string().allow(null, '').max(1000).optional(),
            order_date: Joi.date().iso().optional(),
            files: Joi.array().items(Joi.string()).optional().default([]),

            employee_id: Joi.number().optional(),
            partner_id: Joi.number().optional(),

            details: Joi.array()
                .items(
                    Joi.object<ICommonDetails>({
                        product_id: Joi.number().required(),
                        quantity: Joi.number().min(0).required(),
                        discount: Joi.number().min(0).optional(),
                        price: Joi.number().min(0).required(),
                        vat: Joi.number().min(0).optional(),
                        note: Joi.string().allow(null, '').max(500),
                        key: Joi.string().allow(null, ''),
                    }),
                )
                .optional()
                .default([]),

            productions: Joi.array()
                .items(createProduction.body ?? Joi.any())
                .optional()
                .default([]),

            order_expenses: Joi.array()
                .items(createOrderExpense.body ?? Joi.any())
                .optional()
                .default([]),

            contracts: Joi.array()
                .items(createContract.body ?? Joi.any())
                .optional()
                .default([]),

            invoices: Joi.array()
                .items(createInvoice.body ?? Joi.any())
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

export const queryFilter: schema = {
    query: wrapSchema(
        extendFilterQuery(baseQueryFilter.query as ObjectSchema<any>, {
            type: Joi.string()
                .valid(...values(OrderType))
                .required(),
        }),
    ),
};