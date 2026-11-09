import { Router } from 'express'
import { createOrder, getOrders, getOrder, quoteOrder } from '../controllers/orderController.js'
import { requireLogin } from '../middleware/auth.js'
const router = Router()
router.use(requireLogin)
router.post('/', createOrder)
router.get('/', getOrders)
router.get('/quote', quoteOrder)
router.get('/:id', getOrder)
export default router
