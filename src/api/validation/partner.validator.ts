import { extendFilterQuery, wrapSchema } from '@common/helpers/wrap-schema.helper';
import { values } from 'lodash';
import { Joi, schema } from 'express-validation';
import { PartnerType } from '@config/app.constant';
import { ObjectSchema } from 'joi';
import { queryFilter as baseQueryFilter } from './common.validator';
import { IPartner, IRepresentative } from '@common/interfaces/partner.interface';
import { IBank } from '@common/interfaces/bank.interface';

export const queryDebtFilter: schema = {
    query: wrapSchema(
        extendFilterQuery(baseQueryFilter.query as ObjectSchema<any>, {
            partnerId: Joi.number().required(),
        }),
    ),
};

export const queryByConditions: schema = {
    query: wrapSchema(
        Joi.object({
            tax: Joi.string().optional(),
        }),
    ),
};

const PartnerBody = {
    id: Joi.number().optional().allow(null, ''),
    code: Joi.string().optional(),
    name: Joi.string().optional().allow(null, ''),
    phone: Joi.string().optional().allow(null, '').max(20),
    note: Joi.string().optional().allow(null, '').max(500),
    tax: Joi.string().optional().allow(null, '').max(50),
    address: Joi.string().optional().allow(null, '').max(500),
    representative_name: Joi.string().optional().allow(null, ''),
    representative_phone: Joi.string().optional().allow(null, '').min(10).max(15),
    representative_email: Joi.string().optional().allow(null, ''),
    representative_position: Joi.string().optional().allow(null, ''),
    type: Joi.string()
        .valid(...values(PartnerType))
        .optional(),

    clause_id: Joi.number().optional().allow(null),
    employee_id: Joi.number().optional().allow(null),
    partner_group_id: Joi.number().optional().allow(null),
};

const RepresentativeBody = {
    id: Joi.number().optional().allow(null, ''),
    name: Joi.string().optional().allow(null, ''),
    phone: Joi.string().optional().allow(null, '').min(10).max(15),
    title: Joi.string().optional().allow(null, ''),
    email: Joi.string().optional().allow(null, ''),
    salutation: Joi.string().optional().allow(null, ''),
    key: Joi.string().allow(null, ''),

    banks: Joi.array()
        .items(
            Joi.object<IBank>({
                bank: Joi.string().optional().allow(null, ''),
                account_number: Joi.string().optional().allow(null, ''),
                name: Joi.string()
                    .optional()
                    .allow(null, '')
                    .pattern(/^[A-Z\s]+$/),
                branch: Joi.string().optional().allow(null, ''),
                responsibility: Joi.string().optional().allow(null, ''),
            }),
        )
        .optional()
        .allow(null),
};

export const create: schema = {
    body: wrapSchema(
        Joi.object<IPartner>({
            ...PartnerBody,

            representatives: Joi.array().items(Joi.object<IRepresentative>(RepresentativeBody)).optional().allow(null),
        }),
    ),
};

export const update: schema = {
    body: wrapSchema(
        Joi.object({
            ...PartnerBody,

            add: Joi.array().items(Joi.object<IRepresentative>(RepresentativeBody)).optional().allow(null),

            update: Joi.array().items(Joi.object<IRepresentative>(RepresentativeBody)).optional().allow(null),

            delete: Joi.array().items(Joi.number()).optional().default([]),
        }),
    ),
};

export const queryFilter: schema = {
    query: wrapSchema(
        extendFilterQuery(baseQueryFilter.query as ObjectSchema<any>, {
            type: Joi.string()
                .optional()
                .valid(...values(PartnerType)),
            isCommission: Joi.boolean().optional(),
        }),
    ),
};
