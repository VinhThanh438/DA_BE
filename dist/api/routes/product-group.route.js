"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const product_group_controller_1 = require("../controllers/product-group.controller");
const spatial_classification_middleware_1 = require("../middlewares/spatial-classification.middleware");
const validate_middleware_1 = require("../middlewares/validate.middleware");
const common_validator_1 = require("../validation/common.validator");
const product_validator_1 = require("../validation/product.validator");
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const controller = product_group_controller_1.ProductGroupController.getInstance();
router.get('/', (0, validate_middleware_1.validateRequest)(common_validator_1.queryFilter), controller.getAll.bind(controller));
router.get('/:id', (0, validate_middleware_1.validateRequest)(common_validator_1.queryById), controller.getById.bind(controller));
router.post('/', (0, validate_middleware_1.validateRequest)(product_validator_1.createProductGroup), spatial_classification_middleware_1.SpatialClassificationMiddleware.assignInfoToRequest, controller.create.bind(controller));
router.put('/:id', (0, validate_middleware_1.validateRequest)(product_validator_1.updateProductGroup), controller.update.bind(controller));
router.delete('/:id', (0, validate_middleware_1.validateRequest)(common_validator_1.queryById), controller.delete.bind(controller));
exports.default = router;
