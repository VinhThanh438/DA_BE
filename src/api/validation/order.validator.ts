import { extendFilterQuery, wrapSchema } from '@common/helpers/wrap-schema.helper';
import { Joi, schema } from 'express-validation';
import { values } from 'lodash';
import { OrderStatus, OrderType } from '@config/app.constant';
import { IOrder } from '@common/interfaces/order.interface';
import { ICommonDetails } from '@common/interfaces/common.interface';
import { create as createProduction } from './production.validator';
import { create as createOrderExpense } from './order-expense.validator';
import { create as createInvoice } from './invoice.validator';
import { create as createContract } from './contract.validator';
import { create as createInventory } from './inventory.validator';
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
            time_at: Joi.date().iso().optional(),
            files: Joi.array().items(Joi.string()).optional().allow(null, '').default([]),

            employee_id: Joi.number().optional(),
            partner_id: Joi.number().optional(),
            representative_id: Joi.number().optional(),

            details: Joi.array()
                .items(
                    Joi.object<ICommonDetails>({
                        product_id: Joi.number().required(),
                        unit_id: Joi.number().optional().allow(null, ''),
                        quantity: Joi.number().min(0).required(),
                        discount: Joi.number().min(0).optional(),
                        price: Joi.number().min(0).required(),
                        vat: Joi.number().min(0).optional().allow('', null),
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

            inventories: Joi.array()
                .items(createInventory.body ?? Joi.any())
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
                .optional().allow(null, ''),
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
                .valid(...values([OrderStatus.REJECTED, OrderStatus.CONFIRMED]))
                .required(),
        }).when(
            Joi.object({
                status: Joi.valid(OrderStatus.REJECTED),
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