import { Router } from 'express'
import { getCart, addItem, updateItem, removeItem } from '../controllers/cartController.js'
const router = Router()
router.get('/', getCart)
router.post('/', addItem)
router.put('/:itemId', updateItem)
router.delete('/:itemId', removeItem)
export default router
