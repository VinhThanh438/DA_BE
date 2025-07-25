import '@common/extensions/express.extension';
import '@common/extensions/joi.extension';
import '@common/extensions/zod.extension';
import { ExpressServer } from '@api/server';
import { DatabaseAdapter } from '@common/infrastructure/database.adapter';
import { RedisAdapter } from '@common/infrastructure/redis.adapter';
import logger from '@common/logger';
import { PORT } from '@common/environment';
import { AuthEvent } from '@common/events/auth.event';
import { DeviceRequestEvent } from '@common/events/device-request.event';
import { UserEvent } from '@common/events/user.event';
import { InventoryEvent } from '@common/events/inventory.event';
import { BankEvent } from '@common/events/bank.event';
import { PaymentRequestDetailEvent } from '@common/events/payment-request-detail.event';
import { LoanEvent } from '@common/events/loan.event';
import { TransactionEvent } from '@common/events/transaction.event';
import { InvoiceEvent } from '@common/events/invoice.event';
import { ProductEvent } from '@common/events/product.event';
import { StockTrackingEvent } from '@common/events/stock-tracking.event';
import { FileEvent } from '@common/events/file.event';
import { InitService } from '@common/services/init.service';
import { OrganizationEvent } from '@common/events/organization.event';
import { SocketAdapter } from '@common/infrastructure/socket.adapter';
import { DebtEvent } from '@common/events/debt.event';

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
        await RedisAdapter.connect();

        this.registerEvents();

        const expressServer = new ExpressServer();
        await expressServer.setup(PORT);

        this.handleExit(expressServer);

        await SocketAdapter.connect(expressServer.getHttpServer()!);

        await this.init();

        return expressServer;
    }

    private static shutdownProperly(exitCode: number, server: ExpressServer) {
        Promise.resolve()
            .then(() => {
                logger.info('Disconnecting socket...');
                return SocketAdapter.disconnect();
            })
            .then(() => {
                logger.info('Shutting down HTTP server...');
                return server.kill();
            })
            .then(() => {
                logger.info('Disconnecting Redis...');
                return RedisAdapter.disconnect();
            })
            .then(() => {
                logger.info('Disconnecting Database...');
                return this.databaseInstance.disconnect();
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
    private static handleExit(server: ExpressServer) {
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
     * Initialize default data, cache, etc.
     */
    public static async init(): Promise<void> {
        try {
            // Cache organization data
            await InitService.cacheOrganizationData();
            logger.info('Application initialized successfully.');
        } catch (error) {
            logger.error('Error during application initialization:', error);
            throw error;
        }
    }

    /**
     * Handle register event
     */
    private static async registerEvents() {
        AuthEvent.register();
        DeviceRequestEvent.register();
        UserEvent.register();
        InventoryEvent.register();
        BankEvent.register();
        PaymentRequestDetailEvent.register();
        LoanEvent.register();
        TransactionEvent.register();
        InvoiceEvent.register();
        ProductEvent.register();
        StockTrackingEvent.register();
        FileEvent.register();
        OrganizationEvent.register();
        DebtEvent.register();
    }
}
