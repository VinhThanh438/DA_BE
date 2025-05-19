import { PublicController } from '@api/controllers/public.controller';
import { UploadMiddleware } from '@api/middlewares/upload.middleware';
import { validateRequest } from '@api/middlewares/validate.middleware';
import { create } from '@api/validation/quotation.validator';
import express from 'express';
const router = express.Router();

router.post('/quotation-supplier', validateRequest(create), PublicController.createSupplierQuotation)

router.post('/uploads', UploadMiddleware.uploadFiles(), PublicController.uploadFile);

export default router;
