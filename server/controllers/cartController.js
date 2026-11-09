import { HttpError, quantity, text } from '../utils/validation.js'
import { saveSession } from '../utils/session.js'

// Use current database prices and validate the selected options.
export async function buildCartItem(db, input) {
  const product = await db.collection('products').findOne({ id: Number(input.productId) })
  if (!product) throw new HttpError(404, 'Product not found.')
  const size = text(input.size, 'bundle')
  const color = text(input.color, 'color')
  const count = quantity(input.quantity)
  if (!product.sizes.includes(size) || !product.colors.includes(color))
    throw new HttpError(400, 'Choose valid product options.')
  if (count > product.quantityInStock)
    throw new HttpError(400, `Only ${product.quantityInStock} of ${product.name} are available.`)
  return {
    cartItemId: `${product.id}::${size}::${color}`,
    productId: product.id,
    name: product.name,
    brand: product.brand,
    image: product.image,
    imageFallback: product.imageFallback,
    size,
    color,
    quantity: count,
    unitPrice: product.salePrice ?? product.price,
  }
}

// Return the cart saved in this browser session.
export async function getCart(request, response) {
  response.json({ cartItems: request.session.cart || [] })
}

// Add a selection or increase its existing quantity.
export async function addItem(request, response) {
  const cart = [...(request.session.cart || [])]
  let item = await buildCartItem(request.app.locals.db, request.body)
  const index = cart.findIndex((entry) => entry.cartItemId === item.cartItemId)
  if (index >= 0) {
    item = await buildCartItem(request.app.locals.db, {
      ...item,
      quantity: cart[index].quantity + item.quantity,
    })
    cart[index] = item
  } else {
    if (cart.length >= 100) throw new HttpError(400, 'The cart is full.')
    cart.push(item)
  }
  await validateStock(request.app.locals.db, cart)
  request.session.cart = cart
  await saveSession(request)
  response.json({ cartItems: cart })
}

// Validate and save a new cart quantity.
export async function updateItem(request, response) {
  const cart = [...(request.session.cart || [])]
  const index = cart.findIndex((entry) => entry.cartItemId === request.params.itemId)
  if (index < 0) throw new HttpError(404, 'Cart item not found.')
  cart[index] = await buildCartItem(request.app.locals.db, {
    ...cart[index],
    quantity: request.body.quantity,
  })
  await validateStock(request.app.locals.db, cart)
  request.session.cart = cart
  await saveSession(request)
  response.json({ cartItems: cart })
}

// Remove the selected item from the cart.
export async function removeItem(request, response) {
  request.session.cart = (request.session.cart || []).filter(
    (entry) => entry.cartItemId !== request.params.itemId,
  )
  await saveSession(request)
  response.json({ cartItems: request.session.cart })
}

// Count all bundles of a product against the same stock amount.
export async function validateStock(db, cart) {
  const counts = new Map()
  for (const item of cart)
    counts.set(item.productId, (counts.get(item.productId) || 0) + item.quantity)
  for (const [id, count] of counts) {
    const product = await db.collection('products').findOne({ id })
    if (!product || count > product.quantityInStock)
      throw new HttpError(400, 'The cart exceeds available stock. Please reduce the quantity.')
  }
}
