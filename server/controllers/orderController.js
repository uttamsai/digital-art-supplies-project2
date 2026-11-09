import { ObjectId } from 'mongodb'
import { HttpError, address, text } from '../utils/validation.js'
import { buildCartItem, validateStock } from './cartController.js'
import { saveSession } from '../utils/session.js'

// Show current server-calculated totals before checkout.
export async function quoteOrder(request, response) {
  const items = await Promise.all(
    (request.session.cart || []).map((item) => buildCartItem(request.app.locals.db, item)),
  )
  await validateStock(request.app.locals.db, items)
  const cents = items.reduce(
    (sum, item) => sum + Math.round(item.unitPrice * 100) * item.quantity,
    0,
  )
  const tax = Math.round(cents * request.app.locals.taxRate)
  response.json({
    items,
    subtotal: cents / 100,
    tax: tax / 100,
    shippingCost: 0,
    total: (cents + tax) / 100,
  })
}

// Calculate prices again and save only safe payment details.
export async function createOrder(request, response) {
  const db = request.app.locals.db
  const userId = new ObjectId(request.session.userId)
  const checkoutKey = text(request.body.checkoutKey, 'checkout reference', true, 80)
  const existing = await db.collection('orders').findOne({ userId, checkoutKey })
  if (existing) return response.json({ order: existing })
  const cart = request.session.cart || []
  if (!cart.length) throw new HttpError(400, 'Your cart is empty.')
  const user = await db.collection('users').findOne({ _id: userId })
  if (!user) throw new HttpError(401, 'Please log in again.')
  const shippingAddress = address(request.body.shippingAddress)
  const billingAddress = address(request.body.billingAddress)
  const cardType = text(request.body.payment?.cardType, 'card type', true, 30)
  const last4 = text(request.body.payment?.last4, 'last four card digits', true, 4)
  if (
    !['Visa', 'Mastercard', 'American Express', 'Discover'].includes(cardType) ||
    !/^\d{4}$/.test(last4)
  ) {
    throw new HttpError(400, 'Enter valid demo payment details.')
  }
  const items = await Promise.all(cart.map((item) => buildCartItem(db, item)))
  await validateStock(db, items)
  const subtotalCents = items.reduce(
    (total, item) => total + Math.round(item.unitPrice * 100) * item.quantity,
    0,
  )
  const taxCents = Math.round(subtotalCents * request.app.locals.taxRate)
  const order = {
    _id: new ObjectId(),
    userId,
    checkoutKey,
    orderDate: new Date(),
    customer: {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
    },
    shippingAddress,
    billingAddress,
    payment: { cardType, last4 },
    items: items.map((item) => ({
      ...item,
      lineTotal: (Math.round(item.unitPrice * 100) * item.quantity) / 100,
    })),
    subtotal: subtotalCents / 100,
    tax: taxCents / 100,
    shippingCost: 0,
    total: (subtotalCents + taxCents) / 100,
    status: 'Submitted',
  }
  try {
    await db.collection('orders').insertOne(order)
  } catch (error) {
    if (error.code !== 11000) throw error
    const duplicate = await db.collection('orders').findOne({ userId, checkoutKey })
    return response.json({ order: duplicate })
  }
  request.session.cart = []
  await saveSession(request)
  response.status(201).json({ order })
}

// Read only this customer's orders.
export async function getOrders(request, response) {
  const orders = await request.app.locals.db
    .collection('orders')
    .find({ userId: new ObjectId(request.session.userId) })
    .sort({ orderDate: -1 })
    .toArray()
  response.json({ orders })
}

// Find one order belonging to the current customer.
export async function getOrder(request, response) {
  if (!/^[a-f\d]{24}$/i.test(request.params.id)) throw new HttpError(404, 'Order not found.')
  const order = await request.app.locals.db.collection('orders').findOne({
    _id: new ObjectId(request.params.id),
    userId: new ObjectId(request.session.userId),
  })
  if (!order) throw new HttpError(404, 'Order not found.')
  response.json({ order })
}
