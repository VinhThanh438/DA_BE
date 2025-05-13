import { wrapSchema } from '@common/helpers/wrap-schema.helper';
import { CodeType } from '@config/app.constant';
import { Joi, schema } from 'express-validation';
import { values } from 'lodash';

export const detailsSchema = {
    id: Joi.number().optional().allow(null, ''),
    product_id: Joi.number().required(),
    unit_id: Joi.number().optional().allow(null, ''),
    quantity: Joi.number().min(0).required(),
    price: Joi.number().min(0).required(),
    discount: Joi.number().min(0).optional().allow('', null).default(0),
    vat: Joi.number().min(0).optional().allow('', null).default(0),
    commission: Joi.number().min(0).optional().allow('', null).default(0),
    note: Joi.string().allow(null, '').max(500),
    key: Joi.string().allow(null, ''),
};

export const queryFilter: schema = {
    query: wrapSchema(
        Joi.object({
            page: Joi.number().optional().min(1),
            size: Joi.number().optional().min(1),
            startAt: Joi.string().optional().allow(null, ''),
            endAt: Joi.string().optional().allow(null, ''),
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
            type: Joi.string()
                .required()
                .valid(...values(CodeType)),
        }),
    ),
};
