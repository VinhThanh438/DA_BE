import { PartnerGroupController } from '@api/controllers/partner-group.controller';
import express from 'express'
const router = express.Router()

router.get('/', PartnerGroupController.getAll);

router.get('/:id', PartnerGroupController.getById);

router.post('/', PartnerGroupController.create);

router.put('/:id', PartnerGroupController.update);

router.delete('/:id', PartnerGroupController.delete);

export default router