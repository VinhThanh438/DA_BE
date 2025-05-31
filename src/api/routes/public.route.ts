import { PartnerController } from '@api/controllers/partner.controller';
import { PublicController } from '@api/controllers/public.controller';
import { UploadMiddleware } from '@api/middlewares/upload.middleware';
import { validateRequest } from '@api/middlewares/validate.middleware';
import { queryByConditions } from '@api/validation/partner.validator';
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

router.post('/uploads', UploadMiddleware.uploadFiles(), PublicController.uploadFile);

export default router;
