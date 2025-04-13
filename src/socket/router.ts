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
        socket.on('joinRoom', (room: string) => {
            socket.join(room);
            logger.info(`Socket ${socket.id} joined room: ${room}`);
            socket.to(room).emit('message', `User ${socket.id} has joined the room.`);
        });

        // Event: Leave a room
        socket.on('leaveRoom', (room: string) => {
            socket.leave(room);
            logger.info(`Socket ${socket.id} left room: ${room}`);
            socket.to(room).emit('message', `User ${socket.id} has left the room.`);
        });

        // Event: Send a message
        socket.on('sendMessage', ({ room, message }: { room: string; message: string }) => {
            logger.info(`Message from ${socket.id} to room ${room}: ${message}`);
            socket.to(room).emit('message', `User ${socket.id}: ${message}`);
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
