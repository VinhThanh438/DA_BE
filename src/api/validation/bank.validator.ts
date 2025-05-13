import { wrapSchema } from '@common/helpers/wrap-schema.helper';
import { IBank } from '@common/interfaces/bank.interface';
import { Joi } from 'express-validation';

export const create = {
    body: wrapSchema(
        Joi.object<IBank>({
            bank: Joi.string().required(),
            account_number: Joi.string().optional().allow(null, ''),
            name: Joi.string().required(),
            partner_id: Joi.number().optional().allow(null),
        }),
    ),
};

export const update = {
    body: wrapSchema(
        Joi.object<IBank>({
            bank: Joi.string().optional(),
            account_number: Joi.string().optional().allow(null, ''),
            name: Joi.string().optional(),
        }),
    ),
};
