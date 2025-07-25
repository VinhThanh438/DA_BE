import { wrapSchema } from '@common/helpers/wrap-schema.helper';
import { ICreateUnit, IUpdateUnit } from '@common/interfaces/product.interface';
import { schema } from 'express-validation/lib';
import Joi from 'joi/lib';

export const createUnit: schema = {
    body: wrapSchema(
        Joi.object<ICreateUnit>({
            name: Joi.string().trim().required().max(255),
        }),
    ),
};

export const updateUnit: schema = {
    body: wrapSchema(
        Joi.object<IUpdateUnit>({
            name: Joi.string().trim().optional().max(255),
            is_default: Joi.boolean().optional(),
        }),
    ),
    params: wrapSchema(
        Joi.object({
            id: Joi.number().required(),
        }),
    ),
};
