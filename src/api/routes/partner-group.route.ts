import { PartnerGroupController } from '@api/controllers/partner-group.controller';
import { validateRequest } from '@api/middlewares/validate.middleware';
import { queryById } from '@api/validation/common.validator';
import { create, queryFilter, update } from '@api/validation/partner-group.validator';
import express from 'express';
const router = express.Router();

router.get('/', validateRequest(queryFilter), PartnerGroupController.getAll);

router.get('/:id', validateRequest(queryById), PartnerGroupController.getById);

router.post('/', validateRequest(create), PartnerGroupController.create);

router.put('/:id', validateRequest(update), PartnerGroupController.update);

router.delete('/:id', validateRequest(queryById), PartnerGroupController.delete);

export default router;
