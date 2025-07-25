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
            time_at: Joi.isoDateTz().optional(),
            entry_time: Joi.isoDateTz().optional(),
            exit_time: Joi.isoDateTz().optional(),
            entry_note: Joi.string().allow(null, '').max(1000).optional(),
            exit_note: Joi.string().allow(null, '').max(1000).optional(),
            entry_plate_images: Joi.array().items(Joi.string()).optional().allow(null, ''),
            entry_container_images: Joi.array().items(Joi.string()).optional().allow(null, ''),
            exit_plate_images: Joi.array().items(Joi.string()).optional().allow(null, ''),
            exit_container_images: Joi.array().items(Joi.string()).optional().allow(null, ''),
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
