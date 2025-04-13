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

export const filter: schema = {
    query: wrapSchema(
        Joi.object({
            page: Joi.number().required().min(1),
            size: Joi.number().required().min(1),
            keyword: Joi.string().optional().allow(null, ''),
            start_at: Joi.string().optional().allow(null, ''),
            end_at: Joi.string().optional().allow(null, ''),
        }),
    ),
};

export const getUserById: schema = {
    params: wrapSchema(
        Joi.object({
            id: Joi.number().required(),
        }),
    ),
};

export const createEmployee: schema = {
    body: wrapSchema(
        Joi.object({
            code: Joi.string().required().max(50),
            email: Joi.string().email().optional().allow(null, ''),
            fullname: Joi.string().optional().allow(null, '').max(100),
            age: Joi.number().optional().min(0).max(100),
            phone_number: Joi.string().optional().allow(null, '').max(20),
            description: Joi.string().optional().allow(null, '').max(255),
            avatar: Joi.string().uri().optional().allow(null, ''),
            type: Joi.string().required(),
            files: Joi.array().optional(),

            // Education
            education: Joi.object({
                education_level: Joi.string().required(),
                training_level: Joi.string().optional().allow(null, ''),
                graduated_place: Joi.string().required(),
                faculty: Joi.string().optional().allow(null, ''),
                major: Joi.string().optional().allow(null, ''),
                graduation_year: Joi.number().optional(),
            }).optional(),

            // Finance
            finance: Joi.object({
                name: Joi.string().required(),
                amount: Joi.number().required(),
                note: Joi.string().optional().allow(null, ''),
                status: Joi.string().required(),
                type: Joi.string().valid('kt', 'pc').required(),
            }).optional(),

            // Identity
            identity: Joi.object({
                code: Joi.string().required(),
                issued_place: Joi.string().optional().allow(null, ''),
                issued_date: Joi.date().optional(),
                expired_date: Joi.date().optional(),
                type: Joi.string().valid('CCCD', 'HC').required(),
            }).optional(),

            // Address
            address: Joi.object({
                country: Joi.string().optional().allow(null, ''),
                province: Joi.string().optional().allow(null, ''),
                district: Joi.string().optional().allow(null, ''),
                ward: Joi.string().optional().allow(null, ''),
                details: Joi.string().optional().allow(null, ''),
                type: Joi.string().valid('tt', 'qq', 'tttv').optional(),
            }).optional(),

            // Emergency contact
            emergency_contact: Joi.object({
                name: Joi.string().required(),
                relationship: Joi.string().required(),
                phone: Joi.string().required(),
                address: Joi.string().optional().allow(null, ''),
            }).optional(),

            // Contract
            contract: Joi.object({
                code: Joi.string().required(),
                type: Joi.string().optional().allow(null, ''),
                start_date: Joi.date().optional(),
                end_date: Joi.date().optional(),
                status: Joi.string().optional().allow(null, ''),
            }).optional(),

            // Social insurance
            social_insurance: Joi.object({
                is_participating: Joi.boolean().required(),
                percent: Joi.number().optional(),
                insurance_number: Joi.string().optional(),
                insurance_salary: Joi.number().optional(),
                start_date: Joi.date().optional(),
            }).optional(),

            // User position
            user_position: Joi.object({
                time_keeping_code: Joi.string().optional().allow(null, ''),
                organization_id: Joi.number().optional(),
                job_position_id: Joi.number().optional(),
                working_status: Joi.string().optional().allow(null, ''),
                hr_status: Joi.string().optional().allow(null, ''),
                trial_date: Joi.date().optional(),
                official_date: Joi.date().optional(),
            }).optional(),
        }),
    ),
};

