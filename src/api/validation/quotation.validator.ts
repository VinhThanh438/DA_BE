import { wrapSchema } from '@common/helpers/wrap-schema.helper';
import { Joi, schema } from 'express-validation';
import { values } from 'lodash';
import { QuotationStatus, QuotationType } from '@config/app.constant';
import { IQuotation } from '@common/interfaces/quotation.interface';
import { ICommonDetails } from '@common/interfaces/common.interface';

export const create: schema = {
    body: wrapSchema(
        Joi.object<IQuotation>({
            partner_id: Joi.number().required(),
            code: Joi.string().required().max(100),
            time_at: Joi.string().isoDate().optional().allow(null),
            expired_date: Joi.string().isoDate().optional().allow(null),
            note: Joi.string().allow(null, '').max(1000),
            employee_id: Joi.number().optional(),
            status: Joi.string()
                .valid(...values(QuotationStatus))
                .optional(),
            files: Joi.array().items(Joi.string()).optional().default([]),
            details: Joi.array()
                .items(
                    Joi.object<ICommonDetails>({
                        product_id: Joi.number().required(),
                        quantity: Joi.number().min(0).required(),
                        price: Joi.number().min(0).required(),
                        discount: Joi.number().min(0).optional().allow('', null).default(0),
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
        Joi.object<IQuotation>({
            partner_id: Joi.number().required(),
            code: Joi.string().required().max(100),
            time_at: Joi.string().isoDate().optional().allow(null),
            expired_date: Joi.string().isoDate().optional().allow(null),
            note: Joi.string().allow(null, '').max(1000),
            employee_id: Joi.number().optional(),
            status: Joi.string()
                .valid(...values(QuotationStatus))
                .required(),
            files: Joi.array().items(Joi.string()).optional().default([]),
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

export const queryFilter: schema = {
    query: wrapSchema(
        Joi.object({
            type: Joi.string()
                .required()
                .valid(...values(QuotationType)),
            page: Joi.number().optional().allow(null, '').min(1),
            limit: Joi.number().optional().allow(null, '').min(1),
            keyword: Joi.string().optional().allow(null, ''),
        }),
    ),
};
