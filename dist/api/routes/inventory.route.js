"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const inventory_controller_1 = require("../controllers/inventory.controller");
const spatial_classification_middleware_1 = require("../middlewares/spatial-classification.middleware");
const validate_middleware_1 = require("../middlewares/validate.middleware");
const common_validator_1 = require("../validation/common.validator");
const inventory_validator_1 = require("../validation/inventory.validator");
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const controller = inventory_controller_1.InventoryController.getInstance();
router.get('/', (0, validate_middleware_1.validateRequest)(inventory_validator_1.queryFilter), controller.paginate.bind(controller));
router.get('/report', (0, validate_middleware_1.validateRequest)(inventory_validator_1.report), controller.getInventoryReport.bind(controller));
router.get('/ledger', (0, validate_middleware_1.validateRequest)(common_validator_1.queryFilter), controller.getInventoryReportDetail.bind(controller));
router.get('/import-detail', (0, validate_middleware_1.validateRequest)(common_validator_1.queryFilter), controller.getInventoryImportDetail.bind(controller));
router.get('/different', (0, validate_middleware_1.validateRequest)(inventory_validator_1.queryFilter), controller.different.bind(controller));
router.get('/:id', (0, validate_middleware_1.validateRequest)(common_validator_1.queryById), controller.getById.bind(controller));
router.post('/', (0, validate_middleware_1.validateRequest)(inventory_validator_1.create), spatial_classification_middleware_1.SpatialClassificationMiddleware.assignInfoToRequest, controller.create.bind(controller));
router.put('/:id', (0, validate_middleware_1.validateRequest)(inventory_validator_1.update), controller.update.bind(controller));
router.put('/approve/:id', (0, validate_middleware_1.validateRequest)(common_validator_1.approve), controller.approve.bind(controller));
router.put('/real-quantity/:id', (0, validate_middleware_1.validateRequest)(inventory_validator_1.updateRealQuantity), controller.updateRealQuantity.bind(controller));
router.put('/adjust-quantity/:id', (0, validate_middleware_1.validateRequest)(inventory_validator_1.updateAdjustQuantity), controller.updateAdjustQuantity.bind(controller));
router.delete('/:id', (0, validate_middleware_1.validateRequest)(common_validator_1.queryById), controller.delete.bind(controller));
exports.default = router;
