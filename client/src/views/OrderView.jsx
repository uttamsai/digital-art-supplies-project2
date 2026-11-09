import { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { api } from '../utils/api.js'
import { formatCurrency } from '../utils/cart.js'

// Display a saved order's items, addresses, and totals.
export default function OrderView({ user }) {
  const { orderId } = useParams()
  const location = useLocation()
  const [order, setOrder] = useState(null)
  const [error, setError] = useState('')
  useEffect(() => {
    setOrder(null)
    setError('')
    if (user)
      api(`/orders/${orderId}`)
        .then((data) => setOrder(data.order))
        .catch((error) => setError(error.message))
  }, [user, orderId])
  return (
    <div className="container py-5">
      <h1 className="h3 mb-4">
        {location.state?.created ? 'Order Confirmation' : 'Order Details'}
      </h1>
      {!user ? (
        <Link to="/account">Log in to view this order</Link>
      ) : error ? (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      ) : !order ? (
        <p role="status">Loading order…</p>
      ) : (
        <>
          {location.state?.created && (
            <div className="alert alert-success" role="status">
              Your demo order was saved. No payment was charged.
            </div>
          )}
          <p>
            {order.customer.firstName} {order.customer.lastName} — {order.customer.email}
          </p>
          <p>
            Order {order._id}
            <br />
            {new Date(order.orderDate).toLocaleString()} — {order.status}
          </p>
          <div className="row g-4 mb-4">
            {['shippingAddress', 'billingAddress'].map((key) => (
              <div className="col-md-6" key={key}>
                <div className="card">
                  <div className="card-body">
                    <h2 className="h5">{key === 'shippingAddress' ? 'Shipping' : 'Billing'}</h2>
                    <p>
                      {order.customer.firstName} {order.customer.lastName}
                      <br />
                      {order[key].street}
                      <br />
                      {order[key].city}, {order[key].state} {order[key].zip}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="card mb-4">
            <ul className="list-group list-group-flush">
              {order.items.map((item) => (
                <li key={item.cartItemId} className="list-group-item">
                  {item.name} × {item.quantity}
                  <br />
                  <span className="text-muted">
                    {item.size}, {item.color} — {formatCurrency(item.unitPrice)} each —{' '}
                    {formatCurrency(item.lineTotal)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <p>
            Subtotal: {formatCurrency(order.subtotal)}
            <br />
            Tax: {formatCurrency(order.tax)}
            <br />
            Shipping: {formatCurrency(order.shippingCost)}
            <br />
            <strong>Total: {formatCurrency(order.total)}</strong>
          </p>
          <p>
            {order.payment.cardType} ending in {order.payment.last4}
          </p>
          <Link className="btn btn-outline-primary me-2" to="/orders">
            View Orders
          </Link>
          <Link className="btn btn-primary" to="/shop">
            Continue Shopping
          </Link>
        </>
      )}
    </div>
  )
}
