import { BomController } from '@api/controllers/bom.controller';
import { validateRequest } from '@api/middlewares/validate.middleware';
import { create, queryFilter, update } from '@api/validation/bom.validator';
import { queryById } from '@api/validation/common.validator';
import express from 'express';

const router = express.Router();
const controller = BomController.getInstance();

router.get('/', validateRequest(queryFilter), controller.paginate.bind(controller));

router.get('/material-estimation', validateRequest(queryFilter), controller.getMaterialEstimation.bind(controller));

router.get('/:id', validateRequest(queryById), controller.getById.bind(controller));

router.post('/', validateRequest(create), controller.create.bind(controller));

router.put('/:id', validateRequest(update), controller.update.bind(controller));

router.delete('/:id', validateRequest(queryById), controller.delete.bind(controller));

export default router;
