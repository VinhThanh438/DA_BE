import { create, queryFilter, update } from '@api/validation/facility.validator';
import { FacilityController } from '@api/controllers/facility.controller';
import { validateRequest } from '@api/middlewares/validate.middleware';
import { queryById } from '@api/validation/common.validator';
import express from 'express';

const router = express.Router();
const controller = FacilityController.getInstance();

router.get('/', validateRequest(queryFilter), controller.paginate.bind(controller));
router.get('/:id', validateRequest(queryById), controller.getById.bind(controller));
router.post('/', validateRequest(create), controller.create.bind(controller));
router.put('/:id', validateRequest(update), controller.update.bind(controller));
router.delete('/:id', validateRequest(queryById), controller.delete.bind(controller));

export default router;