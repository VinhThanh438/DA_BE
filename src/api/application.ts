import { ExpressServer } from '@api/server';
import { DatabaseAdapter } from '@common/infrastructure/database.adapter';
import { RedisAdapter } from '@common/infrastructure/redis.adapter';
import logger from '@common/logger';
import { PORT } from '@common/environment';

/**
 * Wrapper around the Node process, ExpressServer abstraction and complex dependencies such as services that ExpressServer needs.
 * When not using Dependency Injection, can be used as place for wiring together services which are dependencies of ExpressServer.
 */
export class Application {
    /**
     * Implement create application, connecting db here
     */
    public static async createApplication(): Promise<ExpressServer> {
        await DatabaseAdapter.connect();
        await RedisAdapter.connect();

        Application.registerEvents();

        const expressServer = new ExpressServer();
        await expressServer.setup(PORT);

        // const workerServer = new WorkerServer();
        // await workerServer.setup();

        Application.handleExit(expressServer);
        // Application.handleExit(workerServer);

        return expressServer;
    }

    /**
     * Register signal handler to graceful shutdown
     *
     * @param express Express server
     */
    // private static handleExit(express: ExpressServer | WorkerServer) {
    private static handleExit(express: ExpressServer) {
        process.on('uncaughtException', (err: unknown) => {
            logger.error('Uncaught exception', err);
            Application.shutdownProperly(1, express);
        });
        process.on('unhandledRejection', (reason: unknown | null | undefined) => {
            logger.error('Unhandled Rejection at promise', reason);
            Application.shutdownProperly(2, express);
        });
        process.on('SIGINT', () => {
            logger.info('Caught SIGINT, exitting!');
            Application.shutdownProperly(128 + 2, express);
        });
        process.on('SIGTERM', () => {
            logger.info('Caught SIGTERM, exitting');
            Application.shutdownProperly(128 + 2, express);
        });
        process.on('exit', () => {
            logger.info('Exiting process...');
        });
    }

    /**
     * Handle graceful shutdown
     *
     * @param exitCode
     * @param express
     */
    // private static shutdownProperly(exitCode: number, express: ExpressServer | WorkerServer) {
    private static shutdownProperly(exitCode: number, express: ExpressServer) {
        Promise.resolve()
            .then(() => express.kill())
            .then(() => DatabaseAdapter.disconnect())
            .then(() => RedisAdapter.disconnect())
            .then(() => {
                logger.info('Shutdown complete, bye bye!');
                process.exit(exitCode);
            })

            .catch((err) => {
                logger.error('Error during shutdown', err);
                process.exit(1);
            });
    }

    /**
     * Handle register event
     */
    private static async registerEvents() {
    }
}
