import { extendFilterQuery, wrapSchema } from '@common/helpers/wrap-schema.helper';
import { Joi, schema } from 'express-validation';
import { values } from 'lodash';
import { OrderType } from '@config/app.constant';
import { IOrder } from '@common/interfaces/order.interface';
import { ICommonDetails } from '@common/interfaces/common.interface';
import { queryFilter as baseQueryFilter } from './common.validator';
import { ObjectSchema } from 'joi';
import { IShippingPlan } from '@common/interfaces/shipping-plan.interface';

export const create: schema = {
    body: wrapSchema(
        Joi.object<IOrder>({
            type: Joi.string()
                .valid(...values(OrderType))
                .required(),
            code: Joi.string().max(100).optional(),
            address: Joi.string().allow(null, '').max(500).optional(),
            phone: Joi.string().allow(null, '').max(50).optional(),
            payment_method: Joi.string().allow(null, '').max(255).optional(),
            note: Joi.string().allow(null, '').max(1000).optional(),
            time_at: Joi.date().iso().optional(),
            files: Joi.array().items(Joi.string()).optional().allow(null, '').default([]),

            employee_id: Joi.number().optional(),
            partner_id: Joi.number().optional(),
            representative_id: Joi.number().optional(),
            bank_id: Joi.number().optional(),

            details: Joi.array()
                .items(
                    Joi.object<ICommonDetails>({
                        product_id: Joi.number().required(),
                        unit_id: Joi.number().optional().allow(null, ''),
                        quantity: Joi.number().min(0).required(),
                        discount: Joi.number().min(0).optional(),
                        commission: Joi.number().min(0).optional(),
                        price: Joi.number().min(0).required(),
                        vat: Joi.number().min(0).optional().allow('', null),
                        note: Joi.string().allow(null, '').max(500),
                        key: Joi.string().allow(null, ''),
                    }),
                )
                .optional()
                .default([]),

            shipping_plans: Joi.array()
                .items(
                    Joi.object<IShippingPlan>({
                        partner_id: Joi.number().required(),
                        quantity: Joi.number().min(0).optional(),
                        price: Joi.number().min(0).optional(),
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
    body: wrapSchema(
        Joi.object<IOrder>({
            type: Joi.string()
                .valid(...values(OrderType))
                .required(),
            code: Joi.string().max(100).optional(),
            address: Joi.string().allow(null, '').max(500).optional(),
            phone: Joi.string().allow(null, '').max(50).optional(),
            payment_method: Joi.string().allow(null, '').max(255).optional(),
            note: Joi.string().allow(null, '').max(1000).optional(),
            time_at: Joi.date().iso().optional(),
            files: Joi.array().items(Joi.string()).optional().allow(null, '').default([]),

            employee_id: Joi.number().optional(),
            partner_id: Joi.number().optional(),
            representative_id: Joi.number().optional(),
            bank_id: Joi.number().optional(),

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

            add: Joi.array()
                .items(
                    Joi.object<ICommonDetails>({
                        product_id: Joi.number().required(),
                        unit_id: Joi.number().optional().allow(null, ''),
                        quantity: Joi.number().min(0).required(),
                        discount: Joi.number().min(0).optional(),
                        commission: Joi.number().min(0).optional(),
                        price: Joi.number().min(0).required(),
                        vat: Joi.number().min(0).optional().allow('', null),
                        note: Joi.string().allow(null, '').max(500),
                        key: Joi.string().allow(null, ''),
                    }),
                )
                .optional()
                .default([]),
            update: Joi.array()
                .items(
                    Joi.object<ICommonDetails>({
                        id: Joi.number().required(),
                        product_id: Joi.number().required(),
                        unit_id: Joi.number().optional().allow(null, ''),
                        quantity: Joi.number().min(0).required(),
                        discount: Joi.number().min(0).optional(),
                        commission: Joi.number().min(0).optional(),
                        price: Joi.number().min(0).required(),
                        vat: Joi.number().min(0).optional().allow('', null),
                        note: Joi.string().allow(null, '').max(500),
                        key: Joi.string().allow(null, ''),
                    }),
                )
                .optional()
                .default([]),
            delete: Joi.array().items(Joi.number()).optional().default([]),

            files_add: Joi.array().items(Joi.string()).optional().allow(null, '').default([]),
            files_delete: Joi.array().items(Joi.string()).optional().allow(null, '').default([]),

            shipping_plans_add: Joi.array()
                .items(
                    Joi.object<IShippingPlan>({
                        partner_id: Joi.number().optional(),
                        quantity: Joi.number().min(0).optional(),
                        price: Joi.number().min(0).optional(),
                        note: Joi.string().allow(null, '').max(500),
                        key: Joi.string().allow(null, ''),
                    }),
                )
                .optional()
                .default([]),

            shipping_plans_update: Joi.array()
                .items(
                    Joi.object<IShippingPlan>({
                        id: Joi.number().required(),
                        partner_id: Joi.number().optional(),
                        quantity: Joi.number().min(0).optional(),
                        price: Joi.number().min(0).optional(),
                        note: Joi.string().allow(null, '').max(500),
                        key: Joi.string().allow(null, ''),
                    }),
                )
                .optional()
                .default([]),

            shipping_plans_delete: Joi.array().items(Joi.number()).optional().default([]),
        }),
    ),
};

export const queryFilter: schema = {
    query: wrapSchema(
        extendFilterQuery(baseQueryFilter.query as ObjectSchema<any>, {
            type: Joi.string()
                .valid(...values(OrderType))
                .optional()
                .allow(null, ''),
            status: Joi.string().optional().allow(null, ''),
            partner_id: Joi.number().optional(),
        }),
    ),
};
