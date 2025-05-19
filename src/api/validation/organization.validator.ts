import { extendFilterQuery, wrapSchema } from '@common/helpers/wrap-schema.helper';
import { ICreateOrganization } from '@common/interfaces/company.interface';
import { OrganizationType } from '@config/app.constant';
import { Joi, schema } from 'express-validation';
import { ObjectSchema } from 'joi';
import { values } from 'lodash';
import { queryFilter as baseQueryFilter } from './common.validator';

export const queryFilter: schema = {
    query: wrapSchema(
        extendFilterQuery(baseQueryFilter.query as ObjectSchema<any>, {
            parentId: Joi.number().optional().allow(null, ''),
        }),
    ),
};

export const create: schema = {
    body: wrapSchema(
        Joi.object<ICreateOrganization>({
            name: Joi.string().required().min(1).max(300),
            code: Joi.string().optional().allow(null, '').min(1).max(100),
            logo: Joi.string().optional().allow(null, ''),
            industry: Joi.string().optional().allow(null, ''),
            responsibility: Joi.string().optional().allow(null, '').min(1).max(100),
            establishment: Joi.string().optional().allow(null, '').min(1).max(500),
            files: Joi.array().items(Joi.string()).optional().allow(null, '').default([]),
            type: Joi.string()
                .required()
                .valid(...values([OrganizationType.COMPANY, OrganizationType.DEPARTMENT, OrganizationType.BRANCH])),
            parent_id: Joi.number().required(),
            leader_id: Joi.number().optional().allow(null, ''),
            address: Joi.string().optional().allow(null, '').min(1).max(500),
            phone: Joi.string().optional().allow(null, '').min(1).max(100),
            hotline: Joi.string().optional().allow(null, '').min(1).max(100),
            email: Joi.string().optional().allow(null, '').email().min(1).max(100),
            website: Joi.string().optional().allow(null, '').min(1).max(100),
            tax_code: Joi.string().optional().allow(null, '').min(1).max(100),
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
            code: Joi.string().optional().allow(null, '').min(1).max(100),
            logo: Joi.string().optional().allow(null, ''),
            industry: Joi.string().optional().allow(null, ''),
            responsibility: Joi.string().optional().allow(null, '').min(1).max(100),
            establishment: Joi.string().optional().allow(null, '').min(1).max(500),
            files: Joi.array().items(Joi.string()).optional().allow(null, '').default([]),
            type: Joi.string()
                .required()
                .valid(...values([OrganizationType.COMPANY, OrganizationType.DEPARTMENT])),
            parent_id: Joi.number().required(),
            leader_id: Joi.number().optional().allow(null, ''),
            address: Joi.string().optional().allow(null, '').min(1).max(500),
            phone: Joi.string().optional().allow(null, '').min(1).max(100),
            hotline: Joi.string().optional().allow(null, '').min(1).max(100),
            email: Joi.string().optional().allow(null, '').email().min(1).max(100),
            website: Joi.string().optional().allow(null, '').min(1).max(100),
            tax_code: Joi.string().optional().allow(null, '').min(1).max(100),
        }),
    ),
};
