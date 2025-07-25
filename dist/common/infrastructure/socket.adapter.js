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
exports.SocketAdapter = void 0;
const socket_io_1 = require("socket.io");
const socket_route_1 = require("../../api/routes/socket.route");
const logger_1 = __importDefault(require("../logger"));
class SocketAdapter {
    /**
     * Initialize and get Socket.IO server instance
     */
    static connect(httpServer) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.server) {
                this.server = new socket_io_1.Server(httpServer, {
                    cors: {
                        origin: '*',
                        methods: ['GET', 'POST'],
                    },
                });
                this.handleConnection();
            }
            return this.server;
        });
    }
    static getServer() {
        return this.server;
    }
    /**
     * Get the Socket.IO server instance
     */
    static handleConnection() {
        if (!this.server) {
            logger_1.default.error('Socket.IO server is not initialized.');
            return;
        }
        this.server.on('connection', (socket) => {
            this.activeConnections.set(socket.id, socket);
            logger_1.default.info(`Socket ${socket.id} connected`);
            socket.on('disconnect', () => {
                this.activeConnections.delete(socket.id);
                logger_1.default.info(`Socket ${socket.id} disconnected`);
            });
            socket_route_1.SocketRouter.register(socket);
        });
    }
    /**
     * Gracefully shutdown Socket.IO server
     */
    static disconnect() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!this.server)
                    return;
                this.activeConnections.forEach((socket) => {
                    socket.disconnect(true);
                });
                this.activeConnections.clear();
                this.server = undefined;
                logger_1.default.info('Socket.IO server shutdown completed');
                return;
            }
            catch (error) {
                logger_1.default.error('Socket shutdown error:', error);
                throw error;
            }
        });
    }
}
exports.SocketAdapter = SocketAdapter;
SocketAdapter.activeConnections = new Map();
