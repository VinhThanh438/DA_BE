import { extendFilterQuery, wrapSchema } from '@common/helpers/wrap-schema.helper';
import { queryFilter as baseQueryFilter, detailsSchema } from './common.validator';
import { QuotationStatus, QuotationType } from '@config/app.constant';
import { ICommission } from '@common/interfaces/commission.interface';
import { ICommonDetails } from '@common/interfaces/common.interface';
import { IQuotation } from '@common/interfaces/quotation.interface';
import { Joi, schema } from 'express-validation';
import { ObjectSchema } from 'joi';
import { values } from 'lodash';
import { IFacilityOrder } from '@common/interfaces/facility-order.interface';

const commissionSchema = {
    quotation_request_detail_id: Joi.number().optional(),
    representative_id: Joi.number().required(),
    price: Joi.number().optional().allow(null, ''),
    price_vat: Joi.number().optional().allow(null, ''),
    quantity: Joi.number().optional().allow(null, ''),
    quantity_vat: Joi.number().optional().allow(null, ''),
    note: Joi.string().optional().allow(null, ''),
    total_quantity: Joi.number().optional().allow(null, ''),
    origin_price: Joi.number().optional().allow(null, ''),
    key: Joi.string().optional().allow(null, ''),
};

export const FacilityOrderBody: Record<keyof IFacilityOrder, any> = {
    id: Joi.number().optional(),
    code: Joi.string().optional().allow(null, ''),
    status: Joi.string().optional().allow(null, ''),
    quantity: Joi.number().optional().allow(null, ''),
    price: Joi.number().optional().allow(null, ''),
    vat: Joi.number().optional().allow(null, ''),
    facility_type: Joi.string().optional().allow(null, ''),
    files: Joi.array().items(Joi.string()).optional().allow(null, '').default([]),
    note: Joi.string().optional().allow(null, ''),
    rejected_reason: Joi.string().optional().allow(null, ''),
    current_price: Joi.number().optional().allow(null, ''),
    temp_cost: Joi.number().optional().allow(null, ''),
    real_quantity: Joi.number().optional().allow(null, ''),
    real_price: Joi.number().optional().allow(null, ''),
    main_quantity: Joi.number().optional().allow(null, ''),
    facility_id: Joi.number().required(),
    quotation_id: Joi.number().optional().allow(null, ''),
    commissions: Joi.array().items(Joi.object<ICommission>(commissionSchema)).optional().default([]),
    commissions_add: Joi.array().items(Joi.object<ICommission>(commissionSchema)).optional().default([]),
    commissions_update: Joi.array()
        .items(
            Joi.object<ICommission>({
                ...commissionSchema,
                id: Joi.number().required(),
            }),
        )
        .optional()
        .default([]),
    commissions_delete: Joi.array().items(Joi.number()).optional().default([]),
    invoice_id: Joi.number().optional().allow(null, ''),
};

const QuotationBody = {
    partner_id: Joi.number().required(),
    organization_id: Joi.number().optional(),
    code: Joi.string().optional().allow(null, '').max(100),
    time_at: Joi.isoDateTz().optional().allow(null),
    expired_date: Joi.string().optional().allow(null, ''),
    note: Joi.string().allow(null, '').max(1000),
    employee_id: Joi.number().optional(),
    purchase_request_id: Joi.number().optional(),
    quotation_request_id: Joi.number().optional(),
    status: Joi.string()
        .valid(...values(QuotationStatus))
        .optional(),
    files: Joi.array().items(Joi.string()).optional().allow(null, '').default([]),
};

const quotationCustomerDetail = {
    ...detailsSchema,
    material_id: Joi.number().required(), // vật tư chính
    current_price: Joi.number().required(), // giá bình quân hiện tại
    temp_cost: Joi.number().required(), // chi phí tạm
    real_quantity: Joi.number().required(), // số lượng thực tế
    real_price: Joi.number().required(), // giá thực tế
    main_quantity: Joi.number().optional().allow(null, ''),

    commissions: Joi.array().items(Joi.object<ICommission>(commissionSchema)).optional().default([]),

    commissions_add: Joi.array().items(Joi.object<ICommission>(commissionSchema)).optional().default([]),
    commissions_update: Joi.array()
        .items(
            Joi.object<ICommission>({
                ...commissionSchema,
                id: Joi.number().required(),
            }),
        )
        .optional()
        .default([]),
    commissions_delete: Joi.array().items(Joi.number()).optional().default([]),
};

const CustomerQuotationBody = {
    ...QuotationBody,
    product_quality: Joi.string().optional().allow(null, ''), // chất lượng sản phẩm
    delivery_location: Joi.string().optional().allow(null, ''), // địa điểm giao hàng
    delivery_method: Joi.string().optional().allow(null, ''), // phương thức giao hàng
    delivery_time: Joi.string().optional().allow(null, ''), // thời gian giao hàng
    payment_note: Joi.string().optional().allow(null, ''), // ghi chú thanh toán
    additional_note: Joi.string().optional().allow(null, ''), // ghi chú thêm
    detail_note: Joi.string().optional().allow(null, ''), // ghi chú thêm
    files_add: Joi.array().items(Joi.string()).optional().allow(null, '').default([]),
    files_delete: Joi.array().items(Joi.string()).optional().allow(null, '').default([]),
    type: Joi.string()
        .required()
        .valid(...values(QuotationType)),
    details: Joi.array().items(Joi.object<ICommonDetails>(quotationCustomerDetail)).optional().default([]),
    add: Joi.array().items(Joi.object<ICommonDetails>(quotationCustomerDetail)).optional().default([]),
    update: Joi.array()
        .items(
            Joi.object<ICommonDetails>({
                ...quotationCustomerDetail,
                id: Joi.number().required(),
            }),
        )
        .optional()
        .default([]),
    delete: Joi.array().items(Joi.number()).optional().default([]),

    facility_orders: Joi.array().items(Joi.object<IFacilityOrder>(FacilityOrderBody)).optional().default([]),

    facility_order_add: Joi.array().items(Joi.object<IFacilityOrder>(FacilityOrderBody)).optional().default([]),

    facility_order_update: Joi.array().items(Joi.object<IFacilityOrder>(FacilityOrderBody)).optional().default([]),

    facility_order_delete: Joi.array().items(Joi.number()).optional().default([]),

    shipping_plans: Joi.array()
        .items(
            Joi.object({
                price: Joi.number().optional().allow(null, ''),
                vat: Joi.number().optional().allow(null, ''),
                quantity: Joi.number().optional().allow(null, ''),
                note: Joi.string().optional().allow(null, ''),
                partner_id: Joi.number().optional().allow(null, ''), // id đối tác vận chuyển
                material_id: Joi.number().optional(), // vật tư chính
                current_price: Joi.number().optional(), // giá bình quân hiện tại
                temp_cost: Joi.number().optional(), // chi phí tạm
                real_quantity: Joi.number().optional(), // số lượng thực tế
                real_price: Joi.number().optional(), // giá thực tế
                main_quantity: Joi.number().optional().allow(null, ''),
                facility_id: Joi.number().required(), // id cơ sở vật chất
                facility_type: Joi.string().optional().allow(null, ''),
            }),
        )
        .optional()
        .default([]),

    shipping_plans_add: Joi.array()
        .items(
            Joi.object({
                price: Joi.number().optional().allow(null, ''),
                vat: Joi.number().optional().allow(null, ''),
                quantity: Joi.number().optional().allow(null, ''),
                note: Joi.string().optional().allow(null, ''),
                partner_id: Joi.number().optional().allow(null, ''), // id đối tác vận chuyển
                // quotation_id: Joi.number().required(),
                material_id: Joi.number().optional(), // vật tư chính
                current_price: Joi.number().optional(), // giá bình quân hiện tại
                temp_cost: Joi.number().optional(), // chi phí tạm
                real_quantity: Joi.number().optional(), // số lượng thực tế
                real_price: Joi.number().optional(), // giá thực tế
                main_quantity: Joi.number().optional().allow(null, ''),
                facility_id: Joi.number().optional(), // id cơ sở vật chất
                facility_type: Joi.string().optional().allow(null, ''),
            }),
        )
        .optional()
        .default([]),
    shipping_plans_update: Joi.array()
        .items(
            Joi.object({
                id: Joi.number().required(),
                price: Joi.number().optional().allow(null, ''),
                vat: Joi.number().optional().allow(null, ''),
                quantity: Joi.number().optional().allow(null, ''),
                note: Joi.string().optional().allow(null, ''),
                partner_id: Joi.number().optional().allow(null, ''), // id đối tác vận chuyển
                // quotation_id: Joi.number().required(),
                material_id: Joi.number().optional(), // vật tư chính
                current_price: Joi.number().optional(), // giá bình quân hiện tại
                temp_cost: Joi.number().optional(), // chi phí tạm
                real_quantity: Joi.number().optional(), // số lượng thực tế
                real_price: Joi.number().optional(), // giá thực tế
                main_quantity: Joi.number().optional().allow(null, ''),
                facility_id: Joi.number().optional(), // id cơ sở vật chất
                facility_type: Joi.string().optional().allow(null, ''),
            }),
        )
        .optional()
        .default([]),
    shipping_plans_delete: Joi.array().items(Joi.number()).optional().default([]),
};

const SupplierQuotationBody = {
    organization_name: Joi.string().required(),
    // organization_id: Joi.number().required(),
    tax: Joi.string().required(),
    name: Joi.string().required(),
    phone: Joi.string().required(),
    email: Joi.string().optional().allow(null, ''),
    address: Joi.string().optional().allow(null, ''),
    message: Joi.string().optional().allow(null, ''),
    files: Joi.array().items(Joi.string()).optional().allow(null, '').default([]),
    quotation_files: Joi.array().items(Joi.string()).optional().allow(null, '').default([]),

    purchase_request_id: Joi.number().optional().allow(null, ''),
    employee_id: Joi.number().optional().allow(null, ''),

    detail_ids: Joi.array().items(Joi.number()).optional().allow(null, '').default([]),
};

export const create: schema = {
    body: wrapSchema(
        Joi.object({
            type: Joi.string()
                .valid(...values(QuotationType))
                .required(),
        }).when(Joi.object({ type: Joi.valid(QuotationType.SUPPLIER) }).unknown(), {
            then: SupplierQuotationBody,
            otherwise: CustomerQuotationBody,
        }),
    ),
};
export const approve: schema = {
    params: wrapSchema(
        Joi.object({
            id: Joi.number().required(),
        }),
    ),
    body: wrapSchema(
        Joi.object({
            type: Joi.string()
                .valid(...values(QuotationType))
                .optional()
                .allow(null, ''),
            status: Joi.string()
                .valid(...values([QuotationStatus.REJECTED, QuotationStatus.CONFIRMED]))
                .required(),
        }).when(
            Joi.object({
                status: Joi.valid(QuotationStatus.REJECTED),
            }).unknown(),
            {
                then: Joi.object({
                    rejected_reason: Joi.string().required(),
                }),
                otherwise: Joi.object({}),
            },
        ),
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
                .required()
                .valid(...values(QuotationType)),
            isMain: Joi.boolean().optional().default(false),
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
            employeeIds: Joi.alternatives()
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

export const updateEntity: schema = {
    params: wrapSchema(
        Joi.object({
            id: Joi.number().required(),
        }),
    ),
    body: wrapSchema(
        Joi.object<IQuotation>({
            ...QuotationBody,

            add: Joi.array().items(Joi.object(detailsSchema)).optional().default([]),

            update: Joi.array().items(Joi.object(detailsSchema)).optional().default([]),

            delete: Joi.array().items(Joi.number()).optional().default([]),
        }),
    ),
};
