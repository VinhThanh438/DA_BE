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
exports.Application = void 0;
require("../common/extensions/express.extension");
require("../common/extensions/joi.extension");
require("../common/extensions/zod.extension");
const server_1 = require("./server");
const database_adapter_1 = require("../common/infrastructure/database.adapter");
const redis_adapter_1 = require("../common/infrastructure/redis.adapter");
const logger_1 = __importDefault(require("../common/logger"));
const environment_1 = require("../common/environment");
const auth_event_1 = require("../common/events/auth.event");
const device_request_event_1 = require("../common/events/device-request.event");
const user_event_1 = require("../common/events/user.event");
const inventory_event_1 = require("../common/events/inventory.event");
const bank_event_1 = require("../common/events/bank.event");
const payment_request_detail_event_1 = require("../common/events/payment-request-detail.event");
const loan_event_1 = require("../common/events/loan.event");
const transaction_event_1 = require("../common/events/transaction.event");
const invoice_event_1 = require("../common/events/invoice.event");
const product_event_1 = require("../common/events/product.event");
const stock_tracking_event_1 = require("../common/events/stock-tracking.event");
const file_event_1 = require("../common/events/file.event");
const init_service_1 = require("../common/services/init.service");
const organization_event_1 = require("../common/events/organization.event");
const socket_adapter_1 = require("../common/infrastructure/socket.adapter");
const debt_event_1 = require("../common/events/debt.event");
/**
 * Wrapper around the Node process, ExpressServer abstraction and complex dependencies such as services that ExpressServer needs.
 * When not using Dependency Injection, can be used as place for wiring together services which are dependencies of ExpressServer.
 */
class Application {
    static createApplication() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.databaseInstance.connect();
            yield redis_adapter_1.RedisAdapter.connect();
            this.registerEvents();
            const expressServer = new server_1.ExpressServer();
            yield expressServer.setup(environment_1.PORT);
            this.handleExit(expressServer);
            yield socket_adapter_1.SocketAdapter.connect(expressServer.getHttpServer());
            yield this.init();
            return expressServer;
        });
    }
    static shutdownProperly(exitCode, server) {
        Promise.resolve()
            .then(() => {
            logger_1.default.info('Disconnecting socket...');
            return socket_adapter_1.SocketAdapter.disconnect();
        })
            .then(() => {
            logger_1.default.info('Shutting down HTTP server...');
            return server.kill();
        })
            .then(() => {
            logger_1.default.info('Disconnecting Redis...');
            return redis_adapter_1.RedisAdapter.disconnect();
        })
            .then(() => {
            logger_1.default.info('Disconnecting Database...');
            return this.databaseInstance.disconnect();
        })
            .then(() => {
            logger_1.default.info('Shutdown complete, bye bye!');
            process.exit(exitCode);
        })
            .catch((error) => {
            logger_1.default.error('Error during shutdown', error);
            process.exit(1);
        });
    }
    /**
     * Register signal handler to graceful shutdown
     *
     * @param server Express server
     */
    static handleExit(server) {
        process.on('uncaughtException', (err) => {
            logger_1.default.error('Uncaught exception', err);
            this.shutdownProperly(1, server);
        });
        process.on('unhandledRejection', (reason) => {
            logger_1.default.error('Unhandled Rejection at promise', reason);
            this.shutdownProperly(2, server);
        });
        process.on('SIGINT', () => {
            logger_1.default.info('Caught SIGINT, existing!');
            this.shutdownProperly(128 + 2, server);
        });
        process.on('SIGTERM', () => {
            logger_1.default.info('Caught SIGTERM, existing');
            this.shutdownProperly(128 + 2, server);
        });
        process.on('exit', () => {
            logger_1.default.info('Exiting process...');
        });
    }
    /**
     * Initialize default data, cache, etc.
     */
    static init() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Cache organization data
                yield init_service_1.InitService.cacheOrganizationData();
                logger_1.default.info('Application initialized successfully.');
            }
            catch (error) {
                logger_1.default.error('Error during application initialization:', error);
                throw error;
            }
        });
    }
    /**
     * Handle register event
     */
    static registerEvents() {
        return __awaiter(this, void 0, void 0, function* () {
            auth_event_1.AuthEvent.register();
            device_request_event_1.DeviceRequestEvent.register();
            user_event_1.UserEvent.register();
            inventory_event_1.InventoryEvent.register();
            bank_event_1.BankEvent.register();
            payment_request_detail_event_1.PaymentRequestDetailEvent.register();
            loan_event_1.LoanEvent.register();
            transaction_event_1.TransactionEvent.register();
            invoice_event_1.InvoiceEvent.register();
            product_event_1.ProductEvent.register();
            stock_tracking_event_1.StockTrackingEvent.register();
            file_event_1.FileEvent.register();
            organization_event_1.OrganizationEvent.register();
            debt_event_1.DebtEvent.register();
        });
    }
}
exports.Application = Application;
/**
 * Implement create application, connecting db here
 */
Application.databaseInstance = database_adapter_1.DatabaseAdapter.getInstance();
