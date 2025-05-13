import { wrapSchema } from '@common/helpers/wrap-schema.helper';
import { IProduction } from '@common/interfaces/production.interface';
import { Joi, schema } from 'express-validation';

export const create: schema = {
    body: wrapSchema(
        Joi.object<IProduction>({
            code: Joi.string().optional().allow(null, '').max(100),
            time_at: Joi.string().isoDate().optional().allow(null),
            files: Joi.array().items(Joi.string()).optional().allow(null, '').default([]),

            organization_id: Joi.number().optional(),
            order_id: Joi.number().optional(),
            partner_id: Joi.number().required(),
            employee_id: Joi.number().optional(),

            details: Joi.array()
                .items(
                    Joi.object({
                        product_id: Joi.number().required(),
                        quantity: Joi.number().min(0).required(),
                        completion_date: Joi.date().iso().optional(),
                        note: Joi.string().allow(null, '').max(500),
                        key: Joi.string().allow(null, ''),
                    }),
                )
                .min(1)
                .required(),
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
        Joi.object<IProduction>({
            code: Joi.string().optional().allow(null, '').max(100),
            time_at: Joi.string().isoDate().optional().allow(null),
            files: Joi.array().items(Joi.string()).optional().allow(null, '').default([]),

            organization_id: Joi.number().optional(),
            order_id: Joi.number().optional(),
            partner_id: Joi.number().required(),
            employee_id: Joi.number().optional(),

            details: Joi.array()
                .items(
                    Joi.object({
                        product_id: Joi.number().required(),
                        quantity: Joi.number().min(0).required(),
                        completion_date: Joi.date().iso().optional(),
                        note: Joi.string().allow(null, '').max(500),
                        key: Joi.string().allow(null, ''),
                    }),
                )
                .min(1)
                .required(),
        }),
    ),
};
