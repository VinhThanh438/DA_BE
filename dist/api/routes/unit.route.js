"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const unit_controller_1 = require("../controllers/unit.controller");
const spatial_classification_middleware_1 = require("../middlewares/spatial-classification.middleware");
const validate_middleware_1 = require("../middlewares/validate.middleware");
const common_validator_1 = require("../validation/common.validator");
const unit_validator_1 = require("../validation/unit.validator");
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const controller = unit_controller_1.UnitController.getInstance();
router.get('/', (0, validate_middleware_1.validateRequest)(common_validator_1.queryFilter), controller.getAll.bind(controller));
router.get('/:id', (0, validate_middleware_1.validateRequest)(common_validator_1.queryById), controller.getById.bind(controller));
router.post('/', (0, validate_middleware_1.validateRequest)(unit_validator_1.createUnit), spatial_classification_middleware_1.SpatialClassificationMiddleware.assignInfoToRequest, controller.create.bind(controller));
router.put('/:id', (0, validate_middleware_1.validateRequest)(unit_validator_1.updateUnit), controller.update.bind(controller));
router.delete('/:id', (0, validate_middleware_1.validateRequest)(common_validator_1.queryById), controller.delete.bind(controller));
exports.default = router;
