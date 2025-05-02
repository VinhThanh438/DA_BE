import Joi from 'joi';

export const wrapSchema = (schema: Joi.ObjectSchema): Joi.ObjectSchema =>
    schema.options({
        abortEarly: false,
        allowUnknown: true,
        stripUnknown: true,
    });

export const extendFilterQuery = (base: Joi.ObjectSchema, extension: Record<string, Joi.Schema>) =>
    base.keys(extension);