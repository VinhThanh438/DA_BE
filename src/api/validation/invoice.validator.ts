import { wrapSchema } from '@common/helpers/wrap-schema.helper';
import { Joi, schema } from 'express-validation';
import { values } from 'lodash';
import { InvoiceStatus } from '@config/app.constant';
import { IInvoice } from '@common/interfaces/invoice.interface';
import { ICommonDetails } from '@common/interfaces/common.interface';

export const create: schema = {
    body: wrapSchema(
        Joi.object<IInvoice>({
            code: Joi.string().required().max(100),
            payment_method: Joi.string().allow(null, '').max(255).optional(),
            invoice_date: Joi.string().isoDate().optional().allow(null),

            status: Joi.string()
                .valid(...values(InvoiceStatus))
                .optional(),

            files: Joi.array().items(Joi.string()).optional().default([]),

            partner_id: Joi.number().optional().allow(null),
            employee_id: Joi.number().optional().allow(null),
            bank_id: Joi.number().optional().allow(null),
            contract_id: Joi.number().optional().allow(null),
            organization_id: Joi.number().optional().allow(null),

            details: Joi.array()
                .items(
                    Joi.object<ICommonDetails>({
                        product_id: Joi.number().required(),
                        quantity: Joi.number().min(0).required(),
                        price: Joi.number().min(0).required(),
                        discount: Joi.number().min(0).optional().allow('', null).default(0),
                        vat: Joi.number().min(0).optional().allow('', null).default(0),
                        note: Joi.string().allow(null, '').max(500),
                        key: Joi.string().allow(null, ''),
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
        Joi.object<IInvoice>({
            code: Joi.string().required().max(100),
            payment_method: Joi.string().allow(null, '').max(255).optional(),
            invoice_date: Joi.string().isoDate().optional().allow(null),

            status: Joi.string()
                .valid(...values(InvoiceStatus))
                .required(),

            files: Joi.array().items(Joi.string()).optional().default([]),

            partner_id: Joi.number().optional().allow(null),
            employee_id: Joi.number().optional().allow(null),
            bank_id: Joi.number().optional().allow(null),
            contract_id: Joi.number().optional().allow(null),
            organization_id: Joi.number().optional().allow(null),

            details: Joi.array()
                .items(
                    Joi.object<ICommonDetails>({
                        product_id: Joi.number().required(),
                        quantity: Joi.number().min(0).required(),
                        price: Joi.number().min(0).required(),
                        discount: Joi.number().min(0).optional().allow('', null).default(0),
                        vat: Joi.number().min(0).optional().allow('', null).default(0),
                        note: Joi.string().allow(null, '').max(500),
                        key: Joi.string().allow(null, ''),
                    }),
                )
                .optional()
                .default([]),
        }),
    ),
};
