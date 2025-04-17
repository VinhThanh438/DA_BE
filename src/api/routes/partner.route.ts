import { PartnerController } from '@api/controllers/partner.controller';
import { validateRequest } from '@api/middlewares/validate.middleware';
import { create } from '@api/validation/partner.validator';
import { update } from '@api/validation/partner.validator';
import express from 'express';
const router = express.Router();
router.get('/', PartnerController.getAll);

router.get('/:id', PartnerController.getById);

router.post('/', validateRequest(create), PartnerController.create);

router.put('/:id', validateRequest(update), PartnerController.update);

router.delete('/:id', PartnerController.delete);

export default router;
