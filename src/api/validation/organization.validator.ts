import { wrapSchema } from '@common/helpers/wrap-schema.helper';
import { ICreateOrganization } from '@common/interfaces/company.interface';
import { OrganizationType } from '@config/app.constant';
import { Joi, schema } from 'express-validation';
import { values } from 'lodash';

export const create: schema = {
    body: wrapSchema(
        Joi.object<ICreateOrganization>({
            name: Joi.string().required().min(1).max(300),
            code: Joi.string().required().min(1).max(100),
            responsibility: Joi.string().optional().allow(null, '').min(1).max(100),
            establishment: Joi.string().optional().allow(null, '').min(1).max(500),
            files: Joi.array().items(Joi.string()).optional().default([]),
            type: Joi.string()
                .required()
                .valid(...values([OrganizationType.COMPANY, OrganizationType.DEPARTMENT])),
            parent_id: Joi.number().required(),
            leader_id: Joi.number().optional().allow(null, ''),
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
        Joi.object({
            name: Joi.string().required().min(1).max(300),
            code: Joi.string().required().min(1).max(100),
            responsibility: Joi.string().optional().allow(null, '').min(1).max(100),
            establishment: Joi.string().optional().allow(null, '').min(1).max(500),
            files: Joi.array().items(Joi.string()).optional().default([]),
            type: Joi.string()
                .required()
                .valid(...values([OrganizationType.COMPANY, OrganizationType.DEPARTMENT])),
            parent_id: Joi.number().required(),
            leader_id: Joi.number().optional().allow(null, ''),
        }),
    ),
};
