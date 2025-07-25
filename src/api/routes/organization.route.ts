import { OrganizationController } from '@api/controllers/organization.controller';
import { validateRequest } from '@api/middlewares/validate.middleware';
import { queryById } from '@api/validation/common.validator';
import { create, update, queryFilter } from '@api/validation/organization.validator';
import express from 'express';

const router = express.Router();
const controller = OrganizationController.getInstance();

router.get('/', validateRequest(queryFilter), controller.paginate.bind(controller));

router.get('/model', validateRequest(queryFilter), controller.getHierarchyModel.bind(controller));

router.get('/:id', validateRequest(queryById), controller.getById.bind(controller));

router.post('/', validateRequest(create), controller.create.bind(controller));

router.put('/:id', validateRequest(update), controller.update.bind(controller));

router.delete('/:id', validateRequest(queryById), controller.delete.bind(controller));

export default router;
