import { wrapSchema } from '@common/helpers/wrap-schema.helper';
import { Inventory } from '@common/interfaces/inventory.interface';
import { schema } from 'express-validation/lib';
import Joi from 'joi';

export const createInventory: schema = {
    body: wrapSchema(
        Joi.object<Inventory>({
            code: Joi.string().required(),
            organization_id: Joi.number().required(),
            customer_id: Joi.number().when('type', {
                is: Joi.valid('purchase_in', 'normal_out'),
                then: Joi.required(),
                otherwise: Joi.optional(),
            }),
            delivery_id: Joi.number().when('type', {
                is: Joi.valid('purchase_in', 'normal_out'),
                then: Joi.required(),
                otherwise: Joi.optional(),
            }),
            order_id: Joi.number().optional(),
            supplier_id: Joi.number().when('type', {
                is: Joi.valid('purchase_in', 'normal_out'),
                then: Joi.required(),
                otherwise: Joi.optional(),
            }),
            type: Joi.string().required(),
            employee_id: Joi.number().required(),
            time_at: Joi.string().optional(),
            note: Joi.string().max(500).allow('', null),
            license_plate: Joi.string().max(20).allow('', null),
            files: Joi.array().items(Joi.string()).optional().default([]),
            products: Joi.array()
                .items(
                    Joi.object({
                        product_id: Joi.number().required(),
                        quantity: Joi.number().min(1).required(),
                        price: Joi.number().min(0).required(),
                        warehouse_id: Joi.number().min(0).required(),
                        discount: Joi.number().min(0).optional(),
                        note: Joi.string().allow('', null),
                        key: Joi.string().allow(null, ''),
                    }),
                )
                .min(1)
                .required(),
        }),
    ),
};
export const updateInventory: schema = {
    body: wrapSchema(
        Joi.object<Inventory>({
            customer_id: Joi.number().optional(),
            organization_id: Joi.number().optional(),
            delivery_id: Joi.number().optional(),
            supplier_id: Joi.number().optional(),
            type: Joi.string().required(),
            employee_id: Joi.number().optional(),
            files: Joi.array().items(Joi.string()).optional().default([]),
            note: Joi.string().max(500).allow('', null).optional(),
            license_plate: Joi.string().max(20).allow('', null).optional(),
            time_at: Joi.string().optional(),

            products: Joi.object({
                add: Joi.array()
                    .items(
                        Joi.object({
                            product_id: Joi.number().required(),
                            quantity: Joi.number().min(1).required(),
                            price: Joi.number().min(0).required(),
                            warehouse_id: Joi.number().min(0).required(),
                            discount: Joi.number().min(0).optional(),
                            note: Joi.string().allow('', null).optional(),
                            key: Joi.string().allow(null, ''),
                        }),
                    )
                    .optional(),

                update: Joi.array()
                    .items(
                        Joi.object({
                            product_id: Joi.number().required(),
                            quantity: Joi.number().min(1).required(),
                            price: Joi.number().min(0).required(),
                            warehouse_id: Joi.number().min(0).required(),
                            discount: Joi.number().min(0).optional(),
                            note: Joi.string().allow('', null).optional(),
                            key: Joi.string().allow(null, ''),
                        }),
                    )
                    .optional(),

                delete: Joi.array()
                    .items(
                        Joi.object({
                            product_id: Joi.number().required(),
                            key: Joi.string().allow(null, ''),
                        }),
                    )
                    .optional(),
            }).optional(),
        }),
    ),
};
