import { PostController } from '@api/post/post.controller';
import express from 'express';
const router = express.Router();

router.post('/', PostController.create);

export default router;
