import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import { createServer } from 'http';
import logger from '@common/logger';

export class SocketAdapter {
    private static io: Server;
    private static httpServer: HttpServer;

    /**
     * Get the Socket.io instance.
     */
    public static async getSocketInstance(): Promise<Server> {
        if (!this.io) {
            this.io = new Server(this.getHttpServer(), {
                cors: {
                    origin: '*',
                    methods: ['GET', 'POST'],
                },
            });
            logger.info('Socket.io instance created.');
        }
        return this.io;
    }

    /**
     * Get the HTTP server instance.
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
        // Thay thế bằng logic xác thực token của bạn
        if (!token) {
            logger.warn('Token validation failed: Token is missing.');
            return false;
        }

        // Ví dụ: token hợp lệ là "valid-token"
        const isValid = token === 'valid-token';
        if (!isValid) {
            logger.warn('Token validation failed: Invalid token.');
        }
        return isValid;
    }
}
