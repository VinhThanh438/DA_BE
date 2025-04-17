import { wrapSchema } from '@common/helpers/wrap-schema.helper';
import { ICreateBank, IUpdateBank } from '@common/interfaces/bank.interface';
import { Joi, schema } from 'express-validation';
import { values } from 'lodash';

export const createBank = {
    body: wrapSchema(
        Joi.object<ICreateBank>({
            bank: Joi.string().required(),
            account_number: Joi.string().optional().allow(null, ''),
            name: Joi.string().required(),
            partner_id: Joi.number().optional().allow(null),
        }),
    ),
};

export const updateBank = {
    body: wrapSchema(
        Joi.object<IUpdateBank>({
            bank: Joi.string().optional(),
            account_number: Joi.string().optional().allow(null, ''),
            name: Joi.string().optional(),
        }),
    ),
};
