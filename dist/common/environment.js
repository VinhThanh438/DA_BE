"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MAIL_FROM = exports.MAIL_PASSWORD = exports.MAIL_USERNAME = exports.MAIL_SERVICE = exports.ADMIN_MAIL = exports.ADMIN_USER_NAME = exports.ADMIN_PASSWORD = exports.REDIS_URI = exports.REDIS_PASSWORD = exports.REDIS_PORT = exports.REDIS_HOST = exports.JWT_PRIVATE_KEY = exports.DATABASE_URL = exports.NODE_ENV = exports.LOG_OUTPUT_JSON = exports.LOG_LEVEL = exports.PORT = exports.DB_PORT = exports.DB_HOST = exports.DB_PASSWORD = exports.DB_NAME = exports.DB_USER_NAME = void 0;
const path_1 = __importDefault(require("path"));
const dotenv_safe_1 = __importDefault(require("dotenv-safe"));
dotenv_safe_1.default.config({
    path: path_1.default.join(__dirname, '../../.env'),
    sample: path_1.default.join(__dirname, '../../.env.example'),
    allowEmptyValues: true,
});
exports.DB_USER_NAME = process.env.DB_USER_NAME || '';
exports.DB_NAME = process.env.DB_NAME || '';
exports.DB_PASSWORD = process.env.DB_PASSWORD || '';
exports.DB_HOST = process.env.DB_HOST || '';
exports.DB_PORT = process.env.DB_PORT || '';
exports.PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 4000;
exports.LOG_LEVEL = process.env.LOG_LEVEL || 'debug';
exports.LOG_OUTPUT_JSON = true;
exports.NODE_ENV = process.env.NODE_ENV || 'DEV';
exports.DATABASE_URL = `postgresql://${exports.DB_USER_NAME}:${exports.DB_PASSWORD}@${exports.DB_HOST}:${exports.DB_PORT}/${exports.DB_NAME}`;
exports.JWT_PRIVATE_KEY = process.env.JWT_SECRET || '';
exports.REDIS_HOST = process.env.REDIS_HOST || '';
exports.REDIS_PORT = process.env.REDIS_PORT || '';
exports.REDIS_PASSWORD = process.env.REDIS_PASSWORD || '';
exports.REDIS_URI = exports.REDIS_PASSWORD
    ? `redis://:${exports.REDIS_PASSWORD}@${exports.REDIS_HOST}:${exports.REDIS_PORT}`
    : `redis://${exports.REDIS_HOST}:${exports.REDIS_PORT}`;
exports.ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';
exports.ADMIN_USER_NAME = process.env.ADMIN_USER_NAME || '';
exports.ADMIN_MAIL = process.env.ADMIN_MAIL || '';
exports.MAIL_SERVICE = process.env.MAIL_SERVICE || 'gmail';
exports.MAIL_USERNAME = process.env.MAIL_USERNAME || '';
exports.MAIL_PASSWORD = process.env.MAIL_PASSWORD || '';
exports.MAIL_FROM = process.env.MAIL_FROM || 'verify.itomo@gmail.com';
