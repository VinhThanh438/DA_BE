import express, { Express } from 'express';
import { Server } from 'http';
import helmet from 'helmet';
import bodyParser from 'body-parser';
import routes from '@api/router';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import logger from '@common/logger';
import { NODE_ENV } from '@common/environment';
import { ResponseMiddleware } from './middlewares/response.middleware';
import { PublicPath } from '@config/app.constant';
import i18nMiddleware from 'i18next-http-middleware';
import i18n from '@api/middlewares/i18.middleware';
import { RateLimiterMiddleware } from './middlewares/ratelimiter.middleware';

/**
 * Abstraction around the raw Express.js server and Nodes' HTTP server.
 * Defines HTTP request mappings, basic as well as request-mapping-specific
 * middleware chains for application logic, config and everything else.
 */
export class ExpressServer {
    private server?: Express;
    private httpServer?: Server;

    public async setup(port: number): Promise<Express> {
        const server = express();
        await this.i18next(server);
        this.setupStandardMiddlewares(server);
        this.setupSecurityMiddlewares(server);
        this.configureRoutes(server);
        this.setupErrorHandlers(server);

        this.httpServer = this.listen(server, port);
        this.server = server;
        return this.server;
    }

    // Add getter for HTTP server to share with Socket.IO
    public getHttpServer(): Server | undefined {
        return this.httpServer;
    }

    public listen(server: Express, port: number): Server {
        logger.info(`Starting server on port ${port} (${NODE_ENV})`);
        return server.listen(port);
    }

    public async kill(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.httpServer) {
                this.httpServer.close((err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            } else {
                resolve();
            }
        });
    }

    private setupSecurityMiddlewares(server: Express) {
        server.use(helmet());
        server.use(helmet.crossOriginResourcePolicy({ policy: 'cross-origin' }));
        server.use(
            helmet.contentSecurityPolicy({
                directives: {
                    defaultSrc: ["'self'"],
                    styleSrc: ["'unsafe-inline'"],
                    scriptSrc: ["'unsafe-inline'", "'self'"],
                },
            }),
        );

        const allowedOrigins = [
            'http://localhost:3000',
            'http://localhost:3001',
            'https://api.thepdonganh.itomo.one',
            'https://thepdonganh.itomo.one',
            'https://kswrz0sc-3000.asse.devtunnels.ms',
        ];

        server.use(
            cors({
                origin: (origin, callback) => {
                    if (!origin || allowedOrigins.includes(origin)) {
                        callback(null, true);
                    } else {
                        callback(new Error('Not allowed by CORS'));
                    }
                },
                credentials: true,
            }),
        );
        server.set('trust proxy', true);
        server.use(RateLimiterMiddleware.createGlobalLimiter());
    }

    private async i18next(server: Express) {
        server.use(i18nMiddleware.handle(await i18n.getI18n()));
    }

    private setupStandardMiddlewares(server: Express) {
        server.use(cookieParser());
        server.use(this.setSecureCookieMiddleware());
        server.use(
            bodyParser.json({
                verify: (req: any, res, buf) => {
                    req.rawBody = buf;
                },
            }),
        );
        server.use(bodyParser.urlencoded({ extended: true }));
    }

    private configureRoutes(server: Express) {
        server.use(PublicPath.PUBLIC_FILES, express.static('uploads'));
        server.use('/api/v1', routes);
    }

    private setSecureCookieMiddleware() {
        return (req: express.Request, res: express.Response, next: express.NextFunction) => {
            res.secureCookie = (name: string, value: string, options: express.CookieOptions = {}) => {
                const defaultOptions: express.CookieOptions = {
                    secure: true,
                    sameSite: 'none',
                    httpOnly: true,
                };
                const mergedOptions = { ...defaultOptions, ...options };
                res.cookie(name, value, mergedOptions);
            };
            next();
        };
    }

    private setupErrorHandlers(server: Express) {
        // if error is not an instanceOf APIError, convert it.
        server.use(ResponseMiddleware.converter);

        // catch 404 and forward to error handler
        server.use(ResponseMiddleware.notFound);

        // error handler, send stacktrace only during development
        server.use(ResponseMiddleware.handler);
    }
}
