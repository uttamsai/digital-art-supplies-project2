import { Link } from 'react-router-dom'
import Cart from '../components/Cart.jsx'

function CartView({ cartItems, onIncrease, onDecrease, onRemove, busy }) {
  return (
    <div className="container py-5">
      <h1 className="h3 mb-4">Your Cart</h1>
      <fieldset disabled={busy}>
        <Cart
          cartItems={cartItems}
          onIncrease={onIncrease}
          onDecrease={onDecrease}
          onRemove={onRemove}
        />
      </fieldset>
      {cartItems.length > 0 && !busy && (
        <Link to="/checkout" className="btn btn-primary mt-3">
          Proceed to Checkout
        </Link>
      )}
    </div>
  )
}

export default CartView
