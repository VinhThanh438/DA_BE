import { EmployeeController } from '@api/controllers/employee.controller';
import { validateRequest } from '@api/middlewares/validate.middleware';
import { queryById } from '@api/validation/common.validator';
import { createEmployee, queryFilter, updateEmployee } from '@api/validation/employee.validator';
import express from 'express';

const router = express.Router();
const controller = EmployeeController.getInstance();

router.get('/', validateRequest(queryFilter), controller.getAll.bind(controller));

router.get('/:id', validateRequest(queryById), controller.getById.bind(controller));

router.post('/', validateRequest(createEmployee), controller.create.bind(controller));

router.put('/:id', validateRequest(updateEmployee), controller.update.bind(controller));

router.delete('/:id', validateRequest(queryById), controller.delete.bind(controller));

export default router;
