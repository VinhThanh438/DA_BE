"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const notification_controller_1 = require("../controllers/notification.controller");
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const controller = notification_controller_1.NotificationController.getInstance();
// router.get('/', validateRequest(queryFilter), controller.paginate.bind(controller));
exports.default = router;
