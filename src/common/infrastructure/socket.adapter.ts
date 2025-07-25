import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { SocketRouter } from '@api/routes/socket.route';
import logger from '@common/logger';

export class SocketAdapter {
    private static server?: Server;
    private static activeConnections: Map<string, Socket> = new Map();

    /**
     * Initialize and get Socket.IO server instance
     */
    public static async connect(httpServer: HttpServer): Promise<Server> {
        if (!this.server) {
            this.server = new Server(httpServer, {
                cors: {
                    origin: '*',
                    methods: ['GET', 'POST'],
                },
            });

            this.handleConnection();
        }
        return this.server;
    }

    public static getServer(): Server | undefined {
        return this.server;
    }

    /**
     * Get the Socket.IO server instance
     */
    public static handleConnection(): void {
        if (!this.server) {
            logger.error('Socket.IO server is not initialized.');
            return;
        }
        this.server.on('connection', (socket: Socket) => {
            this.activeConnections.set(socket.id, socket);
            logger.info(`Socket ${socket.id} connected`);

            socket.on('disconnect', () => {
                this.activeConnections.delete(socket.id);
                logger.info(`Socket ${socket.id} disconnected`);
            });

            SocketRouter.register(socket);
        });
    }

    /**
     * Gracefully shutdown Socket.IO server
     */
    public static async disconnect(): Promise<void> {
        try {
            if (!this.server) return;

            this.activeConnections.forEach((socket) => {
                socket.disconnect(true);
            });

            this.activeConnections.clear();
            this.server = undefined;

            logger.info('Socket.IO server shutdown completed');
            return;
        } catch (error) {
            logger.error('Socket shutdown error:', error);
            throw error;
        }
    }
}
