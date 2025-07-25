import { WorkerServer } from '@worker/server';
import { DatabaseAdapter } from '@common/infrastructure/database.adapter';
import { RedisAdapter } from '@common/infrastructure/redis.adapter';
import logger from '@common/logger';
import { MailAdapter } from '@common/infrastructure/mail.adapter';
import { DebtEvent } from '@common/events/debt.event';

/**
 * Wrapper around the Node process, WorkerServer abstraction and complex dependencies such as services that ExpressServer needs.
 * When not using Dependency Injection, can be used as place for wiring together services which are dependencies of ExpressServer.
 */
export class Application {
    /**
     * Implement create application, connecting db here
     */
    private static databaseInstance = DatabaseAdapter.getInstance();

    public static async createApplication(): Promise<WorkerServer> {
        await this.databaseInstance.connect();
        await MailAdapter.connect();
        await RedisAdapter.connect();

        this.registerEvents();

        const server = new WorkerServer();
        await server.setup();

        this.handleExit(server);

        return server;
    }

    private static async shutdownProperly(exitCode: number, server: WorkerServer) {
        Promise.resolve()
            .then(() => {
                logger.info('Disconnecting server...');
                server.kill();
            })
            .then(() => {
                logger.info('Disconnecting mail server...');
                MailAdapter.disconnect();
            })
            .then(() => {
                logger.info('Disconnecting redis...');
                RedisAdapter.disconnect();
            })
            .then(() => {
                logger.info('Disconnecting database...');
                this.databaseInstance.disconnect();
            })
            .then(() => {
                logger.info('Shutdown complete, bye bye!');
                process.exit(exitCode);
            })
            .catch((error) => {
                logger.error('Error during shutdown', error);
                process.exit(1);
            });
    }
    /**
     * Register signal handler to graceful shutdown
     *
     * @param server Express server
     */
    private static handleExit(server: WorkerServer) {
        process.on('uncaughtException', (err: unknown) => {
            logger.error('Uncaught exception', err);
            this.shutdownProperly(1, server);
        });
        process.on('unhandledRejection', (reason: unknown | null | undefined) => {
            logger.error('Unhandled Rejection at promise', reason);
            this.shutdownProperly(2, server);
        });
        process.on('SIGINT', () => {
            logger.info('Caught SIGINT, existing!');
            this.shutdownProperly(128 + 2, server);
        });
        process.on('SIGTERM', () => {
            logger.info('Caught SIGTERM, existing');
            this.shutdownProperly(128 + 2, server);
        });
        process.on('exit', () => {
            logger.info('Exiting process...');
        });
    }

    /**
     * Handle register event
     */
    private static registerEvents() {
        DebtEvent.register();
    }
}
