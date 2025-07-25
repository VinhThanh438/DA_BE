import { extendFilterQuery, wrapSchema } from '@common/helpers/wrap-schema.helper';
import { IBank } from '@common/interfaces/bank.interface';
import { Joi, schema } from 'express-validation';
import { ObjectSchema } from 'joi';
import { queryFilter as baseQueryFilter } from './common.validator';
import { values } from 'lodash';
import { BankType } from '@config/app.constant';
import { z } from 'zod';

export const create = {
    body: wrapSchema(
        Joi.object<IBank>({
            bank: Joi.string().required(),
            account_number: Joi.string().optional().allow(null, ''),
            name: Joi.string().optional().allow(null, ''),
            description: Joi.string().optional().allow(null, ''),
            code: Joi.string().optional().allow(null, ''),
            balance: Joi.number().optional().allow(null),
            type: Joi.string()
                .valid(...values(BankType))
                .optional()
                .allow(null, ''),
            partner_id: Joi.number().optional().allow(null),
            organization_id: Joi.number().optional().allow(null),
        }),
    ),
};

export const update = {
    body: wrapSchema(
        Joi.object<IBank>({
            bank: Joi.string().optional(),
            account_number: Joi.string().optional().allow(null, ''),
            name: Joi.string().optional(),
            description: Joi.string().optional().allow(null, ''),
            code: Joi.string().optional().allow(null, ''),
            balance: Joi.number().optional().allow(null),
            type: Joi.string()
                .valid(...values(BankType))
                .optional()
                .allow(null, ''),
            partner_id: Joi.number().optional().allow(null),
            organization_id: Joi.number().optional().allow(null),
        }),
    ),
};

export const queryFilter: schema = {
    query: wrapSchema(
        extendFilterQuery(baseQueryFilter.query as ObjectSchema<any>, {
            type: Joi.string()
                .valid(...values(BankType))
                .optional()
                .allow(null, ''),
            partnerId: Joi.number().optional().allow(null, ''),
        }),
    ),
};

export const fundBalance: schema = {
    params: wrapSchema(
        Joi.object({
            id: Joi.number().required(),
        }),
    ),
    query: wrapSchema(extendFilterQuery(baseQueryFilter.query as ObjectSchema<any>, {})),
};

export const transferSchema = z.object({
    bank_id: z.number(),
    amount: z.number(),
    time_at: (z as any).isoDateTz(),
    file: z.string().optional().nullable(),
    note: z.string().optional().nullable(),
    organization_id: z.number().optional(),
});
