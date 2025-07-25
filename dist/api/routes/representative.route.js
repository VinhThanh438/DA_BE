"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const representative_controller_1 = require("../controllers/representative.controller");
const validate_middleware_1 = require("../middlewares/validate.middleware");
const common_validator_1 = require("../validation/common.validator");
const representative_validator_1 = require("../validation/representative.validator");
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const controller = representative_controller_1.RepresentativeController.getInstance();
router.get('/', (0, validate_middleware_1.validateRequest)(common_validator_1.queryFilter), controller.paginate.bind(controller));
router.get('/debt', (0, validate_middleware_1.validateRequest)(representative_validator_1.queryDebtFilter), controller.getDebt.bind(controller));
router.get('/:id', (0, validate_middleware_1.validateRequest)(common_validator_1.queryById), controller.getById.bind(controller));
exports.default = router;
