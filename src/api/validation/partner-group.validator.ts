import { wrapSchema } from '@common/helpers/wrap-schema.helper';
import { values } from 'lodash';
import { Joi, schema } from 'express-validation';
import { PartnerType } from '@config/app.constant';

export const create: schema = {
    body: wrapSchema(
        Joi.object({
            name: Joi.string().required().max(250),
            type: Joi.string()
                .required()
                .valid(...values(PartnerType)),
        }),
    ),
};

export const queryFilter: schema = {
    query: wrapSchema(
        Joi.object({
            type: Joi.string()
                .required()
                .valid(...values(PartnerType)),
            page: Joi.number().optional().allow(null, '').min(1),
            limit: Joi.number().optional().allow(null, '').min(1),
            keyword: Joi.string().optional().allow(null, ''),
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
            name: Joi.string().required().max(250),
            type: Joi.string()
                .required()
                .valid(...values(PartnerType)),
        }),
    ),
};
