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
const server_1 = require("./server");
const database_adapter_1 = require("../common/infrastructure/database.adapter");
const redis_adapter_1 = require("../common/infrastructure/redis.adapter");
const logger_1 = __importDefault(require("../common/logger"));
const mail_adapter_1 = require("../common/infrastructure/mail.adapter");
const debt_event_1 = require("../common/events/debt.event");
/**
 * Wrapper around the Node process, WorkerServer abstraction and complex dependencies such as services that ExpressServer needs.
 * When not using Dependency Injection, can be used as place for wiring together services which are dependencies of ExpressServer.
 */
class Application {
    static createApplication() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.databaseInstance.connect();
            yield mail_adapter_1.MailAdapter.connect();
            yield redis_adapter_1.RedisAdapter.connect();
            this.registerEvents();
            const server = new server_1.WorkerServer();
            yield server.setup();
            this.handleExit(server);
            return server;
        });
    }
    static shutdownProperly(exitCode, server) {
        return __awaiter(this, void 0, void 0, function* () {
            Promise.resolve()
                .then(() => {
                logger_1.default.info('Disconnecting server...');
                server.kill();
            })
                .then(() => {
                logger_1.default.info('Disconnecting mail server...');
                mail_adapter_1.MailAdapter.disconnect();
            })
                .then(() => {
                logger_1.default.info('Disconnecting redis...');
                redis_adapter_1.RedisAdapter.disconnect();
            })
                .then(() => {
                logger_1.default.info('Disconnecting database...');
                this.databaseInstance.disconnect();
            })
                .then(() => {
                logger_1.default.info('Shutdown complete, bye bye!');
                process.exit(exitCode);
            })
                .catch((error) => {
                logger_1.default.error('Error during shutdown', error);
                process.exit(1);
            });
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
     * Handle register event
     */
    static registerEvents() {
        debt_event_1.DebtEvent.register();
    }
}
exports.Application = Application;
/**
 * Implement create application, connecting db here
 */
Application.databaseInstance = database_adapter_1.DatabaseAdapter.getInstance();
