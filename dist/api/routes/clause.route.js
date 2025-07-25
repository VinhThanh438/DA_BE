"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const validate_middleware_1 = require("../middlewares/validate.middleware");
const clause_controller_1 = require("../controllers/clause.controller");
const clause_validator_1 = require("../validation/clause.validator");
const common_validator_1 = require("../validation/common.validator");
const spatial_classification_middleware_1 = require("../middlewares/spatial-classification.middleware");
const router = express_1.default.Router();
const controller = clause_controller_1.ClauseController.getInstance();
router.get('/', (0, validate_middleware_1.validateRequest)(common_validator_1.queryFilter), controller.paginate.bind(controller));
router.get('/:id', (0, validate_middleware_1.validateRequest)(common_validator_1.queryById), controller.getById.bind(controller));
router.post('/', (0, validate_middleware_1.validateRequest)(clause_validator_1.createClause), spatial_classification_middleware_1.SpatialClassificationMiddleware.assignInfoToRequest, controller.create.bind(controller));
router.put('/:id', (0, validate_middleware_1.validateRequest)(clause_validator_1.updateClause), controller.update.bind(controller));
router.delete('/:id', (0, validate_middleware_1.validateRequest)(common_validator_1.queryById), controller.delete.bind(controller));
exports.default = router;
