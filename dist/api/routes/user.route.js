"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_controller_1 = require("../controllers/user.controller");
const spatial_classification_middleware_1 = require("../middlewares/spatial-classification.middleware");
const validate_middleware_1 = require("../middlewares/validate.middleware");
const common_validator_1 = require("../validation/common.validator");
const user_validator_1 = require("../validation/user.validator");
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const controller = user_controller_1.UserController.getInstance();
router.get('/', 
// PermissionMiddleware.hasPermission('warehouse', 'c'),
(0, validate_middleware_1.validateRequest)(common_validator_1.queryFilter), controller.paginate.bind(controller));
router.get('/:id', (0, validate_middleware_1.validateRequest)(common_validator_1.queryById), controller.getById.bind(controller));
router.post('/', (0, validate_middleware_1.validateRequest)(user_validator_1.createUser), spatial_classification_middleware_1.SpatialClassificationMiddleware.assignInfoToRequest, controller.create.bind(controller));
router.put('/:id', (0, validate_middleware_1.validateRequest)(user_validator_1.updateUser), controller.updateUser.bind(controller));
router.delete('/:id', (0, validate_middleware_1.validateRequest)(common_validator_1.queryById), controller.delete.bind(controller));
exports.default = router;
