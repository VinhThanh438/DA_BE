"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const base_service_1 = require("./master/base.service");
const notification_repo_1 = require("../repositories/notification.repo");
class NotificationService extends base_service_1.BaseService {
    constructor() {
        super(new notification_repo_1.NotificationRepo());
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new NotificationService();
        }
        return this.instance;
    }
}
exports.NotificationService = NotificationService;
