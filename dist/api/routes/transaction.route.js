"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const transaction_controller_1 = require("../controllers/transaction.controller");
const validate_middleware_1 = require("../middlewares/validate.middleware");
const common_validator_1 = require("../validation/common.validator");
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const controller = transaction_controller_1.TransactionController.getInstance();
router.get('/', (0, validate_middleware_1.validateRequest)(common_validator_1.queryFilter), controller.paginate.bind(controller));
router.get('/:id', (0, validate_middleware_1.validateRequest)(common_validator_1.queryById), controller.getById.bind(controller));
exports.default = router;
