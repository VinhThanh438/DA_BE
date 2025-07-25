"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const application_1 = require("./worker/application");
const logger_1 = __importDefault(require("./common/logger"));
/**
 * Entrypoint for bootstrapping and starting the application.
 * Might configure aspects like logging, telemetry, memory leak observation or even orchestration before.
 * This is about to come later!
 */
application_1.Application.createApplication().then(() => {
    logger_1.default.info('The worker was started successfully!');
});
