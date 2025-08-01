import { ProductionStepController } from '@api/controllers/production-step.controller';
import { queryById, queryFilter } from '@api/validation/common.validator';
import { validateRequest } from '@api/middlewares/validate.middleware';
import { create, update } from '@api/validation/production-step.validator';
import express from 'express';

const router = express.Router();
const controller = ProductionStepController.getInstance();

router.get('/', validateRequest(queryFilter), controller.paginate.bind(controller));

router.get('/:id', validateRequest(queryById), controller.getById.bind(controller));

router.post('/', validateRequest(create), controller.create.bind(controller));

router.put('/:id', validateRequest(update), controller.update.bind(controller));

router.delete('/:id', validateRequest(queryById), controller.delete.bind(controller));

export default router;
