import { extendFilterQuery, wrapSchema } from '@common/helpers/wrap-schema.helper';
import { IInventory, InventoryDetail } from '@common/interfaces/inventory.interface';
import { values } from 'lodash';
import { schema } from 'express-validation';
import Joi, { ObjectSchema } from 'joi';
import { InventoryType } from '@config/app.constant';
import { queryFilter as baseQueryFilter } from './common.validator';

export const create: schema = {
    body: wrapSchema(
        Joi.object<IInventory>({
            organization_id: Joi.number().optional().allow(null, ''),
            employee_id: Joi.number().optional().allow(null, ''),
            order_id: Joi.number().optional().allow(null, ''),
            customer_id: Joi.number().optional().allow(null, ''),
            delivery_id: Joi.number().optional().allow(null, ''),
            supplier_id: Joi.number().optional().allow(null, ''),
            warehouse_id: Joi.number().required(),

            code: Joi.string().optional().allow(null, ''),
            time_at: Joi.string().isoDate().optional().allow(null),
            note: Joi.string().max(500).optional().allow('', null),
            license_plate: Joi.string().max(20).optional().allow('', null),
            files: Joi.array().items(Joi.string()).optional().allow(null, '').default([]),
            type: Joi.string()
                .valid(...values(InventoryType))
                .optional(),

            details: Joi.array()
                .items(
                    Joi.object<InventoryDetail>({
                        product_id: Joi.number().required(),
                        unit_id: Joi.number().optional().allow(null, ''),

                        real_quantity: Joi.number().min(0).required(),
                        quantity: Joi.number().min(0).required(),
                        price: Joi.number().min(0).required(),
                        discount: Joi.number().min(0).optional().allow('', null).default(0),
                        vat: Joi.number().min(0).optional().allow('', null).default(0),
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

export const queryFilter: schema = {
    query: wrapSchema(
        extendFilterQuery(baseQueryFilter.query as ObjectSchema<any>, {
            type: Joi.string()
                .valid(...values(InventoryType))
                .optional().allow(null, ''),
        }),
    ),
};
