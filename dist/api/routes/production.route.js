"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const spatial_classification_middleware_1 = require("../middlewares/spatial-classification.middleware");
const production_controller_1 = require("../controllers/production.controller");
const production_validator_1 = require("../validation/production.validator");
const validate_middleware_1 = require("../middlewares/validate.middleware");
const common_validator_1 = require("../validation/common.validator");
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const controller = production_controller_1.ProductionController.getInstance();
router.get('/', (0, validate_middleware_1.validateRequest)(production_validator_1.productionValidator.queryFilter), controller.paginate.bind(controller));
router.get('/:id', (0, validate_middleware_1.validateRequest)(common_validator_1.queryById), controller.getById.bind(controller));
router.post('/', (0, validate_middleware_1.validateRequest)(production_validator_1.productionValidator.create), spatial_classification_middleware_1.SpatialClassificationMiddleware.assignInfoToRequest, controller.create.bind(controller));
router.put('/:id', (0, validate_middleware_1.validateRequest)(production_validator_1.productionValidator.update), controller.update.bind(controller));
router.delete('/:id', (0, validate_middleware_1.validateRequest)(common_validator_1.queryById), controller.delete.bind(controller));
exports.default = router;
