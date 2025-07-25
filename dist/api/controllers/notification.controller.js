"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationController = void 0;
const notification_service_1 = require("../../common/services/notification.service");
const base_controller_1 = require("./base.controller");
class NotificationController extends base_controller_1.BaseController {
    constructor() {
        super(notification_service_1.NotificationService.getInstance());
        this.service = notification_service_1.NotificationService.getInstance();
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new NotificationController();
        }
        return this.instance;
    }
}
exports.NotificationController = NotificationController;
