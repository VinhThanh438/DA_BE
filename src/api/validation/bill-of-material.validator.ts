import { extendFilterQuery, wrapSchema } from '@common/helpers/wrap-schema.helper';
import { Joi, schema } from 'express-validation';
import { IBillOfMaterial, IBillOfMaterialDetails } from '@common/interfaces/bill-of-material.interface';
import { ObjectSchema, optional } from 'joi/lib';
import { queryFilter as baseQueryFilter } from './common.validator';

export const create: schema = {
    body: wrapSchema(
        Joi.object<IBillOfMaterial>({
            product_id: Joi.number().required(),
            salary: Joi.number().required(),
            details: Joi.array()
                .items(
                    Joi.object<IBillOfMaterialDetails>({
                        quantity: Joi.number().required(),
                        material_id: Joi.number().required(),
                        unit_id: Joi.number().required(),
                        key: Joi.string().optional().allow(null, ''),
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
        Joi.object<IBillOfMaterial>({
            product_id: Joi.number().required(),
            salary: Joi.number().required(),

            details: Joi.array()
                .items(
                    Joi.object<IBillOfMaterialDetails>({
                        quantity: Joi.number().required(),
                        material_id: Joi.number().required(),
                        unit_id: Joi.number().required(),
                        key: Joi.string().optional().allow(null, ''),
                    }),
                )
                .optional()
                .default([]),
        }),
    ),
};

export const queryFilter: schema = {
    query: wrapSchema(extendFilterQuery(baseQueryFilter.query as ObjectSchema<any>, {})),
};
