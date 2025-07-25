"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const role_controller_1 = require("../controllers/role.controller");
const validate_middleware_1 = require("../middlewares/validate.middleware");
const common_validator_1 = require("../validation/common.validator");
const role_validator_1 = require("../validation/role.validator");
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const controller = role_controller_1.RoleController.getInstance();
router.get('/', controller.getAll.bind(controller));
router.get('/:id', (0, validate_middleware_1.validateRequest)(common_validator_1.queryById), controller.getById.bind(controller));
router.post('/', (0, validate_middleware_1.validateRequest)(role_validator_1.create), controller.create.bind(controller));
router.put('/permission/:id', (0, validate_middleware_1.validateRequest)(role_validator_1.updatePermission), controller.updatePermission.bind(controller));
router.put('/:id', (0, validate_middleware_1.validateRequest)(role_validator_1.update), controller.update.bind(controller));
router.delete('/:id', (0, validate_middleware_1.validateRequest)(common_validator_1.queryById), controller.delete.bind(controller));
exports.default = router;
