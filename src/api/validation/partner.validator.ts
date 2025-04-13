import { wrapSchema } from '@common/helpers/wrap-schema.helper';
import { values } from 'lodash';
import { Joi, schema } from 'express-validation';
import { PartnerType } from '@config/app.constant';

export const create: schema = {
    body: wrapSchema(
        Joi.object({
            code: Joi.string().optional(),
            name: Joi.string().required().max(255),
            phone: Joi.string().optional().allow(null, '').max(20),
            address: Joi.string().optional().allow(null, '').max(255),
            note: Joi.string().optional().allow(null, '').max(255),
            tax: Joi.string().optional().allow(null, '').max(50),

            type: Joi.string()
                .valid(...values(PartnerType))
                .required(),

            sale_staff_id: Joi.number().optional().allow(null),
            partner_group_id: Joi.number().optional().allow(null),
            emergency_contact_id: Joi.number().optional().allow(null),

            payment_term: Joi.string().optional().allow(null, '').max(255),
            max_dept_amount: Joi.number().optional().allow(null),
            max_dept_day: Joi.number().optional().allow(null),
        }),
    ),
};