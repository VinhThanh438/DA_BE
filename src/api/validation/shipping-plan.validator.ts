import { wrapSchema } from '@common/helpers/wrap-schema.helper';
import { schema } from 'express-validation/lib';
import Joi from 'joi';
import { IShippingPlan } from '@common/interfaces/shipping-plan.interface';
import { values } from 'lodash';
import { ShippingPlanStatus } from '@config/app.constant';

export const create: schema = {
    body: wrapSchema(
        Joi.object<IShippingPlan>({
            id: Joi.number().optional().allow(null, ''),
            price: Joi.number().optional().allow(null, ''),
            quantity: Joi.number().optional().allow(null, ''),
            status: Joi.string()
                .valid(...values(ShippingPlanStatus))
                .optional()
                .allow(null, ''),
            note: Joi.string().optional().allow(null, ''),

            order_id: Joi.number().optional().allow(null, ''),
            partner_id: Joi.number().optional().allow(null, ''),
        }),
    ),
};

export const update: schema = {
    params: wrapSchema(
        Joi.object({
            id: Joi.number().required(),
        }),
    ),
    body: create.body,
};
