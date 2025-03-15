import { PrismaClient } from '@prisma/client';
import logger from '@common/logger';
import { ADMIN_PASSWORD } from '@common/environment';
import eventbus from '@common/eventbus';

export class DatabaseAdapter extends PrismaClient {
    private static instance: DatabaseAdapter;

    private constructor() {
        super({
            log: ['query', 'error', 'warn'],
            errorFormat: 'pretty',
        });
    }

    public static getInstance(): DatabaseAdapter {
        if (!DatabaseAdapter.instance) {
            DatabaseAdapter.instance = new DatabaseAdapter();
        }
        return DatabaseAdapter.instance;
    }

    async connect(): Promise<void> {
        try {
            await this.$connect();
            logger.info('✅ Database connection established');
        } catch (error) {
            logger.error('❌ Database connection failed:', error);
            throw error;
        }
    }

    async disconnect(): Promise<void> {
        try {
            await this.$disconnect();
            logger.info('✅ Database connection closed');
        } catch (error) {
            logger.error('❌ Error disconnecting from database:', error);
            throw error;
        }
    }
}

export const prisma = DatabaseAdapter.getInstance();
