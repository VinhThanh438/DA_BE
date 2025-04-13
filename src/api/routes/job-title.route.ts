import { JobTitleController } from '@api/controllers/job-title.controller';
import express from 'express';
const router = express.Router();

router.get('/', JobTitleController.getAll);

router.get('/:id', JobTitleController.findOne);

router.post('/', JobTitleController.create);

router.put('/:id', JobTitleController.update);

router.delete('/:id', JobTitleController.delete);

export default router;