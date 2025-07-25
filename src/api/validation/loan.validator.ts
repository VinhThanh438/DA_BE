import { extendFilterQuery, wrapSchema } from '@common/helpers/wrap-schema.helper';
import { ILoan } from '@common/interfaces/loan.interface';
import { queryFilter as baseQueryFilter } from './common.validator';
import { Joi, schema } from 'express-validation';
import { ObjectSchema } from 'joi';
import { LoanStatus } from '@config/app.constant';
import { values } from 'lodash';

const LoanBody = {
    account_number: Joi.string().required(),
    disbursement_date: Joi.isoDateTz().optional().allow(null),
    interest_calculation_date: Joi.isoDateTz().optional().allow(null),
    payment_day: Joi.number().optional().allow(null),
    term: Joi.number().optional().allow(null),
    amount: Joi.number().optional().allow(null),
    interest_rate: Joi.number().optional().allow(null),
    current_debt: Joi.number().optional().allow(null),
    note: Joi.string().optional().allow(null, ''),

    bank_id: Joi.number(),
    partner_id: Joi.number().optional(),
    invoice_id: Joi.number().optional(),
    order_id: Joi.number().optional(),
    order: Joi.object().optional(),
};

export const create: schema = {
    body: wrapSchema(Joi.object<ILoan>(LoanBody)),
};

export const update: schema = {
    params: wrapSchema(
        Joi.object({
            id: Joi.number().required(),
        }),
    ),
    body: create.body,
};

export const queryFilter: schema = {
    query: wrapSchema(
        extendFilterQuery(baseQueryFilter.query as ObjectSchema<any>, {
            status: Joi.string()
                .optional()
                .valid(...values(LoanStatus)),
            bank: Joi.string().optional().allow(null, ''),
        }),
    ),
};
