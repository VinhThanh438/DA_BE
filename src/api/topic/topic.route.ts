import express from 'express'
import { TopicController } from './topic.controller'
import { validate } from 'express-validation'
import { create } from './topic.validator'
const router = express.Router()

router.get('/', TopicController.getAll)

router.post('/', validate(create, { context: true }), TopicController.create)

export default router