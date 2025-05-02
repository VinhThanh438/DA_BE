import { wrapSchema } from '@common/helpers/wrap-schema.helper';
import { values } from 'lodash';
import { Joi, schema } from 'express-validation';
import { PartnerType } from '@config/app.constant';
import { ICreateBank } from '@common/interfaces/bank.interface';
import { ICreatePartner } from '@common/interfaces/partner.interface';

export const create: schema = {
    body: wrapSchema(
        Joi.object<ICreatePartner>({
            code: Joi.string().optional(),
            name: Joi.string().required().max(255),
            phone: Joi.string().optional().allow(null, '').max(20),
            note: Joi.string().optional().allow(null, '').max(255),
            tax: Joi.string().optional().allow(null, '').max(50),
            bank_accounts: Joi.array()
                .items(
                    Joi.object({
                        bank: Joi.string().required(),
                        account_number: Joi.string().optional().allow(null, ''),
                        name: Joi.string().required(),
                        partner_id: Joi.number().optional().allow(null),
                        key: Joi.string().allow(null, ''),
                    }),
                )
                .optional()
                .min(1),
            clause_id: Joi.number().optional().allow(null),
            type: Joi.string()
                .valid(...values(PartnerType))
                .required(),
            sale_staff_id: Joi.number().optional().allow(null),
            partner_group_id: Joi.number().optional().allow(null),
            emergency_contact_id: Joi.number().optional().allow(null),
            payment_term: Joi.string().optional().allow(null, '').max(255),
            representatives: Joi.array()
                .items(
                    Joi.object({
                        representative_name: Joi.string().optional().allow(null).max(255),
                        representative_phone: Joi.string().optional().allow(null).max(20),
                        representative_title: Joi.string().optional().allow(null).max(100),
                        representative_email: Joi.string().optional().allow(null).max(100),
                    }),
                )
                .optional()
                .allow(null),
            addresses: Joi.array().items(
                Joi.object({
                    address_type: Joi.string().optional().allow(null).max(255),
                    address_name: Joi.string().optional().allow(null).max(255),
                }),
            ),
        }),
    ),
};

export const queryFilter: schema = {
    query: wrapSchema(
        Joi.object({
            type: Joi.string()
                .required()
                .valid(...values(PartnerType)),
            page: Joi.number().optional().allow(null, '').min(1),
            limit: Joi.number().optional().allow(null, '').min(1),
            keyword: Joi.string().optional().allow(null, ''),
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

            type: Joi.string()
                .valid(...values(PartnerType))
                .optional(),

            sale_staff_id: Joi.number().optional().allow(null),
            partner_group_id: Joi.number().optional().allow(null),
            emergency_contact_id: Joi.number().optional().allow(null),
            payment_term: Joi.string().optional().allow(null, '').max(255),
            bank_accounts: Joi.object({
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
