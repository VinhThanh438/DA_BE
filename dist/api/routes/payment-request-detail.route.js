"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const payment_request_detail_controller_1 = require("../controllers/payment-request-detail.controller");
const validate_middleware_1 = require("../middlewares/validate.middleware");
const payment_request_detail_validator_1 = require("../validation/payment-request-detail.validator");
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const controller = payment_request_detail_controller_1.PaymentRequestDetailController.getInstance();
router.get('/', (0, validate_middleware_1.validateRequest)(payment_request_detail_validator_1.queryFilter), controller.paginate.bind(controller));
exports.default = router;
