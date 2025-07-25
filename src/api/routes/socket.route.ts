import logger from '@common/logger';
import { Socket } from 'socket.io';

export class SocketRouter {
    /**
     * Register public event
     * @param socket Socket
     */
    static register(socket: Socket): void {
        socket.emit('notification', {
            id: 123,
            title: 'Bạn có đơn hàng mới',
            content: 'Đơn hàng #1234 vừa được tạo.',
            send_at: new Date(),
            is_seen: false,
            dayToEvent: 'Hôm nay',
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
