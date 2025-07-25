"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = __importDefault(require("winston"));
const chalk_1 = __importDefault(require("chalk"));
const environment_1 = require("./environment");
const lodash_1 = require("lodash");
const { combine, timestamp, colorize, align, printf } = winston_1.default.format;
// Define styles for different log levels
const logStyles = {
    info: {
        color: chalk_1.default.greenBright,
        emoji: 'INFO: ',
    },
    warn: {
        color: chalk_1.default.yellowBright,
        emoji: 'WARN: ',
    },
    error: {
        color: chalk_1.default.redBright,
        emoji: 'ERROR: ',
    },
};
const format = combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), colorize(), 
// align(),
printf((info) => {
    const style = logStyles[info.level] || logStyles.info;
    const message = `${style.emoji} ${style.color(info.message)}`;
    const metadata = JSON.stringify((0, lodash_1.omit)(info, ['timestamp', 'level', 'message']));
    const logOutput = metadata !== '{}'
        ? `${chalk_1.default.cyan(info.timestamp)} ${message}\n${chalk_1.default.yellowBright(metadata)}`
        : `${chalk_1.default.cyan(info.timestamp)} ${message}`;
    return logOutput;
}));
const logger = winston_1.default.createLogger({
    level: environment_1.LOG_LEVEL,
    format,
    transports: [new winston_1.default.transports.Console()],
});
exports.default = logger;
