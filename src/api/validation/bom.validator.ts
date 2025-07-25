import { extendFilterQuery, wrapSchema } from '@common/helpers/wrap-schema.helper';
import { Joi, schema } from 'express-validation';
import { ICreateBom, IUpdateBom } from '@common/interfaces/bom.interface';
import { ObjectSchema } from 'joi';
import { queryFilter as baseQueryFilter } from './common.validator';
import { ICreateWorkPricing, IUpdateWorkPricing } from '@common/interfaces/work-pricing.interface';
import { ICreateBomDetail, IUpdateBomDetail } from '@common/interfaces/bom-detail.interface';

export const create: schema = {
    body: wrapSchema(
        Joi.object<ICreateBom>({
            note: Joi.string().optional().allow(null, ''),
            product_id: Joi.number().required(),
            details: Joi.array().items(
                Joi.object<ICreateBomDetail>({
                    material_id: Joi.number().required(),
                    quantity: Joi.number().required(),
                    unit_id: Joi.number().required(),
                    key: Joi.string().optional().allow(null, ''),
                    note: Joi.string().optional().allow(null, ''),
                })).optional().default([]),

            work_pricings: Joi.array()
                .items(
                    Joi.object<ICreateWorkPricing>({
                        production_step_id: Joi.number().required(),
                        unit_id: Joi.number().required(),
                        price: Joi.number().required(),
                        key: Joi.string().optional().allow(null, ''),
                        note: Joi.string().optional().allow(null, ''),
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
        Joi.object<IUpdateBom>({
            product_id: Joi.number().required(),
            note: Joi.string().optional().allow(null, ''),
            add: Joi.array().items(
                Joi.object<IUpdateBomDetail>({
                    material_id: Joi.number().required(),
                    quantity: Joi.number().required(),
                    unit_id: Joi.number().required(),
                    key: Joi.string().optional().allow(null, ''),
                    note: Joi.string().optional().allow(null, ''),
                })),
            update: Joi.array().items(
                Joi.object<IUpdateBomDetail>({
                    id: Joi.number().required(),
                    material_id: Joi.number().required(),
                    quantity: Joi.number().required(),
                    unit_id: Joi.number().required(),
                    key: Joi.string().optional().allow(null, ''),
                    note: Joi.string().optional().allow(null, ''),
                })),
            delete: Joi.array().items(Joi.number()).optional().default([]),

            work_pricings_add: Joi.array().items(
                Joi.object<ICreateWorkPricing>({
                    production_step_id: Joi.number().required(),
                    unit_id: Joi.number().required(),
                    price: Joi.number().required(),
                    key: Joi.string().optional().allow(null, ''),
                    note: Joi.string().optional().allow(null, ''),
                })),
            work_pricings_update: Joi.array().items(
                Joi.object<IUpdateWorkPricing>({
                    id: Joi.number().required(),
                    production_step_id: Joi.number().required(),
                    unit_id: Joi.number().required(),
                    price: Joi.number().required(),
                    key: Joi.string().optional().allow(null, ''),
                    note: Joi.string().optional().allow(null, ''),
                })),
            work_pricings_delete: Joi.array().items(Joi.number()).optional().default([]),
        }),
    ),
};

export const queryFilter: schema = {
    query: wrapSchema(extendFilterQuery(baseQueryFilter.query as ObjectSchema<any>, {})),
};
