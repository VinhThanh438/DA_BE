import { wrapSchema } from '@common/helpers/wrap-schema.helper';
import { CodeType, CommonApproveStatus } from '@config/app.constant';
import { Joi, schema } from 'express-validation';
import { values } from 'lodash';

export const detailsSchema = {
    id: Joi.number().optional().allow(null, ''),
    product_id: Joi.number().optional().allow(null, ''),
    unit_id: Joi.number().optional().allow(null, ''),
    quantity: Joi.number().min(0).optional().allow(null, ''),
    price: Joi.number().min(0).optional().allow(null, ''),
    discount: Joi.number().min(0).optional().allow('', null).default(0),
    vat: Joi.number().min(0).optional().allow('', null).default(0),
    commission: Joi.number().min(0).optional().allow('', null).default(0),
    note: Joi.string().allow(null, '').max(500),
    key: Joi.string().allow(null, ''),
};

export const queryFilter: schema = {
    query: wrapSchema(
        Joi.object({
            page: Joi.number().optional().min(1),
            size: Joi.number().optional().min(1),
            startAt: Joi.string().isoDate().optional().allow(null),
            endAt: Joi.string().isoDate().optional().allow(null),
            keyword: Joi.string().optional().allow(null, ''),
            organization_id: Joi.any().optional().allow(null, ''),
            warehouseIds: Joi.alternatives()
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
            productIds: Joi.alternatives()
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
                .allow(null, '')
        }),
    ),
};

export const queryById: schema = {
    params: wrapSchema(
        Joi.object({
            id: Joi.number().required(),
        }),
    ),
};

export const getCode: schema = {
    query: wrapSchema(
        Joi.object({
            type: Joi.string()
                .required()
                .valid(...values(CodeType)),
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
                .valid(...Object.values([CommonApproveStatus.REJECTED, CommonApproveStatus.CONFIRMED]))
                .required(),
            rejected_reason: Joi.string().when('status', {
                is: CommonApproveStatus.REJECTED,
                then: Joi.string().min(1).required(),
                otherwise: Joi.string().allow(null, '').optional(),
            }),
            files: Joi.array().items(Joi.string()).optional().allow(null, '').default([]),
        }),
    ),
};
