import { ICreateFacility, IUpdateFacility } from '@common/interfaces/facility.interface';
import { extendFilterQuery, wrapSchema } from '@common/helpers/wrap-schema.helper';
import { Joi, schema } from 'express-validation';
import { queryFilter as baseQueryFilter } from './common.validator';
import { ObjectSchema } from 'joi';

export const createFacilitySchema = Joi.object<ICreateFacility>({
    name: Joi.string().required().max(255),
    price: Joi.number().required().min(0),
    code: Joi.string().required().max(100),
    vat: Joi.number().required().min(0).max(100),
    commission: Joi.number().optional().allow(null, '').min(0).max(100),
    image: Joi.string().optional().allow(null, '').max(500),
    note: Joi.string().optional().allow(null, '').max(1000),
    unit_id: Joi.number().required(),
    partner_id: Joi.number().optional().allow(null, ''),
    key: Joi.string().optional().allow(null, '').max(1000),
});

export const updateFacilitySchema = Joi.object<IUpdateFacility>({
    name: Joi.string().optional().max(255),
    price: Joi.number().optional().min(0),
    code: Joi.string().optional().max(100),
    vat: Joi.number().optional().min(0).max(100),
    image: Joi.string().optional().allow(null, '').max(500),
    note: Joi.string().optional().allow(null, '').max(1000),
    unit_id: Joi.number().optional(),
    partner_id: Joi.number().optional().allow(null, ''),
    key: Joi.string().optional().allow(null, '').max(1000),
});

export const queryFilter: schema = {
    query: wrapSchema(extendFilterQuery(baseQueryFilter.query as ObjectSchema<any>, {})),
};

export const create: schema = {
    body: wrapSchema(createFacilitySchema),
};

export const update: schema = {
    params: wrapSchema(
        Joi.object({
            id: Joi.number().required(),
        }),
    ),
    body: wrapSchema(updateFacilitySchema),
};
