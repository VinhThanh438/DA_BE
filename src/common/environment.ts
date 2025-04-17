import path from 'path';
import dotenv from 'dotenv-safe';

dotenv.config({
    path: path.join(__dirname, '../../.env'),
    sample: path.join(__dirname, '../../.env.example'),
    allowEmptyValues: true,
});

export const DB_USER_NAME: string = process.env.DB_USER_NAME || '';
export const DB_NAME: string = process.env.DB_NAME || '';
export const DB_PASSWORD: string = process.env.DB_PASSWORD || '';
export const DB_HOST: string = process.env.DB_HOST || '';
export const DB_PORT: string = process.env.DB_PORT || '';

export const PORT: number = process.env.PORT ? parseInt(process.env.PORT, 10) : 4000;
export const LOG_LEVEL: string = process.env.LOG_LEVEL || 'debug';
export const LOG_OUTPUT_JSON: boolean = true;
export const NODE_ENV: string = process.env.NODE_ENV || 'DEV';
export const DATABASE_URL: string = `postgresql://${DB_USER_NAME}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;
export const JWT_PRIVATE_KEY: string = process.env.JWT_SECRET || '';

export const REDIS_HOST: string = process.env.REDIS_HOST || '';
export const REDIS_PORT: string = process.env.REDIS_PORT || '';
export const REDIS_PASSWORD: string = process.env.REDIS_PASSWORD || '';
export const REDIS_URI: string = REDIS_PASSWORD
    ? `redis://:${REDIS_PASSWORD}@${REDIS_HOST}:${REDIS_PORT}`
    : `redis://${REDIS_HOST}:${REDIS_PORT}`;

export const ADMIN_PASSWORD: string = process.env.ADMIN_PASSWORD || '';
export const ADMIN_USER_NAME: string = process.env.ADMIN_USER_NAME || '';
export const ADMIN_MAIL: string = process.env.ADMIN_MAIL || '';

export const SOCKET_PORT: number = process.env.SOCKET_PORT ? parseInt(process.env.SOCKET_PORT, 10) : 3001;

export const MAIL_SERVICE: string = process.env.MAIL_SERVICE || 'gmail';
export const MAIL_USERNAME: string = process.env.MAIL_USERNAME || '';
export const MAIL_PASSWORD: string = process.env.MAIL_PASSWORD || '';
export const MAIL_FROM: string = process.env.MAIL_FROM || 'verify.itomo@gmail.com';