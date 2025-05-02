import { CommonController } from '@api/controllers/common.controller';
import { UploadMiddleware } from '@api/middlewares/upload.middleware';
import { validateRequest } from '@api/middlewares/validate.middleware';
import { getCode } from '@api/validation/common.validator';
import express from 'express';

const router = express.Router();

router.post('/uploads', UploadMiddleware.uploadFiles(), CommonController.uploadFile);

router.get('/code', validateRequest(getCode), CommonController.getCode);

router.get('/get-list-bank', CommonController.getListBank);

router.post('/check-bank-account', CommonController.checkBankAccount);

export default router;
