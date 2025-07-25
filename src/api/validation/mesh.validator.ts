import { extendFilterQuery, wrapSchema } from '@common/helpers/wrap-schema.helper';
import { ICreateMesh, ICreateMeshDetail, IUpdateMesh, IUpdateMeshDetail } from '@common/interfaces/mesh.interface';
import { queryFilter as baseQueryFilter } from './common.validator';
import { Joi, schema } from 'express-validation';
import { ObjectSchema } from 'joi/lib';

const meshSchema = {
    code: Joi.string().optional().allow(null, '').max(1000),
    quantity: Joi.number().required().min(0),
    width: Joi.number().required().min(0),
    width_spacing: Joi.number().required().min(0),
    width_phi: Joi.number().required().min(0),
    width_left: Joi.number().required().min(0),
    width_right: Joi.number().required().min(0),
    length: Joi.number().required().min(0),
    length_spacing: Joi.number().required().min(0),
    length_phi: Joi.number().required().min(0),
    length_left: Joi.number().required().min(0),
    length_right: Joi.number().required().min(0),
    product_id: Joi.number().required(),
    area_id: Joi.number().optional().allow(null, ''),
    key: Joi.string().optional().allow(null, '').max(1000),
};

export const create: schema = {
    body: wrapSchema(
        Joi.object<ICreateMesh>({
            quotation_id: Joi.number().required(),
            note: Joi.string().optional().allow(null, '').max(1000),
            details: Joi.array().items(Joi.object<ICreateMeshDetail>(meshSchema)).default([]),
            scope_name: Joi.string().optional().allow(null, '').max(1000),
            quantity_name: Joi.string().optional().allow(null, '').max(1000),
            length_name: Joi.string().optional().allow(null, '').max(1000),
            width_name: Joi.string().optional().allow(null, '').max(1000),
            weight_name: Joi.string().optional().allow(null, '').max(1000),
            area_name: Joi.string().optional().allow(null, '').max(1000),
        }),
    ),
};

export const update: schema = {
    body: wrapSchema(
        Joi.object<IUpdateMesh>({
            quotation_id: Joi.number().required(),
            note: Joi.string().optional().allow(null, '').max(1000),
            add: Joi.array().items(Joi.object<ICreateMeshDetail>(meshSchema)).optional().default([]),
            update: Joi.array()
                .items(
                    Joi.object<IUpdateMeshDetail>({
                        ...meshSchema,
                        id: Joi.number().required(),
                    }),
                )
                .optional()
                .default([]),
            delete: Joi.array().items(Joi.number()).optional().default([]),
            scope_name: Joi.string().optional().allow(null, '').max(1000),
            quantity_name: Joi.string().optional().allow(null, '').max(1000),
            length_name: Joi.string().optional().allow(null, '').max(1000),
            width_name: Joi.string().optional().allow(null, '').max(1000),
            weight_name: Joi.string().optional().allow(null, '').max(1000),
            area_name: Joi.string().optional().allow(null, '').max(1000),
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
            hasMesh: Joi.boolean().optional().allow(null, ''),
        }),
    ),
};
