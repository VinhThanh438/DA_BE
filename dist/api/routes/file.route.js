"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const file_controller_1 = require("../controllers/file.controller");
const ratelimiter_middleware_1 = require("../middlewares/ratelimiter.middleware");
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const controller = file_controller_1.FileController.getInstance();
router.get('/', ratelimiter_middleware_1.RateLimiterMiddleware.exportFileLimiter, controller.export.bind(controller));
exports.default = router;
