import logger from '@common/logger';
import { Socket } from 'socket.io';

export class Router {
    /**
     * Register public event
     * @param socket Socket
     */
    static register(socket: Socket): void {
        // Register public event here
        socket.on('ping', () => {
            logger.debug('Receive ping');
            socket.send('pong');
        });

        // example
        logger.info(`Registering events for socket: ${socket.id}`);

        // Event: Join a room
        socket.emit('notification', () => {
            logger.info(`emitting notification to socket: ${socket.id}`);
            socket.send('message', `User ${socket.id} has joined the room.`);
        });

        // Handle disconnection
        socket.on('disconnect', () => {
            logger.info(`Socket ${socket.id} disconnected.`);
        });
    }
    /**
     * Register private event
     * @param socket Socket
     */
    static registerPrivate(socket: Socket): void {
        // Register private event here
    }
}
