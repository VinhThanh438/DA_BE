import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import { createServer } from 'http';
import logger from '@common/logger';

export class SocketAdapter {
    private static io: Server;
    private static httpServer: HttpServer;

    /**
     * Get the Socket.io instance using existing HTTP server.
     * @param httpServer Optional HTTP server to use (if sharing with Express)
     */
    public static async getSocketInstance(httpServer?: HttpServer): Promise<Server> {
        if (!this.io) {
            const serverToUse = httpServer || this.getHttpServer();
            this.io = new Server(serverToUse, {
                cors: {
                    origin: '*',
                    methods: ['GET', 'POST'],
                },
            });
        }
        return this.io;
    }

    /**
     * Get the HTTP server instance (only used when not sharing).
     */
    public static getHttpServer(): HttpServer {
        if (!this.httpServer) {
            this.httpServer = createServer(); // Create http if not exist
            logger.info('HTTP server instance created.');
        }
        return this.httpServer;
    }

    /**
     * Validate the token (example logic).
     * @param token The token to validate.
     */
    public static validateToken(token: string): boolean {
        if (!token) {
            logger.warn('Token validation failed: Token is missing.');
            return false;
        }

        const isValid = token === 'valid-token';
        if (!isValid) {
            logger.warn('Token validation failed: Invalid token.');
        }
        return isValid;
    }
}
