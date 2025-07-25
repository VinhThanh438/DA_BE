import { GateLogController } from '@api/controllers/gate-log.controller';
import { validateRequest } from '@api/middlewares/validate.middleware';
import { approve, queryById, } from '@api/validation/common.validator';
import { connect, queryFilter, update } from '@api/validation/gate-log.validator';
import express from 'express';

const router = express.Router();
const controller = GateLogController.getInstance();

router.get('/', validateRequest(queryFilter), controller.paginate.bind(controller));

router.get('/:id', validateRequest(queryById), controller.getById.bind(controller));

router.put('/:id', validateRequest(update), controller.updateGateLog.bind(controller));

router.put('/approve/:id', validateRequest(approve), controller.approve.bind(controller));

router.post('/connect', validateRequest(connect), controller.connect.bind(controller));

router.delete('/:id', validateRequest(queryById), controller.delete.bind(controller));

export default router;
