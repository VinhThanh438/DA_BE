import { LevelController } from '@api/controllers/level.controller';
import express from 'express';
const router = express.Router();

router.get('/', LevelController.getAll);

router.get('/:id', LevelController.findOne);

router.post('/', LevelController.create);

router.put('/:id', LevelController.update);

router.delete('/:id', LevelController.delete);

export default router;