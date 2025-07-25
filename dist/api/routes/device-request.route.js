"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const device_request_controller_1 = require("../controllers/device-request.controller");
const validate_middleware_1 = require("../middlewares/validate.middleware");
const common_validator_1 = require("../validation/common.validator");
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
router.get('/', (0, validate_middleware_1.validateRequest)(common_validator_1.queryFilter), device_request_controller_1.DeviceRequestController.getAll);
router.put('/:id', device_request_controller_1.DeviceRequestController.approveRequest);
exports.default = router;
