import { wrapSchema } from '@common/helpers/wrap-schema.helper';
import { Joi, schema } from 'express-validation';
import { values } from 'lodash';

export const logIn: schema = {
    body: wrapSchema(
        Joi.object({
            username: Joi.string().required().min(1).max(50),
            password: Joi.string().required().min(6).max(45),
        }),
    ),
};
