"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const gate_log_controller_1 = require("../controllers/gate-log.controller");
const validate_middleware_1 = require("../middlewares/validate.middleware");
const common_validator_1 = require("../validation/common.validator");
const gate_log_validator_1 = require("../validation/gate-log.validator");
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const controller = gate_log_controller_1.GateLogController.getInstance();
router.get('/', (0, validate_middleware_1.validateRequest)(gate_log_validator_1.queryFilter), controller.paginate.bind(controller));
router.get('/:id', (0, validate_middleware_1.validateRequest)(common_validator_1.queryById), controller.getById.bind(controller));
router.put('/:id', (0, validate_middleware_1.validateRequest)(gate_log_validator_1.update), controller.updateGateLog.bind(controller));
router.put('/approve/:id', (0, validate_middleware_1.validateRequest)(common_validator_1.approve), controller.approve.bind(controller));
router.post('/connect', (0, validate_middleware_1.validateRequest)(gate_log_validator_1.connect), controller.connect.bind(controller));
router.delete('/:id', (0, validate_middleware_1.validateRequest)(common_validator_1.queryById), controller.delete.bind(controller));
exports.default = router;
