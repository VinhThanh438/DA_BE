import { wrapSchema } from '@common/helpers/wrap-schema.helper';
import { ICreateBank } from '@common/interfaces/bank.interface';
import { ICreateProduct, IUpdateProduct } from '@common/interfaces/product.interface';
import { Joi, schema } from 'express-validation';

export const createProduct: schema = {
    body: wrapSchema(
        Joi.object<ICreateProduct>({
            name: Joi.string().trim().required().max(255),
            code: Joi.string().trim().required().max(100),
            vat: Joi.number().optional().min(0).max(100),
            packing_standard: Joi.string().allow('', null).optional().max(255),
            note: Joi.string().allow('', null).max(1000),
            image: Joi.string().allow('', null).max(250),
            unit_id: Joi.number().integer().min(1).required(),
            extra_units: Joi.array()
                .items(
                    Joi.object({
                        unit_id: Joi.number().integer().min(1).required(),
                        conversion_rate: Joi.number().integer().min(1).required(),
                        key: Joi.string().allow(null, ''),
                    }),
                )
                .min(1)
                .optional(),
        }),
    ),
};

export const updateProduct: schema = {
    body: wrapSchema(
        Joi.object<IUpdateProduct>({
            name: Joi.string().trim().optional().max(255),
            code: Joi.string().trim().optional().max(100),
            vat: Joi.number().optional().min(0).max(100),
            packing_standard: Joi.string().allow('', null).optional().max(255),
            note: Joi.string().allow('', null).optional().max(1000),
            image: Joi.string().allow('', null).max(250),

            unit_id: Joi.number().integer().optional().min(1),
            product_group_id: Joi.number().integer().optional().min(1),
            extra_units: Joi.object({
                add: Joi.array()
                    .items(
                        Joi.object({
                            unit_id: Joi.number().integer().min(1).required(),
                            conversion_rate: Joi.number().integer().min(1).required(),
                            key: Joi.string().allow(null, ''),
                        }),
                    )
                    .min(1)
                    .optional(),
                update: Joi.array()
                    .items(
                        Joi.object({
                            unit_id: Joi.number().integer().min(1).required(),
                            conversion_rate: Joi.number().integer().min(1).required(),
                            key: Joi.string().allow(null, ''),
                        }),
                    )
                    .min(1)
                    .optional(),
                delete: Joi.array().items(
                    Joi.object({
                        unit_id: Joi.number().integer().min(1).required(),
                        key: Joi.string().allow(null, ''),
                    }),
                ),
            }).optional(),
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
        }),
    ),
};
export const updateProductGroup: schema = {
    body: wrapSchema(
        Joi.object({
            name: Joi.string().trim().optional().max(255),
        }),
    ),
    params: wrapSchema(
        Joi.object({
            id: Joi.number().required(),
        }),
    ),
};
