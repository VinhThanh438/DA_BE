import { schema, validate } from 'express-validation';

/**
 * Middleware for automatically configuring validation to simplify usage
 * @param schema Joi schema to validate
 */
export const validateRequest = (schema: schema) =>
    validate(schema, {
        context: true,
        // keyByField: true,
    });
