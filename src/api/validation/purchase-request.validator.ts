import { wrapSchema } from '@common/helpers/wrap-schema.helper';
import { IPurchaseRequest, IPurchaseRequestDetail } from '@common/interfaces/purchase-request.interface';
import { PurchaseRequestStatus } from '@config/app.constant';
import { Joi, schema } from 'express-validation';

export const create: schema = {
    body: wrapSchema(
        Joi.object<IPurchaseRequest>({
            code: Joi.string().max(100).optional(),
            status: Joi.string()
                .valid(...Object.values(PurchaseRequestStatus))
                .optional(),
            note: Joi.string().allow(null, '').max(1000).optional(),
            files: Joi.array().items(Joi.string()).optional().default([]),

            employee_id: Joi.number().optional(),
            production_id: Joi.number().optional(),
            order_id: Joi.number().optional(),
            organization_id: Joi.number().optional(),

            details: Joi.array()
                .items(
                    Joi.object<IPurchaseRequestDetail>({
                        product_id: Joi.number().required(),
                        quantity: Joi.number().min(0).required(),
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
    body: create.body,
};
