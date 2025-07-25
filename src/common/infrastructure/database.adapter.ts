// src/common/infrastructure/database.adapter.ts
import { PrismaClient } from '@prisma/client';
import logger from '@common/logger';

export class DatabaseAdapter {
    private static instance: DatabaseAdapter;
    private readonly client: PrismaClient;
    private isConnected = false;

    private constructor() {
        this.client = new PrismaClient({
            log: ['info', 'warn', 'error'],
            errorFormat: 'pretty',
        });
    }

    public static getInstance(): DatabaseAdapter {
        if (!this.instance) {
            this.instance = new DatabaseAdapter();
        }
        return this.instance;
    }

    public async connect(): Promise<void> {
        if (this.isConnected) {
            logger.warn('Database already connected.');
            return;
        }

        try {
            await this.client.$connect();
            this.isConnected = true;
            logger.info('Database connection established');
        } catch (error) {
            logger.error('Database connection failed:', error);
            throw error;
        }
    }

    public async disconnect(): Promise<void> {
        if (!this.isConnected) {
            logger.warn('Database is not connected or already disconnected.');
            return;
        }

        try {
            await this.client.$disconnect();
            this.isConnected = false;
            logger.info('Database connection closed');
        } catch (error) {
            logger.error('Error disconnecting from database:', error);
            throw error;
        }
    }

    public getClient(): PrismaClient {
        return this.client;
    }
}
