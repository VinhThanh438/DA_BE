import { extendFilterQuery, wrapSchema } from '@common/helpers/wrap-schema.helper';
import { values } from 'lodash';
import { Joi, schema } from 'express-validation';
import { PartnerType } from '@config/app.constant';
import { ObjectSchema } from 'joi';
import { queryFilter as baseQueryFilter } from './common.validator';
import { IPartner, IRepresentative } from '@common/interfaces/partner.interface';
import { IBank } from '@common/interfaces/bank.interface';

export const create: schema = {
    body: wrapSchema(
        Joi.object<IPartner>({
            code: Joi.string().optional(),
            name: Joi.string().required().max(255),
            phone: Joi.string().optional().allow(null, '').max(20),
            note: Joi.string().optional().allow(null, '').max(255),
            tax: Joi.string().optional().allow(null, '').max(50),
            address: Joi.string().optional().allow(null, '').max(50),
            representative_name: Joi.string().optional().allow(null, ''),
            representative_phone: Joi.string().optional().allow(null, ''),
            representative_email: Joi.string().optional().allow(null, ''),
            representative_position: Joi.string().optional().allow(null, ''),
            type: Joi.string()
                .valid(...values(PartnerType))
                .optional(),

            clause_id: Joi.number().optional().allow(null),
            employee_id: Joi.number().optional().allow(null),
            partner_group_id: Joi.number().optional().allow(null),

            representatives: Joi.array()
                .items(
                    Joi.object<IRepresentative>({
                        name: Joi.string().optional().allow(null, ''),
                        phone: Joi.string().optional().allow(null, ''),
                        title: Joi.string().optional().allow(null, ''),
                        email: Joi.string().optional().allow(null, ''),
                        salutation: Joi.string().optional().allow(null, ''),
                        key: Joi.string().allow(null, ''),

                        banks: Joi.array()
                            .items(
                                Joi.object<IBank>({
                                    bank: Joi.string().optional().allow(null, ''),
                                    account_number: Joi.string().optional().allow(null, ''),
                                    name: Joi.string().optional().allow(null, ''),
                                    key: Joi.string().allow(null, ''),
                                }),
                            )
                            .optional()
                            .allow(null),
                    }),
                )
                .optional()
                .allow(null),
        }),
    ),
};

export const update: schema = {
    body: wrapSchema(
        Joi.object({
            code: Joi.string().optional(),
            name: Joi.string().required().max(255),
            phone: Joi.string().optional().allow(null, '').max(20),
            address: Joi.string().optional().allow(null, '').max(255),
            note: Joi.string().optional().allow(null, '').max(255),
            tax: Joi.string().optional().allow(null, '').max(50),
            representative_name: Joi.string().optional().allow(null, ''),
            representative_phone: Joi.string().optional().allow(null, ''),
            representative_email: Joi.string().optional().allow(null, ''),
            representative_position: Joi.string().optional().allow(null, ''),

            type: Joi.string()
                .valid(...values(PartnerType))
                .optional(),

            sale_staff_id: Joi.number().optional().allow(null),
            partner_group_id: Joi.number().optional().allow(null),
            emergency_contact_id: Joi.number().optional().allow(null),
            payment_term: Joi.string().optional().allow(null, '').max(255),
            banks: Joi.object({
                add: Joi.array()
                    .items(
                        Joi.object({
                            bank: Joi.string().required(),
                            account_number: Joi.string().required(),
                            name: Joi.string().required(),
                            key: Joi.string().allow(null, ''),
                        }),
                    )
                    .optional(),

                update: Joi.array()
                    .items(
                        Joi.object({
                            bank_id: Joi.number().required(),
                            bank: Joi.string().required(),
                            account_number: Joi.string().required(),
                            name: Joi.string().required(),
                            key: Joi.string().allow(null, ''),
                        }),
                    )
                    .optional(),

                delete: Joi.array()
                    .items(
                        Joi.object({
                            id: Joi.number().required(),
                            key: Joi.string().allow(null, ''),
                        }),
                    )
                    .optional(),
            }),
        }),
    ),
};

export const queryFilter: schema = {
    query: wrapSchema(
        extendFilterQuery(baseQueryFilter.query as ObjectSchema<any>, {
            type: Joi.string()
                .required()
                .valid(...values(PartnerType)),
        }),
    ),
};
