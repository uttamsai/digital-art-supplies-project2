import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import {
  createAccount,
  login,
  logout,
  getAccount,
  updateAccount,
} from '../controllers/accountController.js'
import { requireLogin } from '../middleware/auth.js'

const router = Router()
const loginLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many attempts. Please try again later.' },
})
router.post('/accounts', loginLimit, createAccount)
router.post('/login', loginLimit, login)
router.post('/logout', logout)
router.get('/account', requireLogin, getAccount)
router.put('/account', requireLogin, updateAccount)
export default router
