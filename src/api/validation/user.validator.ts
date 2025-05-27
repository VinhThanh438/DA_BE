import { wrapSchema } from '@common/helpers/wrap-schema.helper';
import { IUserRole } from '@common/interfaces/role.interface';
import { Joi, schema } from 'express-validation';

export const createUser: schema = {
    body: wrapSchema(
        Joi.object({
            username: Joi.string().required().min(1).max(50),
            password: Joi.string().required().min(6).max(45),
            email: Joi.string().optional().allow(null, '').min(6).max(45),
            employee_id: Joi.number().required(),
            user_roles: Joi.array()
                .items(
                    Joi.object<IUserRole>({
                        role_id: Joi.number().required(),
                        organization_id: Joi.number().required(),
                        key: Joi.string().allow(null, '').optional(),
                    }),
                )
                .optional()
                .default([]),
        }),
    ),
};

export const updateUser: schema = {
    params: Joi.object({
        id: Joi.number().required(),
    }),
    body: wrapSchema(
        Joi.object({
            username: Joi.string().required().min(1).max(50),
            password: Joi.string().optional().min(6).max(45),
            email: Joi.string().optional().allow(null, '').min(6).max(45),
            employee_id: Joi.number().required(),
            user_roles: Joi.array()
                .items(
                    Joi.object<IUserRole>({
                        role_id: Joi.number().optional(),
                        organization_id: Joi.number().optional(),
                        key: Joi.string().allow(null, '').optional(),
                    }),
                )
                .optional()
                .default([]),
        }),
    ),
};

export const filterUser: schema = {
    query: wrapSchema(
        Joi.object({
            page: Joi.number().optional().min(1).default(1),
            size: Joi.number().optional().min(1).default(10),
            // keyword: Joi.string().optional().allow(null, ''),
        }),
    ),
};

export const getUserById: schema = {
    params: Joi.object({
        id: Joi.number().required(),
    }),
};
