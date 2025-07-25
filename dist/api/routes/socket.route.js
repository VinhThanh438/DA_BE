"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketRouter = void 0;
class SocketRouter {
    /**
     * Register public event
     * @param socket Socket
     */
    static register(socket) {
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
    static registerPrivate(socket) {
        // Register private event here
    }
}
exports.SocketRouter = SocketRouter;
