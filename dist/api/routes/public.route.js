"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_controller_1 = require("../controllers/common.controller");
const partner_controller_1 = require("../controllers/partner.controller");
const product_controller_1 = require("../controllers/product.controller");
const public_controller_1 = require("../controllers/public.controller");
const ratelimiter_middleware_1 = require("../middlewares/ratelimiter.middleware");
const upload_middleware_1 = require("../middlewares/upload.middleware");
const validate_middleware_1 = require("../middlewares/validate.middleware");
const common_validator_1 = require("../validation/common.validator");
const partner_validator_1 = require("../validation/partner.validator");
const public_validator_1 = require("../validation/public.validator");
const quotation_validator_1 = require("../validation/quotation.validator");
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const partnerController = partner_controller_1.PartnerController.getInstance();
router.post('/quotation-supplier', (0, validate_middleware_1.validateRequest)(quotation_validator_1.create), public_controller_1.PublicController.createSupplierQuotation);
router.get('/partner/find', (0, validate_middleware_1.validateRequest)(partner_validator_1.queryByConditions), partnerController.findByConditions.bind(partnerController));
router.post('/uploads', ratelimiter_middleware_1.RateLimiterMiddleware.uploadLimiter, upload_middleware_1.UploadMiddleware.uploadFiles(), public_controller_1.PublicController.uploadFile);
// product
const controller = product_controller_1.ProductController.getInstance();
router.get('/product/search', (0, validate_middleware_1.validateRequest)(public_validator_1.queryFilter), controller.search.bind(controller));
router.get('/code', (0, validate_middleware_1.validateRequest)(common_validator_1.getCode), common_controller_1.CommonController.getCode);
exports.default = router;
