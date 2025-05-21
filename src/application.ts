import '@common/extensions/express.extension';
import { ExpressServer } from '@api/server';
import { DatabaseAdapter } from '@common/infrastructure/database.adapter';
import { RedisAdapter } from '@common/infrastructure/redis.adapter';
import logger from '@common/logger';
import { PORT, SOCKET_PORT } from '@common/environment';
import { WorkerServer } from '@worker/server';
import { SocketServer } from '@socket/server';
import { AuthEvent } from '@common/events/auth.event';
import { MailAdapter } from '@common/infrastructure/mail.adapter';
import { DeviceRequetsEvent } from '@common/events/device-request.event';
import { UserEvent } from '@common/events/user.event';
import { InventoryEvent } from '@common/events/inventory.event';

/**
 * Wrapper around the Node process, ExpressServer abstraction and complex dependencies such as services that ExpressServer needs.
 * When not using Dependency Injection, can be used as place for wiring together services which are dependencies of ExpressServer.
 */
export class Application {
    /**
     * Implement create application, connecting db here
     */
    private static databaseInstance = DatabaseAdapter.getInstance();

    public static async createApplication(): Promise<ExpressServer> {
        await this.databaseInstance.connect();
        // await RedisAdapter.connect();
        // await MailAdapter.connect();

        Application.registerEvents();

        const expressServer = new ExpressServer();
        await expressServer.setup(PORT);

        // const workerServer = new WorkerServer();
        // await workerServer.setup();

        // const socketServer = new SocketServer();
        // await socketServer.setup(SOCKET_PORT);

        Application.handleExit(expressServer);

        return expressServer;
    }

    /**
     * Register signal handler to graceful shutdown
     *
     * @param expressServer Express server
     * @param workerServer Worker server
     * @param socketServer Socket server
     */
    private static handleExit(expressServer: ExpressServer, workerServer?: WorkerServer, socketServer?: SocketServer) {
        const shutdown = async (exitCode: number) => {
            logger.info('Starting graceful shutdown...');
            try {
                await expressServer.kill();

                if (workerServer) await workerServer.kill();
                if (socketServer) await socketServer.kill();
                
                // await RedisAdapter.disconnect();
                // await MailAdapter.disconnect();
                await this.databaseInstance.disconnect();
                logger.info('Shutdown complete, bye bye!');
                process.exit(exitCode);
            } catch (err) {
                logger.error('Error during shutdown', err);
                process.exit(1);
            }
        };

        process.on('uncaughtException', (err: unknown) => {
            logger.error('Uncaught exception', err);
            shutdown(1);
        });

        process.on('unhandledRejection', (reason: unknown | null | undefined) => {
            logger.error('Unhandled Rejection at promise', reason);
            shutdown(2);
        });

        process.on('SIGINT', () => {
            logger.info('Caught SIGINT, exiting!');
            shutdown(128 + 2);
        });

        process.on('SIGTERM', () => {
            logger.info('Caught SIGTERM, exiting');
            shutdown(128 + 2);
        });

        process.on('exit', () => {
            logger.info('Exiting process...');
        });
    }

    /**
     * Handle register event
     */
    private static async registerEvents() {
        AuthEvent.register();
        DeviceRequetsEvent.register();
        UserEvent.register();
        InventoryEvent.register();
    }
}
