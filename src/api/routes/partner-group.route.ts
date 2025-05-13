import { PartnerGroupController } from '@api/controllers/partner-group.controller';
import { validateRequest } from '@api/middlewares/validate.middleware';
import { queryById } from '@api/validation/common.validator';
import { create, queryFilter, update } from '@api/validation/partner-group.validator';
import express from 'express';

const router = express.Router();
const controller = PartnerGroupController.getInstance();

router.get('/', validateRequest(queryFilter), controller.paginate.bind(controller));

router.get('/:id', validateRequest(queryById), controller.getById.bind(controller));

router.post('/', validateRequest(create), controller.create.bind(controller));

router.put('/:id', validateRequest(update), controller.update.bind(controller));

router.delete('/:id', validateRequest(queryById), controller.delete.bind(controller));

export default router;
