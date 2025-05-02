import { wrapSchema } from '@common/helpers/wrap-schema.helper';
import { CodeType } from '@config/app.constant';
import { Joi, schema } from 'express-validation';
import { values } from 'lodash';

export const queryFilter: schema = {
    query: wrapSchema(
        Joi.object({
            page: Joi.number().optional().min(1),
            size: Joi.number().optional().min(1),
            keyword: Joi.string().optional().allow(null, ''),
        }),
    ),
};

export const queryById: schema = {
    params: wrapSchema(
        Joi.object({
            id: Joi.number().required(),
        }),
    ),
};

export const getCode: schema = {
    query: wrapSchema(
        Joi.object({
            type: Joi.string().required().valid(...values(CodeType))
        })
    )
}