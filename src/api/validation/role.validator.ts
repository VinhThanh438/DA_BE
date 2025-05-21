import { wrapSchema } from '@common/helpers/wrap-schema.helper';
import { IRole } from '@common/interfaces/role.interface';
import { schema } from 'express-validation/lib';
import Joi from 'joi/lib';

export const create: schema = {
    body: wrapSchema(
        Joi.object<IRole>({
            name: Joi.string().trim().required().max(255),
        }),
    ),
};

export const update: schema = {
    body: wrapSchema(
        Joi.object<IRole>({
            name: Joi.string().trim().optional().max(255),
        }),
    ),
    params: wrapSchema(
        Joi.object({
            id: Joi.number().required(),
        }),
    ),
};

export const updatePermission: schema = {
    body: wrapSchema(
        Joi.object<IRole>({
            permissions: Joi.object().optional(),
        }),
    ),
    params: wrapSchema(
        Joi.object({
            id: Joi.number().required(),
        }),
    ),
};