import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../utils/api.js'
import { formatCurrency } from '../utils/cart.js'

// Display only the signed-in customer's orders.
export default function OrdersView({ user }) {
  const [orders, setOrders] = useState(null)
  const [error, setError] = useState('')
  useEffect(() => {
    if (user)
      api('/orders')
        .then((data) => setOrders(data.orders))
        .catch((error) => setError(error.message))
  }, [user])
  return (
    <div className="container py-5">
      <h1 className="h3 mb-4">Your Orders</h1>
      {!user ? (
        <Link to="/account">Log in to view your orders</Link>
      ) : error ? (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      ) : !orders ? (
        <p role="status">Loading orders…</p>
      ) : !orders.length ? (
        <p>You have no orders yet.</p>
      ) : (
        <div className="card">
          <ul className="list-group list-group-flush">
            {orders.map((order) => (
              <li key={order._id} className="list-group-item">
                <Link to={`/orders/${order._id}`}>Order {order._id}</Link>
                <br />
                {new Date(order.orderDate).toLocaleString()} — {formatCurrency(order.total)} —{' '}
                {order.status}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
