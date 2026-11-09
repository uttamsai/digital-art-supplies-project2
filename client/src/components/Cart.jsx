import { Link } from 'react-router-dom'
import CartItem from './CartItem.jsx'
import { calcSubtotal, calcItemCount, formatCurrency } from '../utils/cart.js'

// Receives the cartItems[] array as a prop and uses .map() (inside CartItem's
// parent loop below) to render one CartItem per entry, plus the subtotal and
// total item count computed live from the current cart state.
function Cart({ cartItems, onIncrease, onDecrease, onRemove }) {
  if (cartItems.length === 0) {
    return (
      <div className="text-center py-5">
        <p className="lead mb-3">Your cart is empty.</p>
        <Link to="/shop" className="btn btn-primary">
          Continue Shopping
        </Link>
      </div>
    )
  }

  const subtotal = calcSubtotal(cartItems)
  const itemCount = calcItemCount(cartItems)

  return (
    <div className="row">
      <div className="col-lg-8">
        {cartItems.map((item) => (
          <CartItem
            key={item.cartItemId}
            item={item}
            onIncrease={onIncrease}
            onDecrease={onDecrease}
            onRemove={onRemove}
          />
        ))}
      </div>

      <div className="col-lg-4 mt-4 mt-lg-0">
        <div className="card cart-summary-card">
          <div className="card-body">
            <h2 className="h5 card-title">Order Summary</h2>
            <div className="d-flex justify-content-between mb-2">
              <span>Items</span>
              <span>{itemCount}</span>
            </div>
            <div className="d-flex justify-content-between mb-3">
              <span>Subtotal</span>
              <strong>{formatCurrency(subtotal)}</strong>
            </div>
            <p className="small text-muted">
              This is a class project demo &mdash; checkout is simulated and no payment is
              processed.
            </p>
            <Link to="/shop" className="btn btn-outline-secondary w-100">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart
