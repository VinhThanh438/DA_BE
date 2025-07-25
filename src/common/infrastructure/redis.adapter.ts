import logger from '@common/logger';
import { REDIS_URI } from '@common/environment';
import { QueueOptions } from 'bullmq';
import ioredis, { Redis, RedisOptions } from 'ioredis';

/**
 * Singleton Redis client
 */
export class RedisAdapter {
    private static client: Redis;
    private static subscriber: Redis;
    private static allClients: Redis[] = [];

    static async getClient(): Promise<Redis> {
        if (!this.client) {
            await this.connect();
        }
        return this.client;
    }

    static async connect(overrideClient = true, options = {}): Promise<Redis> {
        const tmp = new ioredis(REDIS_URI, {
            lazyConnect: true,
            maxRetriesPerRequest: null,
            retryStrategy: (times) => {
                const delay = Math.min(times * 50, 2000);
                if (times < 5) {
                    return delay;
                }
                process.exit(1);
            },
            ...options,
        });

        if (!this.client || !this.allClients.includes(this.client)) {
            tmp.on('ready', () => {
                logger.info('Connect to redis successfully!');
            });
        }
        tmp.on('end', () => {
            logger.info('Connect to redis ended!');
        });

        tmp.on('error', (error) => {
            logger.error('Connect to redis error!', error);
        });

        try {
            await tmp.connect();
        } catch (error) {
            logger.error('Connect to redis error!', error);
            process.exit(1);
        }

        if (overrideClient) {
            this.client = tmp;
        }
        this.allClients.push(tmp);
        return tmp;
    }

    static async disconnect(): Promise<void> {
        logger.info('Closing redis connection...');
        try {
            await Promise.all(this.allClients.map((client) => client.quit()));
        } catch (error) {
            logger.error('Closing redis connection error!', error);
        }
    }

    static createClient(options: RedisOptions = {}): Redis {
        const tmp = new ioredis(REDIS_URI, {
            maxRetriesPerRequest: null,
            retryStrategy: (times) => {
                const delay = Math.min(times * 50, 2000);
                if (times < 5) {
                    return delay;
                }
                process.exit(1);
            },
            ...options,
        });

        if (!this.client && !this.allClients.includes(this.client)) {
            tmp.on('ready', () => {
                logger.info('(Client) Connect to redis successfully!');
            });
        }
        tmp.on('end', () => {
            logger.info('(Client) Connect to redis ended!');
        });
        tmp.on('error', (error) => {
            logger.error('(Client) Connect to redis error!', error);
            process.exit(1);
        });

        this.allClients.push(tmp);

        return tmp;
    }

    static async getQueueOptions(): Promise<QueueOptions> {
        const clientOptions: RedisOptions = {
            maxRetriesPerRequest: null,
            enableReadyCheck: false,
        };

        if (!this.client) {
            this.client = await this.connect(true);
        }

        if (!this.subscriber) {
            this.subscriber = await this.connect(false, clientOptions);
        }
        return {
            connection: this.client,
            prefix: `Jobs:`,
            defaultJobOptions: {
                removeOnComplete: 1000,
                removeOnFail: 1000,
            },
        };
    }

    static serialize(value: unknown): string {
        if (value) {
            return JSON.stringify(value);
        }
        return value as string;
    }

    static deserialize(value: unknown): unknown {
        if (value && typeof value === 'string') {
            return JSON.parse(value);
        }
        return value;
    }

    static async get(key: string, shouldDeserialize = false): Promise<unknown> {
        const value = await (await this.getClient()).get(key);
        return shouldDeserialize ? this.deserialize(value) : value;
    }

    static async set(key: string, value: unknown, ttl = 0, shouldSerialize = false): Promise<unknown> {
        const stringValue: string = shouldSerialize ? this.serialize(value) : (value as string);
        if (ttl > 0) {
            return (await this.getClient()).set(key, stringValue, 'EX', ttl);
        }
        return (await this.getClient()).set(key, stringValue);
    }

    static async delete(key: string): Promise<unknown> {
        return (await this.getClient()).del(key);
    }
}
