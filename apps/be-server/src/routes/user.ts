import express, { Router } from 'express'
import documentRouter from './document'

const router: Router = express.Router()

router.use('/documents', documentRouter)

export default router
