import { extendFilterQuery, wrapSchema } from '@common/helpers/wrap-schema.helper';
import { Joi, schema } from 'express-validation';
import { queryFilter as baseQueryFilter } from './common.validator';
import { ObjectSchema } from 'joi';
import { IGateLog } from '@common/interfaces/gate-log.interface';

export const queryFilter: schema = {
    query: wrapSchema(
        extendFilterQuery(baseQueryFilter.query as ObjectSchema<any>, {
            employee_id: Joi.number().optional(),
            plate: Joi.string().optional().allow(null, ''),
            childrenId: Joi.number().optional(),
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
        Joi.object<IGateLog>({
            time_at: Joi.date().iso().optional(),
            entry_time: Joi.date().iso().optional(),
            exit_time: Joi.date().iso().optional(),
            entry_note: Joi.string().allow(null, '').max(1000).optional(),
            exit_note: Joi.string().allow(null, '').max(1000).optional(),
            entry_plate_image: Joi.string().allow(null, '').max(255).optional(),
            entry_container_image: Joi.string().allow(null, '').max(255).optional(),
            exit_plate_image: Joi.string().allow(null, '').max(255).optional(),
            exit_container_image: Joi.string().allow(null, '').max(255).optional(),
            employee_id: Joi.number().optional(),
        }),
    ),
};

export const assign: schema = {
    params: wrapSchema(
        Joi.object({
            id: Joi.number().required(),
        }),
    ),
    body: wrapSchema(
        Joi.object<IGateLog>({
            employee_id: Joi.number().required(),
            note: Joi.string().allow(null, '').max(1000).optional(),
        }),
    ),
};

export const connect: schema = {
    body: wrapSchema(
        Joi.object({
            children_id: Joi.number().required(),
            parent_id: Joi.number().required(),
        }),
    ),
};