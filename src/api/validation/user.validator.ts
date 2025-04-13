import { wrapSchema } from '@common/helpers/wrap-schema.helper';
import { Joi, schema } from 'express-validation';
import { values } from 'lodash';

export const createUser: schema = {
    body: wrapSchema(
        Joi.object({
            username: Joi.string().required().min(1).max(50),
            password: Joi.string().required().min(6).max(45),
        }),
    ),
};

export const updateUser: schema = {
    params: Joi.object({
        id: Joi.number().required(),
    }).unknown(true),
    body: wrapSchema(
        Joi.object({
            username: Joi.string().required().min(1).max(50),
            password: Joi.string().required().min(6).max(45),
            email: Joi.string().required().min(6).max(45),
        }),
    ),
};

export const filterUser: schema = {
    query: wrapSchema(
        Joi.object({
            page: Joi.number().required().min(1),
            size: Joi.number().required().min(1),
            keyword: Joi.string().optional().allow(null, ''),
        }),
    ),
};

export const getUserById: schema = {
    params: Joi.object({
        id: Joi.number().required(),
    }).unknown(true),
};
