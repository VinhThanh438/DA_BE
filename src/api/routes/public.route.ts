import { CommonController } from '@api/controllers/common.controller';
import { PartnerController } from '@api/controllers/partner.controller';
import { ProductController } from '@api/controllers/product.controller';
import { PublicController } from '@api/controllers/public.controller';
import { RateLimiterMiddleware } from '@api/middlewares/ratelimiter.middleware';
import { UploadMiddleware } from '@api/middlewares/upload.middleware';
import { validateRequest } from '@api/middlewares/validate.middleware';
import { getCode } from '@api/validation/common.validator';
import { queryByConditions } from '@api/validation/partner.validator';
import { queryFilter } from '@api/validation/public.validator';
import { create } from '@api/validation/quotation.validator';
import express from 'express';
const router = express.Router();

const partnerController = PartnerController.getInstance();

router.post('/quotation-supplier', validateRequest(create), PublicController.createSupplierQuotation);

router.get(
    '/partner/find',
    validateRequest(queryByConditions),
    partnerController.findByConditions.bind(partnerController),
);

router.post(
    '/uploads',
    RateLimiterMiddleware.uploadLimiter,
    UploadMiddleware.uploadFiles(),
    PublicController.uploadFile,
);

// product
const controller = ProductController.getInstance();
router.get('/product/search', validateRequest(queryFilter), controller.search.bind(controller));

router.get('/code', validateRequest(getCode), CommonController.getCode);

export default router;
