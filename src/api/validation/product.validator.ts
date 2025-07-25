import { extendFilterQuery, wrapSchema } from '@common/helpers/wrap-schema.helper';
import { IProduct, IUpdateProduct } from '@common/interfaces/product.interface';
import { queryFilter as baseQueryFilter } from './common.validator';
import { ProductType } from '@config/app.constant';
import { Joi, schema } from 'express-validation';
import { ObjectSchema } from 'joi/lib';
import { values } from 'lodash';

export const createProduct: schema = {
    body: wrapSchema(
        Joi.object<IProduct>({
            name: Joi.string().trim().required().max(255),
            code: Joi.string().trim().required().max(100),
            vat: Joi.number().optional().allow('', null).min(0).max(100),
            packing_standard: Joi.string().allow('', null).optional().max(255),
            current_price: Joi.number().optional().min(0).allow('', null),
            note: Joi.string().allow('', null).max(1000),
            image: Joi.string().allow('', null).max(250),
            unit_id: Joi.number().integer().min(1).required(),
            type: Joi.string()
                .valid(...values(ProductType))
                .optional()
                .allow(null, ''),
            extra_units: Joi.array()
                .items(
                    Joi.object({
                        unit_id: Joi.number().integer().min(1).required(),
                        conversion_rate: Joi.number().integer().min(1).required(),
                        key: Joi.string().allow(null, ''),
                    }),
                )
                // .min(1)
                .optional(),
            product_group_id: Joi.number().integer().min(1).optional(),
            is_public: Joi.boolean().optional().default(false),
            // details: Joi.array().items(createProductDetailSchema).optional().default([]),
        }),
    ),
};

export const updateProduct: schema = {
    body: wrapSchema(
        Joi.object<IUpdateProduct>({
            name: Joi.string().trim().optional().max(255),
            code: Joi.string().trim().optional().max(100),
            vat: Joi.number().optional().allow('', null).min(0).max(100),
            packing_standard: Joi.string().allow('', null).optional().max(255),
            current_price: Joi.number().optional().min(0).allow('', null),
            note: Joi.string().allow('', null).optional().max(1000),
            image: Joi.string().allow('', null).max(250),
            type: Joi.string()
                .valid(...values(ProductType))
                .optional()
                .allow(null, ''),
            is_public: Joi.boolean().optional().default(false),

            unit_id: Joi.number().integer().optional().min(1),
            product_group_id: Joi.number().integer().optional().min(1),
            add: Joi.array()
                .items(
                    Joi.object({
                        unit_id: Joi.number().integer().min(1).required(),
                        conversion_rate: Joi.number().integer().min(1).required(),
                        key: Joi.string().allow(null, ''),
                    }),
                )
                // .min(1)
                .optional(),
            update: Joi.array()
                .items(
                    Joi.object({
                        unit_id: Joi.number().integer().min(1).required(),
                        conversion_rate: Joi.number().integer().min(1).required(),
                        key: Joi.string().allow(null, ''),
                    }),
                )
                // .min(1)
                .optional(),
            delete: Joi.array().items(
                Joi.object({
                    unit_id: Joi.number().integer().min(1).required(),
                    key: Joi.string().allow(null, ''),
                }),
            ),

            // chi tiết lưới
            // details_add: Joi.array().items(createProductDetailSchema).optional().default([]),
            // details_update: Joi.array().items(updateProductDetailSchema).optional().default([]),
            // details_delete: Joi.array().items(Joi.number()).optional().default([])
        }),
    ),
    params: wrapSchema(
        Joi.object({
            id: Joi.number().required(),
        }),
    ),
};

export const createProductGroup: schema = {
    body: wrapSchema(
        Joi.object({
            name: Joi.string().trim().required().max(255),
            type: Joi.string()
                .valid(...values(ProductType))
                .optional()
                .allow(null, ''),
        }),
    ),
};
export const updateProductGroup: schema = {
    body: wrapSchema(
        Joi.object({
            name: Joi.string().trim().optional().max(255),
            type: Joi.string()
                .valid(...values(ProductType))
                .optional()
                .allow(null, ''),
        }),
    ),
    params: wrapSchema(
        Joi.object({
            id: Joi.number().required(),
        }),
    ),
};

export const queryFilter: schema = {
    query: wrapSchema(
        extendFilterQuery(baseQueryFilter.query as ObjectSchema<any>, {
            type: Joi.string()
                .valid(...values(ProductType))
                .optional()
                .allow(null, ''),
            unitId: Joi.number().optional().allow(null, ''),
            hasMesh: Joi.boolean().optional().allow(null, ''),
            warehouseId: Joi.number().optional().allow(null, ''),
        }),
    ),
};
