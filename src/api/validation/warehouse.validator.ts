import { wrapSchema } from '@common/helpers/wrap-schema.helper';
import { IWarehouse } from '@common/interfaces/warehouse.interface';
import { Joi, schema } from 'express-validation';

export const createAndUpdate: schema = {
    body: wrapSchema(
        Joi.object<IWarehouse>({
            name: Joi.string().required().min(1).max(255),
            code: Joi.string().optional().allow(null, '').min(1).max(100),
            phone: Joi.string().optional().allow(null, '').max(20),
            address: Joi.string().optional().allow(null, '').max(255),
            note: Joi.string().optional().allow(null, '').max(1000),
            employee_id: Joi.number().optional().allow(null, ''),
        }),
    ),
};
