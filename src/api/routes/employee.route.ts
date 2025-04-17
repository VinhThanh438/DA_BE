import { EmployeeController } from '@api/controllers/employee.controller';
import { validateRequest } from '@api/middlewares/validate.middleware';
import { queryById } from '@api/validation/common.validator';
import { createEmployee } from '@api/validation/employee.validator';
import express from 'express';
const router = express.Router();

router.get('/', EmployeeController.getAll);

router.get('/:id', validateRequest(queryById), EmployeeController.getById);

router.post('/', validateRequest(createEmployee), EmployeeController.create);

router.put('/:id',  validateRequest(createEmployee), EmployeeController.update);

router.delete('/:id', validateRequest(queryById), EmployeeController.delete);

export default router;
