import { extendFilterQuery, wrapSchema } from '@common/helpers/wrap-schema.helper';
import { Joi, schema } from 'express-validation';
import { IBillOfMaterial, IBillOfMaterialDetails } from '@common/interfaces/bill-of-material.interface';
import { ObjectSchema } from 'joi/lib';
import { queryFilter as baseQueryFilter } from './common.validator';
import { IFinanceRecord } from '@common/interfaces/finance-record.interface';
import { FinanceRecordType } from '@config/app.constant';
import { values } from 'lodash';

export const create: schema = {
    body: wrapSchema(
        Joi.object<IFinanceRecord>({
            code: Joi.string().optional().allow(null, ''),
            time_at: Joi.string().isoDate().optional().allow(null),
            description: Joi.string().optional().allow(null, ''),
            payment_method: Joi.string().optional().allow(null, ''),
            amount: Joi.number().optional().allow(null),
            counterparty_name: Joi.string().optional().allow(null, ''),
            counterparty_address: Joi.string().optional().allow(null, ''),
            type: Joi.string()
                .valid(...values(FinanceRecordType))
                .optional()
                .allow(null, ''),
            attached_documents: Joi.string().optional().allow(null, ''),    
            files: Joi.array().items(Joi.string().uri()).required(),
            partner_id: Joi.number().optional(),
            employee_id: Joi.number().optional(),
            organization_id: Joi.number().optional(),

            // order_id: Joi.number().optional(),
            // payment_request_id: Joi.number().optional(),
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
        Joi.object<IFinanceRecord>({
            code: Joi.string().optional().allow(null, ''),
            time_at: Joi.string().isoDate().optional().allow(null),
            description: Joi.string().optional(),
            payment_method: Joi.string().optional(),
            amount: Joi.number().optional(),
            counterparty_name: Joi.string().optional(),
            counterparty_address: Joi.string().optional(),
            type: Joi.string()
                .valid(...values(FinanceRecordType))
                .optional()
                .allow(null, ''),
            attached_documents: Joi.string().optional(),
            files: Joi.array().items(Joi.string().uri()).required(),
            partner_id: Joi.number().optional(),
            employee_id: Joi.number().optional(),
            organization_id: Joi.number().optional(),

            // order_id: Joi.number().optional(),
            // payment_request_id: Joi.number().optional(),
        }),
    ),
};

export const queryFilter: schema = {
    query: wrapSchema(extendFilterQuery(baseQueryFilter.query as ObjectSchema<any>, {})),
};
