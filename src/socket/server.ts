import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { Router } from '@socket/router';
import logger from '@common/logger';
import { NODE_ENV } from '@common/environment';
import { SocketAdapter } from '@common/infrastructure/socket.adapter';
import { APIError } from '@common/error/api.error';
import { StatusCode } from '@common/errors';

/**
 * Abstraction around the raw Socket.io server and Node's HTTP server.
 */
export class SocketServer {
    private server?: Server;
    private httpServer?: HttpServer;

    /**
     * Setup the Socket.io server and HTTP server.
     * @param port The port to listen on.
     */
    public async setup(port: number): Promise<Server> {
        this.server = await SocketAdapter.getSocketInstance();
        if (this.server) {
            this.handleConnection(this.server);
            this.handleSecureConnection(this.server);
        }

        this.httpServer = this.listen(SocketAdapter.getHttpServer(), port);
        if (!this.server) {
            throw new APIError({
                errorCode: 1,
                status: StatusCode.SERVER_ERROR,
                message: 'socket.error.not-init',
            });
        }
        return this.server;
    }

    /**
     * Start listening on the specified port.
     * @param server The HTTP server instance.
     * @param port The port to listen on.
     */
    public listen(server: HttpServer, port: number): HttpServer {
        server.on('listening', () => logger.info(`Socket server started on port ${port} (${NODE_ENV})`));
        return server.listen(port);
    }

    /**
     * Gracefully shut down the Socket.io server.
     */
    public async kill(): Promise<void> {
        if (this.server) {
            logger.info('Shutting down Socket.io server...');
            return this.server.close();
        }
    }

    /**
     * Handle incoming socket connections.
     * @param server The Socket.io server instance.
     */
    private handleConnection(server: Server) {
        server.on('connection', (socket: Socket) => {
            logger.debug(`New connection incoming ${socket.id}: `, socket.handshake.headers);

            // Handle connection errors
            socket.on('connect_error', async (err) => {
                logger.error('Error connecting socket: ', err);
            });

            // Handle disconnections
            socket.on('disconnect', async (reason) => {
                logger.debug(
                    `A client with id ${socket.id} is disconnected, reason: ${reason}, user: `,
                    socket.handshake.headers,
                );
            });

            // Register public events
            Router.register(socket);
        });
    }

    /**
     * Handle secure connections (e.g., authentication, authorization).
     * @param server The Socket.io server instance.
     */
    private handleSecureConnection(server: Server) {
        server.use((socket, next) => {
            const token = socket.handshake.auth?.token || socket.handshake.headers['authorization'];
            if (!token) {
                logger.warn(`Unauthorized connection attempt: ${socket.id}`);
                return next(new Error('Unauthorized'));
            }

            // Validate token (example logic, replace with your own)
            const isValid = SocketAdapter.validateToken(token);
            if (!isValid) {
                logger.warn(`Invalid token for connection: ${socket.id}`);
                return next(new Error('Invalid token'));
            }

            logger.debug(`Authorized connection: ${socket.id}`);
            next();
        });
    }
}
