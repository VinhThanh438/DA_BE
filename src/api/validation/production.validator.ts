import { ICreateProductionDetail, IUpdateProductionDetail } from '@common/interfaces/production-detail.interface';
import {
    ICreateMeshProduction,
    ICreateMeshProductionDetail,
    ICreateProduction,
    ICreateRawMaterial,
    IUpdateMeshProduction,
    IUpdateMeshProductionDetail,
    IUpdateProduction,
    IUpdateRawMaterial,
} from '@common/interfaces/production.interface';
import { extendFilterQuery, wrapSchema } from '@common/helpers/wrap-schema.helper';
import { queryFilter as baseQueryFilter } from './common.validator';
import { Joi } from 'express-validation';
import { ObjectSchema } from 'joi/lib';
import { ProductionType } from '@config/app.constant';

// Schema details của lệnh sản xuất chung (thương mại, không phân vào đâu ...)
export const createProductionDetailSchema = Joi.object<ICreateProductionDetail>({
    quantity: Joi.number().required().min(0),
    order_detail_id: Joi.number().optional().allow(null),
    note: Joi.string().optional().allow(null, '').max(1000),
    key: Joi.string().optional().allow(null, '').max(1000),
});

export const updateProductionDetailSchema = Joi.object<IUpdateProductionDetail>({
    id: Joi.number().required(),
    quantity: Joi.number().required().min(0),
    order_detail_id: Joi.number().optional().allow(null),
    production_id: Joi.number().required(),
    note: Joi.string().optional().allow(null, '').max(1000),
    key: Joi.string().optional().allow(null, '').max(1000),
});

// Schema details của lệnh sản xuất cho thép lưới hàn
export const createMeshProductionDetailSchema = Joi.object<ICreateMeshProductionDetail>({
    quantity: Joi.number().required(),
    length_bar_plate: Joi.number().required(),
    width_bar_plate: Joi.number().required(),
    weight: Joi.number().required(),
    area: Joi.number().required(),
    tolerance_length: Joi.number().optional(),
    tolerance_width: Joi.number().optional(),
    mesh_detail_id: Joi.number().required(),
});

export const updateMeshProductionDetailSchema = Joi.object<IUpdateMeshProductionDetail>({
    id: Joi.number().required(),
    quantity: Joi.number().optional(),
    length_bar_plate: Joi.number().optional(),
    width_bar_plate: Joi.number().optional(),
    weight: Joi.number().optional(),
    area: Joi.number().optional(),
    tolerance_length: Joi.number().optional(),
    tolerance_width: Joi.number().optional(),
    mesh_detail_id: Joi.number().optional(),
});

// Schema cho nguồn phôi
export const createRawMaterialSchema = Joi.object<ICreateRawMaterial>({
    product_id: Joi.number().required(),
    quantity: Joi.number().required().min(0),
    note: Joi.string().optional().allow(null, '').max(1000),
});

export const updateRawMaterialSchema = Joi.object<IUpdateRawMaterial>({
    id: Joi.number().required(),
    product_id: Joi.number().required(),
    quantity: Joi.number().optional().min(0),
    note: Joi.string().optional().allow(null, '').max(1000),
});

// Schema chung cho lệnh sản xuất
const commonCreateProductionSchema = {
    type: Joi.string().valid(ProductionType).required().default(ProductionType.NORMAL),
    code: Joi.string().optional().allow(null, '').max(100),
    time_at: Joi.isoDateTz().optional().allow(null),
    files: Joi.array().items(Joi.string()).optional().allow(null, '').default([]),
    organization_id: Joi.number().optional(),
    order_id: Joi.number().optional(),
    partner_id: Joi.number().required(),
    employee_id: Joi.number().optional(),
};

const commonUpdateProductionSchema = {
    type: Joi.string().valid(ProductionType).required().default(ProductionType.NORMAL),
    code: Joi.string().optional().allow(null, '').max(100),
    time_at: Joi.isoDateTz().optional().allow(null),
    files: Joi.array().items(Joi.string()).optional().allow(null, '').default([]),
    organization_id: Joi.number().optional(),
    order_id: Joi.number().optional(),
    partner_id: Joi.number().required(),
    employee_id: Joi.number().optional(),
};

// Schema các lệnh sản xuất
// // Lệnh sản xuất chung (thương mại, không phân vào đâu ...)
export const createProductionSchema = Joi.object<ICreateProduction>({
    ...commonCreateProductionSchema,
    details: Joi.array().items(createProductionDetailSchema).min(1).required(),
});

export const updateProductionSchema = Joi.object<IUpdateProduction>({
    ...commonUpdateProductionSchema,

    add: Joi.array().items(createProductionDetailSchema).optional().default([]),
    update: Joi.array().items(updateProductionDetailSchema).optional().default([]),
    delete: Joi.array().items(Joi.number()).optional().default([]),
});

// // Lệnh sản xuất thép lưới hàn
export const createMeshProductionSchema = Joi.object<ICreateMeshProduction>({
    ...commonCreateProductionSchema,
    
    details: Joi.array().items(createMeshProductionDetailSchema).min(1).required(),
    raw_materials: Joi.array().items(createRawMaterialSchema).optional().allow(null).default([]),
});

export const updateMeshProductionSchema = Joi.object<IUpdateMeshProduction>({
    ...commonUpdateProductionSchema,

    add: Joi.array().items(createMeshProductionDetailSchema).optional().default([]),
    update: Joi.array().items(updateMeshProductionDetailSchema).optional().default([]),
    delete: Joi.array().items(Joi.number()).optional().default([]),
    raw_materials_add: Joi.array().items(createRawMaterialSchema).optional().default([]),
    raw_materials_update: Joi.array().items(updateRawMaterialSchema).optional().default([]),
    raw_materials_delete: Joi.array().items(Joi.number()).optional().default([]),
});

// Validator
export const productionValidator = {
    create: {
        body: wrapSchema(
            Joi.object({ type: Joi.string().valid(ProductionType).required() })
                .when(Joi.object({ type: Joi.string().valid(ProductionType.MESH) }), {
                    then: createMeshProductionSchema,
                })
                .when(Joi.object({ type: Joi.string().valid(ProductionType.NORMAL) }), {
                    then: createProductionSchema,
                }),
        ),
    },
    update: {
        params: wrapSchema(
            Joi.object({
                id: Joi.number().required(),
            }),
        ),
        body: wrapSchema(
            Joi.object({ type: Joi.string().valid(ProductionType).required() })
                .when(Joi.object({ type: Joi.string().valid(ProductionType.MESH) }), {
                    then: updateMeshProductionSchema,
                })
                .when(Joi.object({ type: Joi.string().valid(ProductionType.NORMAL) }), {
                    then: createMeshProductionSchema,
                }),
        ),
    },
    queryFilter: {
        query: wrapSchema(
            extendFilterQuery(baseQueryFilter.query as ObjectSchema<any>, {
                type: Joi.string().optional().allow(null, ''),
            }),
        ),
    },
};
