import { getProductImage, useImageFallback } from '../utils/images.js'
import { calcLineTotal, formatCurrency } from '../utils/cart.js'

// Displays one line of the shopping cart: name, image, the selected size and
// color, quantity controls, unit price, and the line total. To change size
// or color the user removes the item and adds it again from the product
// page, per the assignment spec — this component only adjusts quantity or
// removes the item entirely.
function CartItem({ item, onIncrease, onDecrease, onRemove }) {
  return (
    <div className="cart-item d-flex align-items-center gap-3 py-3 border-bottom">
      <img
        src={getProductImage(item.image)}
        alt={item.name}
        className="cart-item-img rounded"
        onError={(e) => useImageFallback(e, item.imageFallback)}
      />

      <div className="flex-grow-1">
        <h3 className="h6 mb-1">{item.name}</h3>
        <p className="small text-muted mb-1">
          {item.size} &middot; Color: {item.color}
        </p>
        <p className="small mb-0">{formatCurrency(item.unitPrice)} each</p>
      </div>

      <div className="d-flex align-items-center gap-2">
        <button
          type="button"
          className="btn btn-outline-secondary btn-sm"
          onClick={() => onDecrease(item.cartItemId)}
          aria-label={`Decrease quantity of ${item.name}`}
        >
          &minus;
        </button>
        <span className="quantity-value" aria-label="Quantity">
          {item.quantity}
        </span>
        <button
          type="button"
          className="btn btn-outline-secondary btn-sm"
          onClick={() => onIncrease(item.cartItemId)}
          aria-label={`Increase quantity of ${item.name}`}
        >
          &#43;
        </button>
      </div>

      <div className="text-end line-total" style={{ minWidth: '5.5rem' }}>
        <strong>{formatCurrency(calcLineTotal(item))}</strong>
      </div>

      <button
        type="button"
        className="btn btn-link text-danger btn-sm"
        onClick={() => onRemove(item.cartItemId)}
        aria-label={`Remove ${item.name} from cart`}
      >
        Remove
      </button>
    </div>
  )
}

export default CartItem
