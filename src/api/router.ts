import express from 'express';
import authRoutes from '@api/auth/auth.route'
import postRoutes from '@api/post/post.route'
import topicRoutes from '@api/topic/topic.route'
const router = express.Router();

router.use('/auth', authRoutes)
router.use('/post', postRoutes)
router.use('/topic', topicRoutes)

export default router;
