// Shared helpers for working with the cartItems[] state array kept in App.
// Each cart item looks like:
// {
//   cartItemId: string   // unique key = productId + size + color
//   productId: number
//   name: string
//   image: string
//   size: number | string
//   color: string
//   quantity: number
//   unitPrice: number
// }

export function makeCartItemId(productId, size, color) {
  return `${productId}::${size}::${color}`
}

export function calcLineTotal(item) {
  return item.unitPrice * item.quantity
}

export function calcSubtotal(cartItems) {
  return cartItems.reduce((sum, item) => sum + calcLineTotal(item), 0)
}

export function calcItemCount(cartItems) {
  return cartItems.reduce((sum, item) => sum + item.quantity, 0)
}

export function formatCurrency(amount) {
  return amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}
