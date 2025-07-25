"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseAdapter = void 0;
// src/common/infrastructure/database.adapter.ts
const client_1 = require("@prisma/client");
const logger_1 = __importDefault(require("../logger"));
class DatabaseAdapter {
    constructor() {
        this.isConnected = false;
        this.client = new client_1.PrismaClient({
            log: ['info', 'warn', 'error'],
            errorFormat: 'pretty',
        });
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new DatabaseAdapter();
        }
        return this.instance;
    }
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isConnected) {
                logger_1.default.warn('Database already connected.');
                return;
            }
            try {
                yield this.client.$connect();
                this.isConnected = true;
                logger_1.default.info('Database connection established');
            }
            catch (error) {
                logger_1.default.error('Database connection failed:', error);
                throw error;
            }
        });
    }
    disconnect() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.isConnected) {
                logger_1.default.warn('Database is not connected or already disconnected.');
                return;
            }
            try {
                yield this.client.$disconnect();
                this.isConnected = false;
                logger_1.default.info('Database connection closed');
            }
            catch (error) {
                logger_1.default.error('Error disconnecting from database:', error);
                throw error;
            }
        });
    }
    getClient() {
        return this.client;
    }
}
exports.DatabaseAdapter = DatabaseAdapter;
