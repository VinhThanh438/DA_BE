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
exports.RedisAdapter = void 0;
const logger_1 = __importDefault(require("../logger"));
const environment_1 = require("../environment");
const ioredis_1 = __importDefault(require("ioredis"));
/**
 * Singleton Redis client
 */
class RedisAdapter {
    static getClient() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.client) {
                yield this.connect();
            }
            return this.client;
        });
    }
    static connect() {
        return __awaiter(this, arguments, void 0, function* (overrideClient = true, options = {}) {
            const tmp = new ioredis_1.default(environment_1.REDIS_URI, Object.assign({ lazyConnect: true, maxRetriesPerRequest: null, retryStrategy: (times) => {
                    const delay = Math.min(times * 50, 2000);
                    if (times < 5) {
                        return delay;
                    }
                    process.exit(1);
                } }, options));
            if (!this.client || !this.allClients.includes(this.client)) {
                tmp.on('ready', () => {
                    logger_1.default.info('Connect to redis successfully!');
                });
            }
            tmp.on('end', () => {
                logger_1.default.info('Connect to redis ended!');
            });
            tmp.on('error', (error) => {
                logger_1.default.error('Connect to redis error!', error);
            });
            try {
                yield tmp.connect();
            }
            catch (error) {
                logger_1.default.error('Connect to redis error!', error);
                process.exit(1);
            }
            if (overrideClient) {
                this.client = tmp;
            }
            this.allClients.push(tmp);
            return tmp;
        });
    }
    static disconnect() {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.default.info('Closing redis connection...');
            try {
                yield Promise.all(this.allClients.map((client) => client.quit()));
            }
            catch (error) {
                logger_1.default.error('Closing redis connection error!', error);
            }
        });
    }
    static createClient(options = {}) {
        const tmp = new ioredis_1.default(environment_1.REDIS_URI, Object.assign({ maxRetriesPerRequest: null, retryStrategy: (times) => {
                const delay = Math.min(times * 50, 2000);
                if (times < 5) {
                    return delay;
                }
                process.exit(1);
            } }, options));
        if (!this.client && !this.allClients.includes(this.client)) {
            tmp.on('ready', () => {
                logger_1.default.info('(Client) Connect to redis successfully!');
            });
        }
        tmp.on('end', () => {
            logger_1.default.info('(Client) Connect to redis ended!');
        });
        tmp.on('error', (error) => {
            logger_1.default.error('(Client) Connect to redis error!', error);
            process.exit(1);
        });
        this.allClients.push(tmp);
        return tmp;
    }
    static getQueueOptions() {
        return __awaiter(this, void 0, void 0, function* () {
            const clientOptions = {
                maxRetriesPerRequest: null,
                enableReadyCheck: false,
            };
            if (!this.client) {
                this.client = yield this.connect(true);
            }
            if (!this.subscriber) {
                this.subscriber = yield this.connect(false, clientOptions);
            }
            return {
                connection: this.client,
                prefix: `Jobs:`,
                defaultJobOptions: {
                    removeOnComplete: 1000,
                    removeOnFail: 1000,
                },
            };
        });
    }
    static serialize(value) {
        if (value) {
            return JSON.stringify(value);
        }
        return value;
    }
    static deserialize(value) {
        if (value && typeof value === 'string') {
            return JSON.parse(value);
        }
        return value;
    }
    static get(key_1) {
        return __awaiter(this, arguments, void 0, function* (key, shouldDeserialize = false) {
            const value = yield (yield this.getClient()).get(key);
            return shouldDeserialize ? this.deserialize(value) : value;
        });
    }
    static set(key_1, value_1) {
        return __awaiter(this, arguments, void 0, function* (key, value, ttl = 0, shouldSerialize = false) {
            const stringValue = shouldSerialize ? this.serialize(value) : value;
            if (ttl > 0) {
                return (yield this.getClient()).set(key, stringValue, 'EX', ttl);
            }
            return (yield this.getClient()).set(key, stringValue);
        });
    }
    static delete(key) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.getClient()).del(key);
        });
    }
}
exports.RedisAdapter = RedisAdapter;
RedisAdapter.allClients = [];
