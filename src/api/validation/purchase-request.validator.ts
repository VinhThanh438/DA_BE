import { wrapSchema } from '@common/helpers/wrap-schema.helper';
import { IPurchaseRequest, IPurchaseRequestDetail } from '@common/interfaces/purchase-request.interface';
import { PurchaseRequestStatus } from '@config/app.constant';
import { values } from 'lodash';
import { Joi, schema } from 'express-validation';
import { ICommonDetails } from '@common/interfaces/common.interface';

export const create: schema = {
    body: wrapSchema(
        Joi.object<IPurchaseRequest>({
            code: Joi.string().max(100).optional(),
            status: Joi.string()
                .valid(...Object.values(PurchaseRequestStatus))
                .optional(),
            note: Joi.string().allow(null, '').max(1000).optional(),
            files: Joi.array().items(Joi.string()).optional().allow(null, '').default([]),
            time_at: Joi.string().isoDate().optional().allow(null),

            employee_id: Joi.number().optional(),
            production_id: Joi.number().optional(),
            order_id: Joi.number().optional(),
            organization_id: Joi.number().optional(),

            details: Joi.array()
                .items(
                    Joi.object<IPurchaseRequestDetail>({
                        material_id: Joi.number().required(),
                        unit_id: Joi.number().optional().allow(null, ''),
                        quantity: Joi.number().min(0).required(),
                        note: Joi.string().allow(null, '').max(500),
                        key: Joi.string().allow(null, ''),
                    }),
                )
                .required()
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
        Joi.object<IPurchaseRequest>({
            code: Joi.string().max(100).optional(),
            status: Joi.string()
                .valid(...Object.values(PurchaseRequestStatus))
                .optional(),
            note: Joi.string().allow(null, '').max(1000).optional(),
            // files: Joi.array().items(Joi.string()).optional().allow(null, '').default([]),
            time_at: Joi.string().isoDate().optional().allow(null),

            employee_id: Joi.number().optional(),
            production_id: Joi.number().optional(),
            order_id: Joi.number().optional(),
            organization_id: Joi.number().optional(),

            add: Joi.array()
                .items(
                    Joi.object<IPurchaseRequestDetail>({
                        material_id: Joi.number().optional(),
                        unit_id: Joi.number().optional().allow(null, ''),
                        quantity: Joi.number().min(0).optional(),
                        note: Joi.string().allow(null, '').max(500),
                        key: Joi.string().allow(null, ''),
                    }),
                )
                .optional()
                .default([]),
            update: Joi.array()
                .items(
                    Joi.object<IPurchaseRequestDetail>({
                        id: Joi.number().required(),
                        material_id: Joi.number().optional(),
                        unit_id: Joi.number().optional().allow(null, ''),
                        quantity: Joi.number().min(0).optional(),
                        note: Joi.string().allow(null, '').max(500),
                        key: Joi.string().allow(null, ''),
                    }),
                )
                .optional()
                .default([]),
            delete: Joi.array().items(Joi.number()).optional().default([]),

            files_add: Joi.array().items(Joi.string()).optional().allow(null, '').default([]),
            files_delete: Joi.array().items(Joi.string()).optional().allow(null, '').default([]),
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
            status: Joi.string()
                .valid(...values([PurchaseRequestStatus.REJECTED, PurchaseRequestStatus.CONFIRMED]))
                .required(),
        }).when(
            Joi.object({
                status: Joi.valid(PurchaseRequestStatus.REJECTED),
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
