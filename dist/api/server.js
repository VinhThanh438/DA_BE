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
exports.ExpressServer = void 0;
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const body_parser_1 = __importDefault(require("body-parser"));
const router_1 = __importDefault(require("./router"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const logger_1 = __importDefault(require("../common/logger"));
const environment_1 = require("../common/environment");
const response_middleware_1 = require("./middlewares/response.middleware");
const app_constant_1 = require("../config/app.constant");
const i18next_http_middleware_1 = __importDefault(require("i18next-http-middleware"));
const i18_middleware_1 = __importDefault(require("./middlewares/i18.middleware"));
const ratelimiter_middleware_1 = require("./middlewares/ratelimiter.middleware");
/**
 * Abstraction around the raw Express.js server and Nodes' HTTP server.
 * Defines HTTP request mappings, basic as well as request-mapping-specific
 * middleware chains for application logic, config and everything else.
 */
class ExpressServer {
    setup(port) {
        return __awaiter(this, void 0, void 0, function* () {
            const server = (0, express_1.default)();
            yield this.i18next(server);
            this.setupStandardMiddlewares(server);
            this.setupSecurityMiddlewares(server);
            this.configureRoutes(server);
            this.setupErrorHandlers(server);
            this.httpServer = this.listen(server, port);
            this.server = server;
            return this.server;
        });
    }
    // Add getter for HTTP server to share with Socket.IO
    getHttpServer() {
        return this.httpServer;
    }
    listen(server, port) {
        logger_1.default.info(`Starting server on port ${port} (${environment_1.NODE_ENV})`);
        return server.listen(port);
    }
    kill() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                if (this.httpServer) {
                    this.httpServer.close((err) => {
                        if (err) {
                            reject(err);
                        }
                        else {
                            logger_1.default.info('HTTP server closed');
                            resolve();
                        }
                    });
                }
                else {
                    logger_1.default.info('HTTP server closed');
                    resolve();
                }
            });
        });
    }
    setupSecurityMiddlewares(server) {
        server.use((0, helmet_1.default)());
        server.use(helmet_1.default.crossOriginResourcePolicy({ policy: 'cross-origin' }));
        server.use(helmet_1.default.contentSecurityPolicy({
            directives: {
                defaultSrc: ["'self'"],
                styleSrc: ["'unsafe-inline'"],
                scriptSrc: ["'unsafe-inline'", "'self'"],
            },
        }));
        const allowedOrigins = ['http://localhost:3000', 'https://vuthanhvinhvippro.id.vn'];
        server.use((0, cors_1.default)({
            origin: (origin, callback) => {
                if (!origin || allowedOrigins.includes(origin)) {
                    callback(null, true);
                }
                else {
                    callback(new Error('Not allowed by CORS'));
                }
            },
            credentials: true,
        }));
        server.set('trust proxy', true);
        server.use(ratelimiter_middleware_1.RateLimiterMiddleware.globalLimiter);
    }
    i18next(server) {
        return __awaiter(this, void 0, void 0, function* () {
            server.use(i18next_http_middleware_1.default.handle(yield i18_middleware_1.default.getI18n()));
        });
    }
    setupStandardMiddlewares(server) {
        server.use((0, cookie_parser_1.default)());
        server.use(this.setSecureCookieMiddleware());
        server.use(body_parser_1.default.json({
            verify: (req, res, buf) => {
                req.rawBody = buf;
            },
        }));
        server.use(body_parser_1.default.urlencoded({ extended: true }));
    }
    configureRoutes(server) {
        server.use(app_constant_1.PublicPath.PUBLIC_FOLDER, express_1.default.static('uploads'));
        server.use('/api/v1', router_1.default);
    }
    setSecureCookieMiddleware() {
        return (req, res, next) => {
            res.secureCookie = (name, value, options = {}) => {
                const defaultOptions = {
                    secure: true,
                    sameSite: 'none',
                    httpOnly: true,
                };
                const mergedOptions = Object.assign(Object.assign({}, defaultOptions), options);
                res.cookie(name, value, mergedOptions);
            };
            next();
        };
    }
    setupErrorHandlers(server) {
        // if error is not an instanceOf APIError, convert it.
        server.use(response_middleware_1.ResponseMiddleware.converter);
        // catch 404 and forward to error handler
        server.use(response_middleware_1.ResponseMiddleware.notFound);
        // error handler, send stacktrace only during development
        server.use(response_middleware_1.ResponseMiddleware.handler);
    }
}
exports.ExpressServer = ExpressServer;
