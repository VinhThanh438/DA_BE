import { EmployeeController } from '@api/controllers/employee.controller';
import express from 'express';
const router = express.Router();

router.get('/', EmployeeController.getAll);

router.get('/:id', EmployeeController.getById);

router.post('/', EmployeeController.create);

router.put('/:id', EmployeeController.update);

router.delete('/:id', EmployeeController.delete);

export default router;
