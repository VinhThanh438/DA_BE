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
            shipping_plan_id: Joi.number().optional().allow(null, ''),
            supplier_id: Joi.number().optional().allow(null, ''),
            delivery_id: Joi.number().optional().allow(null, ''),
            warehouse_id: Joi.number().required(),

            code: Joi.string().optional().allow(null, ''),
            time_at: Joi.isoDateTz().optional().allow(null),
            note: Joi.string().max(500).optional().allow('', null),
            plate: Joi.string().max(20).optional().allow('', null),
            vehicle: Joi.string().optional().allow('', null),
            representative_name: Joi.string().optional().allow('', null),
            identity_code: Joi.string().optional().allow('', null),
            delivery_cost: Joi.number().optional().allow('', null).default(0),
            vat: Joi.number().optional().allow('', null),
            files: Joi.array().items(Joi.string()).optional().allow(null, '').default([]),
            type: Joi.string()
                .valid(...values(InventoryType))
                .optional(),

            details: Joi.array()
                .items(
                    Joi.object<InventoryDetail>({
                        order_detail_id: Joi.number().required(),
                        // product_id: Joi.number().required(),
                        real_quantity: Joi.number().min(0).optional(),
                        quantity: Joi.number().min(0).optional(),
                        price: Joi.number().min(0).optional().allow(null, ''),
                        note: Joi.string().allow(null, '').max(500).optional(),
                        quantity_adjustment: Joi.number().optional().allow(null, ''),
                        kg: Joi.number().optional().allow(null, ''),
                        real_kg: Joi.number().optional().allow(null, ''),
                        key: Joi.string().allow(null, ''),
                        order_detail: Joi.object().optional(),
                    }),
                )
                .optional()
                .default([]),
            order_detail: Joi.object().optional().allow(null, ''),
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
        Joi.object<IInventory>({
            organization_id: Joi.number().optional().allow(null, ''),
            employee_id: Joi.number().optional().allow(null, ''),
            order_id: Joi.number().optional().allow(null, ''),
            customer_id: Joi.number().optional().allow(null, ''),
            shipping_plan_id: Joi.number().optional().allow(null, ''),
            supplier_id: Joi.number().optional().allow(null, ''),
            delivery_id: Joi.number().optional().allow(null, ''),
            warehouse_id: Joi.number().optional(),

            code: Joi.string().optional().allow(null, ''),
            time_at: Joi.isoDateTz().optional().allow(null),
            note: Joi.string().max(500).optional().allow('', null),
            plate: Joi.string().max(20).optional().allow('', null),
            vehicle: Joi.string().optional().allow('', null),
            representative_name: Joi.string().optional().allow('', null),
            identity_code: Joi.string().optional().allow('', null),
            delivery_cost: Joi.number().optional().allow('', null).default(0),
            type: Joi.string()
                .valid(...values(InventoryType))
                .optional(),

            files_add: Joi.array().items(Joi.string()).optional().allow(null, '').default([]),
            files_delete: Joi.array().items(Joi.string()).optional().allow(null, '').default([]),

            add: Joi.array()
                .items(
                    Joi.object<InventoryDetail>({
                        order_detail_id: Joi.number().required(),
                        real_quantity: Joi.number().min(0).required(),
                        quantity_adjustment: Joi.number().optional().allow(null, ''),
                        kg: Joi.number().optional().allow(null, ''),
                        real_kg: Joi.number().optional().allow(null, ''),
                        note: Joi.string().allow(null, '').max(500),
                        key: Joi.string().allow(null, ''),
                        order_detail: Joi.object().optional(),
                    }),
                )
                .optional()
                .default([]),
            update: Joi.array()
                .items(
                    Joi.object<InventoryDetail>({
                        id: Joi.number().required(),
                        // order_detail_id: Joi.number().required(),
                        real_quantity: Joi.number().min(0).required(),
                        quantity_adjustment: Joi.number().optional().allow(null, ''),
                        kg: Joi.number().optional().allow(null, ''),
                        real_kg: Joi.number().optional().allow(null, ''),
                        note: Joi.string().allow(null, '').max(500),
                        key: Joi.string().allow(null, ''),
                        order_detail: Joi.object().optional(),
                    }),
                )
                .optional()
                .default([]),
            delete: Joi.array().items(Joi.number()).optional().default([]),
        }),
    ),
};

export const queryFilter: schema = {
    query: wrapSchema(
        extendFilterQuery(baseQueryFilter.query as ObjectSchema<any>, {
            type: Joi.string()
                .valid(...values(InventoryType))
                .optional()
                .allow(null, ''),
            supplierIds: Joi.alternatives()
                .try(
                    Joi.array().items(Joi.number()),
                    Joi.string().custom((value, helpers) => {
                        if (!value || value === '') return null;
                        const ids = value.split(',').map((id: string) => parseInt(id.trim(), 10));
                        if (ids.some((id: number) => isNaN(id))) {
                            return helpers.error('any.invalid');
                        }
                        return ids;
                    }),
                )
                .optional()
                .allow(null, ''),
            deliveryIds: Joi.alternatives()
                .try(
                    Joi.array().items(Joi.number()),
                    Joi.string().custom((value, helpers) => {
                        if (!value || value === '') return null;
                        const ids = value.split(',').map((id: string) => parseInt(id.trim(), 10));
                        if (ids.some((id: number) => isNaN(id))) {
                            return helpers.error('any.invalid');
                        }
                        return ids;
                    }),
                )
                .optional()
                .allow(null, ''),
        }),
    ),
};

export const report: schema = {
    query: wrapSchema(
        extendFilterQuery(baseQueryFilter.query as ObjectSchema<any>, {
            warehouseIds: Joi.alternatives()
                .try(
                    Joi.array().items(Joi.number()),
                    Joi.string().custom((value, helpers) => {
                        if (!value || value === '') return null;
                        const ids = value.split(',').map((id: string) => parseInt(id.trim(), 10));
                        if (ids.some((id: number) => isNaN(id))) {
                            return helpers.error('any.invalid');
                        }
                        return ids;
                    }),
                )
                .optional()
                .allow(null, ''),
            productIds: Joi.alternatives()
                .try(
                    Joi.array().items(Joi.number()),
                    Joi.string().custom((value, helpers) => {
                        if (!value || value === '') return null;
                        const ids = value.split(',').map((id: string) => parseInt(id.trim(), 10));
                        if (ids.some((id: number) => isNaN(id))) {
                            return helpers.error('any.invalid');
                        }
                        return ids;
                    }),
                )
                .optional()
                .allow(null, ''),
        }),
    ),
};

export const updateRealQuantity: schema = {
    params: wrapSchema(
        Joi.object({
            id: Joi.number().required(),
        }),
    ),
    body: wrapSchema(
        Joi.object<IInventory>({
            files: Joi.array().items(Joi.string()).optional().allow(null, '').default([]),

            details: Joi.array()
                .items(
                    Joi.object<InventoryDetail>({
                        id: Joi.number().min(0).required(),
                        real_quantity: Joi.number().min(0).required(),
                        price: Joi.number().min(0).optional().allow(null, ''),
                        note: Joi.string().allow(null, '').max(500).optional(),
                        key: Joi.string().allow(null, ''),
                    }),
                )
                .optional()
                .default([]),
        }),
    ),
};

export const updateAdjustQuantity: schema = {
    params: wrapSchema(
        Joi.object({
            id: Joi.number().required(),
        }),
    ),
    body: wrapSchema(
        Joi.object<IInventory>({
            files: Joi.array().items(Joi.string()).optional().allow(null, '').default([]),

            details: Joi.array()
                .items(
                    Joi.object<InventoryDetail>({
                        id: Joi.number().min(0).required(),
                        quantity_adjustment: Joi.number().required(),
                        note: Joi.string().allow(null, '').max(500).optional(),
                        key: Joi.string().allow(null, ''),
                    }),
                )
                .optional()
                .default([]),
        }),
    ),
};
