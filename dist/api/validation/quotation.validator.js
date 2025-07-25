"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateEntity = exports.queryFilter = exports.update = exports.approve = exports.create = exports.FacilityOrderBody = void 0;
const wrap_schema_helper_1 = require("../../common/helpers/wrap-schema.helper");
const common_validator_1 = require("./common.validator");
const app_constant_1 = require("../../config/app.constant");
const express_validation_1 = require("express-validation");
const lodash_1 = require("lodash");
const commissionSchema = {
    quotation_request_detail_id: express_validation_1.Joi.number().optional(),
    representative_id: express_validation_1.Joi.number().required(),
    price: express_validation_1.Joi.number().optional().allow(null, ''),
    price_vat: express_validation_1.Joi.number().optional().allow(null, ''),
    quantity: express_validation_1.Joi.number().optional().allow(null, ''),
    quantity_vat: express_validation_1.Joi.number().optional().allow(null, ''),
    note: express_validation_1.Joi.string().optional().allow(null, ''),
    total_quantity: express_validation_1.Joi.number().optional().allow(null, ''),
    origin_price: express_validation_1.Joi.number().optional().allow(null, ''),
    key: express_validation_1.Joi.string().optional().allow(null, ''),
};
exports.FacilityOrderBody = {
    id: express_validation_1.Joi.number().optional(),
    code: express_validation_1.Joi.string().optional().allow(null, ''),
    status: express_validation_1.Joi.string().optional().allow(null, ''),
    quantity: express_validation_1.Joi.number().optional().allow(null, ''),
    price: express_validation_1.Joi.number().optional().allow(null, ''),
    vat: express_validation_1.Joi.number().optional().allow(null, ''),
    facility_type: express_validation_1.Joi.string().optional().allow(null, ''),
    files: express_validation_1.Joi.array().items(express_validation_1.Joi.string()).optional().allow(null, '').default([]),
    note: express_validation_1.Joi.string().optional().allow(null, ''),
    rejected_reason: express_validation_1.Joi.string().optional().allow(null, ''),
    current_price: express_validation_1.Joi.number().optional().allow(null, ''),
    temp_cost: express_validation_1.Joi.number().optional().allow(null, ''),
    real_quantity: express_validation_1.Joi.number().optional().allow(null, ''),
    real_price: express_validation_1.Joi.number().optional().allow(null, ''),
    main_quantity: express_validation_1.Joi.number().optional().allow(null, ''),
    facility_id: express_validation_1.Joi.number().required(),
    quotation_id: express_validation_1.Joi.number().optional().allow(null, ''),
    commissions: express_validation_1.Joi.array().items(express_validation_1.Joi.object(commissionSchema)).optional().default([]),
    commissions_add: express_validation_1.Joi.array().items(express_validation_1.Joi.object(commissionSchema)).optional().default([]),
    commissions_update: express_validation_1.Joi.array()
        .items(express_validation_1.Joi.object(Object.assign(Object.assign({}, commissionSchema), { id: express_validation_1.Joi.number().required() })))
        .optional()
        .default([]),
    commissions_delete: express_validation_1.Joi.array().items(express_validation_1.Joi.number()).optional().default([]),
    invoice_id: express_validation_1.Joi.number().optional().allow(null, ''),
};
const QuotationBody = {
    partner_id: express_validation_1.Joi.number().required(),
    organization_id: express_validation_1.Joi.number().optional(),
    code: express_validation_1.Joi.string().optional().allow(null, '').max(100),
    time_at: express_validation_1.Joi.isoDateTz().optional().allow(null),
    expired_date: express_validation_1.Joi.string().optional().allow(null, ''),
    note: express_validation_1.Joi.string().allow(null, '').max(1000),
    employee_id: express_validation_1.Joi.number().optional(),
    purchase_request_id: express_validation_1.Joi.number().optional(),
    quotation_request_id: express_validation_1.Joi.number().optional(),
    status: express_validation_1.Joi.string()
        .valid(...(0, lodash_1.values)(app_constant_1.QuotationStatus))
        .optional(),
    files: express_validation_1.Joi.array().items(express_validation_1.Joi.string()).optional().allow(null, '').default([]),
};
const quotationCustomerDetail = Object.assign(Object.assign({}, common_validator_1.detailsSchema), { material_id: express_validation_1.Joi.number().required(), current_price: express_validation_1.Joi.number().required(), temp_cost: express_validation_1.Joi.number().required(), real_quantity: express_validation_1.Joi.number().required(), real_price: express_validation_1.Joi.number().required(), main_quantity: express_validation_1.Joi.number().optional().allow(null, ''), commissions: express_validation_1.Joi.array().items(express_validation_1.Joi.object(commissionSchema)).optional().default([]), commissions_add: express_validation_1.Joi.array().items(express_validation_1.Joi.object(commissionSchema)).optional().default([]), commissions_update: express_validation_1.Joi.array()
        .items(express_validation_1.Joi.object(Object.assign(Object.assign({}, commissionSchema), { id: express_validation_1.Joi.number().required() })))
        .optional()
        .default([]), commissions_delete: express_validation_1.Joi.array().items(express_validation_1.Joi.number()).optional().default([]) });
const CustomerQuotationBody = Object.assign(Object.assign({}, QuotationBody), { product_quality: express_validation_1.Joi.string().optional().allow(null, ''), delivery_location: express_validation_1.Joi.string().optional().allow(null, ''), delivery_method: express_validation_1.Joi.string().optional().allow(null, ''), delivery_time: express_validation_1.Joi.string().optional().allow(null, ''), payment_note: express_validation_1.Joi.string().optional().allow(null, ''), additional_note: express_validation_1.Joi.string().optional().allow(null, ''), detail_note: express_validation_1.Joi.string().optional().allow(null, ''), files_add: express_validation_1.Joi.array().items(express_validation_1.Joi.string()).optional().allow(null, '').default([]), files_delete: express_validation_1.Joi.array().items(express_validation_1.Joi.string()).optional().allow(null, '').default([]), type: express_validation_1.Joi.string()
        .required()
        .valid(...(0, lodash_1.values)(app_constant_1.QuotationType)), details: express_validation_1.Joi.array().items(express_validation_1.Joi.object(quotationCustomerDetail)).optional().default([]), add: express_validation_1.Joi.array().items(express_validation_1.Joi.object(quotationCustomerDetail)).optional().default([]), update: express_validation_1.Joi.array()
        .items(express_validation_1.Joi.object(Object.assign(Object.assign({}, quotationCustomerDetail), { id: express_validation_1.Joi.number().required() })))
        .optional()
        .default([]), delete: express_validation_1.Joi.array().items(express_validation_1.Joi.number()).optional().default([]), facility_orders: express_validation_1.Joi.array().items(express_validation_1.Joi.object(exports.FacilityOrderBody)).optional().default([]), facility_order_add: express_validation_1.Joi.array().items(express_validation_1.Joi.object(exports.FacilityOrderBody)).optional().default([]), facility_order_update: express_validation_1.Joi.array().items(express_validation_1.Joi.object(exports.FacilityOrderBody)).optional().default([]), facility_order_delete: express_validation_1.Joi.array().items(express_validation_1.Joi.number()).optional().default([]), shipping_plans: express_validation_1.Joi.array()
        .items(express_validation_1.Joi.object({
        price: express_validation_1.Joi.number().optional().allow(null, ''),
        vat: express_validation_1.Joi.number().optional().allow(null, ''),
        quantity: express_validation_1.Joi.number().optional().allow(null, ''),
        note: express_validation_1.Joi.string().optional().allow(null, ''),
        partner_id: express_validation_1.Joi.number().optional().allow(null, ''), // id đối tác vận chuyển
        material_id: express_validation_1.Joi.number().optional(), // vật tư chính
        current_price: express_validation_1.Joi.number().optional(), // giá bình quân hiện tại
        temp_cost: express_validation_1.Joi.number().optional(), // chi phí tạm
        real_quantity: express_validation_1.Joi.number().optional(), // số lượng thực tế
        real_price: express_validation_1.Joi.number().optional(), // giá thực tế
        main_quantity: express_validation_1.Joi.number().optional().allow(null, ''),
        facility_id: express_validation_1.Joi.number().required(), // id cơ sở vật chất
        facility_type: express_validation_1.Joi.string().optional().allow(null, ''),
    }))
        .optional()
        .default([]), shipping_plans_add: express_validation_1.Joi.array()
        .items(express_validation_1.Joi.object({
        price: express_validation_1.Joi.number().optional().allow(null, ''),
        vat: express_validation_1.Joi.number().optional().allow(null, ''),
        quantity: express_validation_1.Joi.number().optional().allow(null, ''),
        note: express_validation_1.Joi.string().optional().allow(null, ''),
        partner_id: express_validation_1.Joi.number().optional().allow(null, ''), // id đối tác vận chuyển
        // quotation_id: Joi.number().required(),
        material_id: express_validation_1.Joi.number().optional(), // vật tư chính
        current_price: express_validation_1.Joi.number().optional(), // giá bình quân hiện tại
        temp_cost: express_validation_1.Joi.number().optional(), // chi phí tạm
        real_quantity: express_validation_1.Joi.number().optional(), // số lượng thực tế
        real_price: express_validation_1.Joi.number().optional(), // giá thực tế
        main_quantity: express_validation_1.Joi.number().optional().allow(null, ''),
        facility_id: express_validation_1.Joi.number().optional(), // id cơ sở vật chất
        facility_type: express_validation_1.Joi.string().optional().allow(null, ''),
    }))
        .optional()
        .default([]), shipping_plans_update: express_validation_1.Joi.array()
        .items(express_validation_1.Joi.object({
        id: express_validation_1.Joi.number().required(),
        price: express_validation_1.Joi.number().optional().allow(null, ''),
        vat: express_validation_1.Joi.number().optional().allow(null, ''),
        quantity: express_validation_1.Joi.number().optional().allow(null, ''),
        note: express_validation_1.Joi.string().optional().allow(null, ''),
        partner_id: express_validation_1.Joi.number().optional().allow(null, ''), // id đối tác vận chuyển
        // quotation_id: Joi.number().required(),
        material_id: express_validation_1.Joi.number().optional(), // vật tư chính
        current_price: express_validation_1.Joi.number().optional(), // giá bình quân hiện tại
        temp_cost: express_validation_1.Joi.number().optional(), // chi phí tạm
        real_quantity: express_validation_1.Joi.number().optional(), // số lượng thực tế
        real_price: express_validation_1.Joi.number().optional(), // giá thực tế
        main_quantity: express_validation_1.Joi.number().optional().allow(null, ''),
        facility_id: express_validation_1.Joi.number().optional(), // id cơ sở vật chất
        facility_type: express_validation_1.Joi.string().optional().allow(null, ''),
    }))
        .optional()
        .default([]), shipping_plans_delete: express_validation_1.Joi.array().items(express_validation_1.Joi.number()).optional().default([]) });
const SupplierQuotationBody = {
    organization_name: express_validation_1.Joi.string().required(),
    // organization_id: Joi.number().required(),
    tax: express_validation_1.Joi.string().required(),
    name: express_validation_1.Joi.string().required(),
    phone: express_validation_1.Joi.string().required(),
    email: express_validation_1.Joi.string().optional().allow(null, ''),
    address: express_validation_1.Joi.string().optional().allow(null, ''),
    message: express_validation_1.Joi.string().optional().allow(null, ''),
    files: express_validation_1.Joi.array().items(express_validation_1.Joi.string()).optional().allow(null, '').default([]),
    quotation_files: express_validation_1.Joi.array().items(express_validation_1.Joi.string()).optional().allow(null, '').default([]),
    purchase_request_id: express_validation_1.Joi.number().optional().allow(null, ''),
    employee_id: express_validation_1.Joi.number().optional().allow(null, ''),
    detail_ids: express_validation_1.Joi.array().items(express_validation_1.Joi.number()).optional().allow(null, '').default([]),
};
exports.create = {
    body: (0, wrap_schema_helper_1.wrapSchema)(express_validation_1.Joi.object({
        type: express_validation_1.Joi.string()
            .valid(...(0, lodash_1.values)(app_constant_1.QuotationType))
            .required(),
    }).when(express_validation_1.Joi.object({ type: express_validation_1.Joi.valid(app_constant_1.QuotationType.SUPPLIER) }).unknown(), {
        then: SupplierQuotationBody,
        otherwise: CustomerQuotationBody,
    })),
};
exports.approve = {
    params: (0, wrap_schema_helper_1.wrapSchema)(express_validation_1.Joi.object({
        id: express_validation_1.Joi.number().required(),
    })),
    body: (0, wrap_schema_helper_1.wrapSchema)(express_validation_1.Joi.object({
        type: express_validation_1.Joi.string()
            .valid(...(0, lodash_1.values)(app_constant_1.QuotationType))
            .optional()
            .allow(null, ''),
        status: express_validation_1.Joi.string()
            .valid(...(0, lodash_1.values)([app_constant_1.QuotationStatus.REJECTED, app_constant_1.QuotationStatus.CONFIRMED]))
            .required(),
    }).when(express_validation_1.Joi.object({
        status: express_validation_1.Joi.valid(app_constant_1.QuotationStatus.REJECTED),
    }).unknown(), {
        then: express_validation_1.Joi.object({
            rejected_reason: express_validation_1.Joi.string().required(),
        }),
        otherwise: express_validation_1.Joi.object({}),
    })),
};
exports.update = {
    params: (0, wrap_schema_helper_1.wrapSchema)(express_validation_1.Joi.object({
        id: express_validation_1.Joi.number().required(),
    })),
    body: exports.create.body,
};
exports.queryFilter = {
    query: (0, wrap_schema_helper_1.wrapSchema)((0, wrap_schema_helper_1.extendFilterQuery)(common_validator_1.queryFilter.query, {
        type: express_validation_1.Joi.string()
            .required()
            .valid(...(0, lodash_1.values)(app_constant_1.QuotationType)),
        isMain: express_validation_1.Joi.boolean().optional().default(false),
        supplierIds: express_validation_1.Joi.alternatives()
            .try(express_validation_1.Joi.array().items(express_validation_1.Joi.number()), express_validation_1.Joi.string().custom((value, helpers) => {
            if (!value || value === '')
                return null;
            const ids = value.split(',').map((id) => parseInt(id.trim(), 10));
            if (ids.some((id) => isNaN(id))) {
                return helpers.error('any.invalid');
            }
            return ids;
        }))
            .optional()
            .allow(null, ''),
        employeeIds: express_validation_1.Joi.alternatives()
            .try(express_validation_1.Joi.array().items(express_validation_1.Joi.number()), express_validation_1.Joi.string().custom((value, helpers) => {
            if (!value || value === '')
                return null;
            const ids = value.split(',').map((id) => parseInt(id.trim(), 10));
            if (ids.some((id) => isNaN(id))) {
                return helpers.error('any.invalid');
            }
            return ids;
        }))
            .optional()
            .allow(null, ''),
    })),
};
exports.updateEntity = {
    params: (0, wrap_schema_helper_1.wrapSchema)(express_validation_1.Joi.object({
        id: express_validation_1.Joi.number().required(),
    })),
    body: (0, wrap_schema_helper_1.wrapSchema)(express_validation_1.Joi.object(Object.assign(Object.assign({}, QuotationBody), { add: express_validation_1.Joi.array().items(express_validation_1.Joi.object(common_validator_1.detailsSchema)).optional().default([]), update: express_validation_1.Joi.array().items(express_validation_1.Joi.object(common_validator_1.detailsSchema)).optional().default([]), delete: express_validation_1.Joi.array().items(express_validation_1.Joi.number()).optional().default([]) }))),
};
