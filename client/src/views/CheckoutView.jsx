import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AddressFields from '../components/AddressFields.jsx'
import { api } from '../utils/api.js'
import { formatCurrency } from '../utils/cart.js'

// Collect addresses and demo payment details for a signed-in customer.
export default function CheckoutView({ user, cartItems, onCart }) {
  const navigate = useNavigate()
  const [shipping, setShipping] = useState(user?.shippingAddress || {})
  const [billing, setBilling] = useState(user?.shippingAddress || {})
  const [sameAddress, setSameAddress] = useState(true)
  const [cardType, setCardType] = useState('Visa')
  const [last4, setLast4] = useState('')
  const [quote, setQuote] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const checkoutKey = useRef(crypto.randomUUID())

  // Ask the server for current prices and totals.
  useEffect(() => {
    if (user)
      api('/orders/quote')
        .then(setQuote)
        .catch((error) => setError(error.message))
  }, [user, cartItems])

  // Save the order and open its confirmation page.
  async function submitOrder(event) {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      const data = await api('/orders', 'POST', {
        checkoutKey: checkoutKey.current,
        shippingAddress: shipping,
        billingAddress: sameAddress ? shipping : billing,
        payment: { cardType, last4 },
      })
      onCart([])
      navigate(`/orders/${data.order._id}`, { state: { created: true } })
    } catch (error) {
      setError(error.message)
    } finally {
      setBusy(false)
    }
  }

  if (!user)
    return (
      <div className="container py-5">
        <h1 className="h3">Checkout</h1>
        <p>Please log in before checking out. Your cart will be kept.</p>
        <Link className="btn btn-primary" to="/account">
          Log In
        </Link>
      </div>
    )
  if (!cartItems.length)
    return (
      <div className="container py-5">
        <p>Your cart is empty.</p>
        <Link to="/shop">Continue Shopping</Link>
      </div>
    )
  return (
    <div className="container py-5">
      <h1 className="h3 mb-4">Checkout</h1>
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}
      <form onSubmit={submitOrder}>
        <fieldset disabled={busy}>
          <div className="row g-4">
            <div className="col-lg-8">
              <div className="card mb-4">
                <div className="card-body">
                  <h2 className="h5">Shipping Address</h2>
                  <AddressFields prefix="shipping" value={shipping} onChange={setShipping} />
                  <div className="form-check mb-3">
                    <input
                      id="same-address"
                      type="checkbox"
                      className="form-check-input"
                      checked={sameAddress}
                      onChange={(event) => setSameAddress(event.target.checked)}
                    />
                    <label htmlFor="same-address" className="form-check-label">
                      Use shipping address for billing
                    </label>
                  </div>
                  {!sameAddress && (
                    <>
                      <h2 className="h5">Billing Address</h2>
                      <AddressFields prefix="billing" value={billing} onChange={setBilling} />
                    </>
                  )}
                </div>
              </div>
              <div className="card">
                <div className="card-body">
                  <h2 className="h5">Demo Payment</h2>
                  <p className="text-muted small">
                    No payment is processed. Enter four fictional digits only.
                  </p>
                  <div className="mb-3">
                    <label htmlFor="card-type" className="form-label">
                      Card Type
                    </label>
                    <select
                      id="card-type"
                      className="form-select"
                      value={cardType}
                      onChange={(event) => setCardType(event.target.value)}
                    >
                      {['Visa', 'Mastercard', 'American Express', 'Discover'].map((type) => (
                        <option key={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  <label htmlFor="last4" className="form-label">
                    Last Four Digits
                  </label>
                  <input
                    id="last4"
                    className="form-control"
                    inputMode="numeric"
                    pattern="[0-9]{4}"
                    maxLength={4}
                    required
                    value={last4}
                    onChange={(event) => setLast4(event.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="col-lg-4">
              <div className="card">
                <div className="card-body">
                  <h2 className="h5">Order Summary</h2>
                  {quote ? (
                    <>
                      {quote.items.map((item) => (
                        <p key={item.cartItemId}>
                          {item.name} × {item.quantity}
                          <br />
                          <span className="small text-muted">
                            {item.size}, {item.color} —{' '}
                            {formatCurrency(item.unitPrice * item.quantity)}
                          </span>
                        </p>
                      ))}
                      <p>
                        Subtotal: {formatCurrency(quote.subtotal)}
                        <br />
                        Tax: {formatCurrency(quote.tax)}
                        <br />
                        Shipping: {formatCurrency(quote.shippingCost)}
                      </p>
                      <p className="fw-bold">Total: {formatCurrency(quote.total)}</p>
                      <button className="btn btn-primary w-100" disabled={busy}>
                        {busy ? 'Submitting…' : 'Place Demo Order'}
                      </button>
                    </>
                  ) : (
                    <p role="status">Loading totals…</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </fieldset>
      </form>
    </div>
  )
}
