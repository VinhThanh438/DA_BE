import { PartnerController } from '@api/controllers/partner.controller';
import express from 'express'
const router = express.Router()

router.get('/', PartnerController.getAll);

router.get('/:id', PartnerController.getById);

router.post('/', PartnerController.create);

router.put('/:id', PartnerController.update);

router.delete('/:id', PartnerController.delete);

export default router