import { wrapSchema } from '@common/helpers/wrap-schema.helper';
import { Joi, schema } from 'express-validation';
import { values } from 'lodash';
import { ContractStatus, ContractType } from '@config/app.constant';
import { IContract } from '@common/interfaces/contract.interface';
import { detailsSchema } from './common.validator';

export const create: schema = {
    body: wrapSchema(
        Joi.object<IContract>({
            code: Joi.string().optional().allow(null, '').max(100),
            tax: Joi.string().optional().allow(null, '').max(20),
            note: Joi.string().optional().allow(null, ''),
            time_at: Joi.string().isoDate().optional().allow(null),
            contract_date: Joi.string().isoDate().optional().allow(null),
            delivery_date: Joi.string().isoDate().optional().allow(null),

            partner_id: Joi.number().required(),
            employee_id: Joi.number().optional(),
            organization_id: Joi.number().optional(),

            status: Joi.string()
                .valid(...values(ContractStatus))
                .optional()
                .allow(null, ''),
            type: Joi.string()
                .valid(...values(ContractType))
                .optional()
                .allow(null, ''),
            files: Joi.array().items(Joi.string()).optional().allow(null, '').default([]),

            details: Joi.array().items(Joi.object(detailsSchema)).optional().default([]),
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
        Joi.object<IContract>({
            code: Joi.string().optional().allow(null, '').max(100),
            tax: Joi.string().optional().allow(null, '').max(20),
            note: Joi.string().optional().allow(null, ''),
            time_at: Joi.string().isoDate().optional().allow(null),
            delivery_date: Joi.string().isoDate().optional().allow(null),
            contract_date: Joi.string().isoDate().optional().allow(null),

            partner_id: Joi.number().required(),
            employee_id: Joi.number().optional(),
            organization_id: Joi.number().optional(),

            status: Joi.string()
                .valid(...values(ContractStatus))
                .optional()
                .allow(null, ''),

            files: Joi.array().items(Joi.string()).optional().allow(null, '').default([]),

            details: Joi.array().items(detailsSchema).optional().default([]),
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
        Joi.object<IContract>({
            code: Joi.string().optional().allow(null, '').max(100),
            tax: Joi.string().optional().allow(null, '').max(20),
            note: Joi.string().optional().allow(null, ''),
            time_at: Joi.string().isoDate().optional().allow(null),
            delivery_date: Joi.string().isoDate().optional().allow(null),
            contract_date: Joi.string().isoDate().optional().allow(null),

            partner_id: Joi.number().required(),
            employee_id: Joi.number().optional(),
            organization_id: Joi.number().optional(),

            status: Joi.string()
                .valid(...values(ContractStatus))
                .optional()
                .allow(null, ''),

            files: Joi.array().items(Joi.string()).optional().allow(null, '').default([]),

            add: Joi.array().items(Joi.object(detailsSchema)).optional().default([]),

            update: Joi.array().items(Joi.object(detailsSchema)).optional().default([]),

            delete: Joi.array().items(Joi.number()).optional().default([]),
        }),
    ),
};
