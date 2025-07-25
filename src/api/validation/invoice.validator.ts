import { extendFilterQuery, wrapSchema } from '@common/helpers/wrap-schema.helper';
import { Joi, schema } from 'express-validation';
import { values } from 'lodash';
import { InvoiceType } from '@config/app.constant';
import { IInvoice } from '@common/interfaces/invoice.interface';
import { ObjectSchema } from 'joi/lib';
import { queryFilter as baseQueryFilter } from './common.validator';
import { FacilityOrderBody } from './quotation.validator';

const InvoiceDetail = {
    id: Joi.number().optional().min(1),
    key: Joi.string().allow(null, ''),
    order_detail_id: Joi.number().required(),
    note: Joi.string().optional().allow(null, ''),
};

export const create: schema = {
    body: wrapSchema(
        Joi.object<IInvoice>({
            code: Joi.string().optional().allow(null, '').max(100),
            time_at: Joi.isoDateTz().optional().allow(null),
            invoice_date: Joi.isoDateTz().optional().allow(null),

            files: Joi.array().items(Joi.string()).optional().allow(null, '').default([]),
            note: Joi.string().optional().allow(null, ''),

            organization_id: Joi.number().optional().allow(null),
            order_id: Joi.number().optional().allow(null),
            shipping_plan_id: Joi.number().optional().allow(null),
            facility_id: Joi.number().optional().allow(null),
            type: Joi.string()
                .valid(...values(InvoiceType))
                .optional()
                .allow(null, ''),

            details: Joi.array().items(Joi.object(InvoiceDetail)).optional().default([]),
            facility_orders: Joi.array().items(Joi.object(FacilityOrderBody)).optional(),
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
        Joi.object<IInvoice>({
            code: Joi.string().optional().allow(null, '').max(100),
            time_at: Joi.isoDateTz().optional().allow(null),
            invoice_date: Joi.isoDateTz().optional().allow(null),
            note: Joi.string().optional().allow(null, ''),
            files: Joi.array().items(Joi.string()).optional().allow(null, '').default([]),

            partner_id: Joi.number().optional().allow(null),
            employee_id: Joi.number().optional().allow(null),
            bank_id: Joi.number().optional().allow(null),
            contract_id: Joi.number().optional().allow(null),
            organization_id: Joi.number().optional().allow(null),
            order_id: Joi.number().optional().allow(null),
            shipping_plan_id: Joi.number().optional().allow(null),

            // add: Joi.array().items(Joi.object(InvoiceDetai)).optional().default([]),

            // update: Joi.array().items(Joi.object(InvoiceDetai)).optional().default([]),

            delete: Joi.array().items(Joi.number()).optional().default([]),
        }),
    ),
};

export const queryFilter: schema = {
    query: wrapSchema(
        extendFilterQuery(baseQueryFilter.query as ObjectSchema<any>, {
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
            type: Joi.string()
                .valid(...values(InvoiceType))
                .optional(),
        }),
    ),
};
