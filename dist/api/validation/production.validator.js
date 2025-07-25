"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productionValidator = exports.updateMeshProductionSchema = exports.createMeshProductionSchema = exports.updateProductionSchema = exports.createProductionSchema = exports.updateRawMaterialSchema = exports.createRawMaterialSchema = exports.updateMeshProductionDetailSchema = exports.createMeshProductionDetailSchema = exports.updateProductionDetailSchema = exports.createProductionDetailSchema = void 0;
const wrap_schema_helper_1 = require("../../common/helpers/wrap-schema.helper");
const common_validator_1 = require("./common.validator");
const express_validation_1 = require("express-validation");
const app_constant_1 = require("../../config/app.constant");
// Schema details của lệnh sản xuất chung (thương mại, không phân vào đâu ...)
exports.createProductionDetailSchema = express_validation_1.Joi.object({
    quantity: express_validation_1.Joi.number().required().min(0),
    order_detail_id: express_validation_1.Joi.number().optional().allow(null),
    note: express_validation_1.Joi.string().optional().allow(null, '').max(1000),
    key: express_validation_1.Joi.string().optional().allow(null, '').max(1000),
});
exports.updateProductionDetailSchema = express_validation_1.Joi.object({
    id: express_validation_1.Joi.number().required(),
    quantity: express_validation_1.Joi.number().required().min(0),
    order_detail_id: express_validation_1.Joi.number().optional().allow(null),
    production_id: express_validation_1.Joi.number().required(),
    note: express_validation_1.Joi.string().optional().allow(null, '').max(1000),
    key: express_validation_1.Joi.string().optional().allow(null, '').max(1000),
});
// Schema details của lệnh sản xuất cho thép lưới hàn
exports.createMeshProductionDetailSchema = express_validation_1.Joi.object({
    quantity: express_validation_1.Joi.number().required(),
    length_bar_plate: express_validation_1.Joi.number().required(),
    width_bar_plate: express_validation_1.Joi.number().required(),
    weight: express_validation_1.Joi.number().required(),
    area: express_validation_1.Joi.number().required(),
    tolerance_length: express_validation_1.Joi.number().optional(),
    tolerance_width: express_validation_1.Joi.number().optional(),
    mesh_detail_id: express_validation_1.Joi.number().required(),
});
exports.updateMeshProductionDetailSchema = express_validation_1.Joi.object({
    id: express_validation_1.Joi.number().required(),
    quantity: express_validation_1.Joi.number().optional(),
    length_bar_plate: express_validation_1.Joi.number().optional(),
    width_bar_plate: express_validation_1.Joi.number().optional(),
    weight: express_validation_1.Joi.number().optional(),
    area: express_validation_1.Joi.number().optional(),
    tolerance_length: express_validation_1.Joi.number().optional(),
    tolerance_width: express_validation_1.Joi.number().optional(),
    mesh_detail_id: express_validation_1.Joi.number().optional(),
});
// Schema cho nguồn phôi
exports.createRawMaterialSchema = express_validation_1.Joi.object({
    product_id: express_validation_1.Joi.number().required(),
    quantity: express_validation_1.Joi.number().required().min(0),
    note: express_validation_1.Joi.string().optional().allow(null, '').max(1000),
});
exports.updateRawMaterialSchema = express_validation_1.Joi.object({
    id: express_validation_1.Joi.number().required(),
    product_id: express_validation_1.Joi.number().required(),
    quantity: express_validation_1.Joi.number().optional().min(0),
    note: express_validation_1.Joi.string().optional().allow(null, '').max(1000),
});
// Schema chung cho lệnh sản xuất
const commonCreateProductionSchema = {
    type: express_validation_1.Joi.string().valid(app_constant_1.ProductionType).required().default(app_constant_1.ProductionType.NORMAL),
    code: express_validation_1.Joi.string().optional().allow(null, '').max(100),
    time_at: express_validation_1.Joi.isoDateTz().optional().allow(null),
    files: express_validation_1.Joi.array().items(express_validation_1.Joi.string()).optional().allow(null, '').default([]),
    organization_id: express_validation_1.Joi.number().optional(),
    order_id: express_validation_1.Joi.number().optional(),
    partner_id: express_validation_1.Joi.number().required(),
    employee_id: express_validation_1.Joi.number().optional(),
};
const commonUpdateProductionSchema = {
    type: express_validation_1.Joi.string().valid(app_constant_1.ProductionType).required().default(app_constant_1.ProductionType.NORMAL),
    code: express_validation_1.Joi.string().optional().allow(null, '').max(100),
    time_at: express_validation_1.Joi.isoDateTz().optional().allow(null),
    files: express_validation_1.Joi.array().items(express_validation_1.Joi.string()).optional().allow(null, '').default([]),
    organization_id: express_validation_1.Joi.number().optional(),
    order_id: express_validation_1.Joi.number().optional(),
    partner_id: express_validation_1.Joi.number().required(),
    employee_id: express_validation_1.Joi.number().optional(),
};
// Schema các lệnh sản xuất
// // Lệnh sản xuất chung (thương mại, không phân vào đâu ...)
exports.createProductionSchema = express_validation_1.Joi.object(Object.assign(Object.assign({}, commonCreateProductionSchema), { details: express_validation_1.Joi.array().items(exports.createProductionDetailSchema).min(1).required() }));
exports.updateProductionSchema = express_validation_1.Joi.object(Object.assign(Object.assign({}, commonUpdateProductionSchema), { add: express_validation_1.Joi.array().items(exports.createProductionDetailSchema).optional().default([]), update: express_validation_1.Joi.array().items(exports.updateProductionDetailSchema).optional().default([]), delete: express_validation_1.Joi.array().items(express_validation_1.Joi.number()).optional().default([]) }));
// // Lệnh sản xuất thép lưới hàn
exports.createMeshProductionSchema = express_validation_1.Joi.object(Object.assign(Object.assign({}, commonCreateProductionSchema), { details: express_validation_1.Joi.array().items(exports.createMeshProductionDetailSchema).min(1).required(), raw_materials: express_validation_1.Joi.array().items(exports.createRawMaterialSchema).optional().allow(null).default([]) }));
exports.updateMeshProductionSchema = express_validation_1.Joi.object(Object.assign(Object.assign({}, commonUpdateProductionSchema), { add: express_validation_1.Joi.array().items(exports.createMeshProductionDetailSchema).optional().default([]), update: express_validation_1.Joi.array().items(exports.updateMeshProductionDetailSchema).optional().default([]), delete: express_validation_1.Joi.array().items(express_validation_1.Joi.number()).optional().default([]), raw_materials_add: express_validation_1.Joi.array().items(exports.createRawMaterialSchema).optional().default([]), raw_materials_update: express_validation_1.Joi.array().items(exports.updateRawMaterialSchema).optional().default([]), raw_materials_delete: express_validation_1.Joi.array().items(express_validation_1.Joi.number()).optional().default([]) }));
// Validator
exports.productionValidator = {
    create: {
        body: (0, wrap_schema_helper_1.wrapSchema)(express_validation_1.Joi.object({ type: express_validation_1.Joi.string().valid(app_constant_1.ProductionType).required() })
            .when(express_validation_1.Joi.object({ type: express_validation_1.Joi.string().valid(app_constant_1.ProductionType.MESH) }), {
            then: exports.createMeshProductionSchema,
        })
            .when(express_validation_1.Joi.object({ type: express_validation_1.Joi.string().valid(app_constant_1.ProductionType.NORMAL) }), {
            then: exports.createProductionSchema,
        })),
    },
    update: {
        params: (0, wrap_schema_helper_1.wrapSchema)(express_validation_1.Joi.object({
            id: express_validation_1.Joi.number().required(),
        })),
        body: (0, wrap_schema_helper_1.wrapSchema)(express_validation_1.Joi.object({ type: express_validation_1.Joi.string().valid(app_constant_1.ProductionType).required() })
            .when(express_validation_1.Joi.object({ type: express_validation_1.Joi.string().valid(app_constant_1.ProductionType.MESH) }), {
            then: exports.updateMeshProductionSchema,
        })
            .when(express_validation_1.Joi.object({ type: express_validation_1.Joi.string().valid(app_constant_1.ProductionType.NORMAL) }), {
            then: exports.createMeshProductionSchema,
        })),
    },
    queryFilter: {
        query: (0, wrap_schema_helper_1.wrapSchema)((0, wrap_schema_helper_1.extendFilterQuery)(common_validator_1.queryFilter.query, {
            type: express_validation_1.Joi.string().optional().allow(null, ''),
        })),
    },
};
