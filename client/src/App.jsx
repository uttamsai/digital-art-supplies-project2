import { useEffect, useRef, useState } from 'react'
import { HashRouter, Routes, Route } from 'react-router-dom'
import NavBar from './components/NavBar.jsx'
import Footer from './components/Footer.jsx'
import HomeView from './views/HomeView.jsx'
import ShopView from './views/ShopView.jsx'
import ProductDetailView from './views/ProductDetailView.jsx'
import AccountView from './views/AccountView.jsx'
import CreateAccountView from './views/CreateAccountView.jsx'
import CustomersView from './views/CustomersView.jsx'
import CartView from './views/CartView.jsx'
import CheckoutView from './views/CheckoutView.jsx'
import OrdersView from './views/OrdersView.jsx'
import OrderView from './views/OrderView.jsx'
import { calcItemCount } from './utils/cart.js'
import { api } from './utils/api.js'

// Share the server's catalog, account, and cart with each page.
function App() {
  const [products, setProducts] = useState([])
  const [cartItems, setCartItems] = useState([])
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const cartPending = useRef(false)

  // Restore data when the browser reloads.
  useEffect(() => {
    async function load() {
      try {
        const [catalog, cart, account] = await Promise.all([
          api('/products'),
          api('/cart'),
          api('/account').catch((error) => {
            if (error.status === 401) return { user: null }
            throw error
          }),
        ])
        setProducts(catalog.products)
        setCartItems(cart.cartItems)
        setUser(account.user)
      } catch (error) {
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // Allow one cart change at a time and display server errors.
  async function changeCart(path, method, body) {
    if (cartPending.current) throw new Error('Please wait for the current cart change.')
    cartPending.current = true
    setBusy(true)
    setError('')
    try {
      const data = await api(path, method, body)
      setCartItems(data.cartItems)
    } catch (error) {
      setError(error.message)
      throw error
    } finally {
      cartPending.current = false
      setBusy(false)
    }
  }

  // Add the selected product options to the session cart.
  function addToCart({ product, size, color, quantity }) {
    return changeCart('/cart', 'POST', { productId: product.id, size, color, quantity })
  }

  // Adjust a quantity using the server's latest cart response.
  function adjustQuantity(id, difference) {
    const item = cartItems.find((item) => item.cartItemId === id)
    const quantity = item.quantity + difference
    changeCart(
      `/cart/${encodeURIComponent(id)}`,
      quantity > 0 ? 'PUT' : 'DELETE',
      quantity > 0 ? { quantity } : undefined,
    ).catch(() => {})
  }

  // Remove an item from the session cart.
  function removeFromCart(id) {
    changeCart(`/cart/${encodeURIComponent(id)}`, 'DELETE').catch(() => {})
  }

  return (
    <HashRouter>
      <div className="d-flex flex-column min-vh-100">
        <NavBar cartCount={calcItemCount(cartItems)} />
        <main className="flex-grow-1">
          {error && (
            <div className="container pt-3">
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            </div>
          )}
          {loading ? (
            <p className="container py-5" role="status">
              Loading store…
            </p>
          ) : (
            <Routes>
              <Route path="/" element={<HomeView products={products} />} />
              <Route path="/shop" element={<ShopView products={products} />} />
              <Route
                path="/product/:productId"
                element={<ProductDetailView products={products} onAddToCart={addToCart} />}
              />
              <Route
                path="/account"
                element={<AccountView user={user} onUser={setUser} onCart={setCartItems} />}
              />
              <Route path="/account/create" element={<CreateAccountView />} />
              <Route path="/customers" element={<CustomersView />} />
              <Route
                path="/cart"
                element={
                  <CartView
                    cartItems={cartItems}
                    busy={busy}
                    onIncrease={(id) => adjustQuantity(id, 1)}
                    onDecrease={(id) => adjustQuantity(id, -1)}
                    onRemove={removeFromCart}
                  />
                }
              />
              <Route
                path="/checkout"
                element={<CheckoutView user={user} cartItems={cartItems} onCart={setCartItems} />}
              />
              <Route path="/orders" element={<OrdersView user={user} />} />
              <Route path="/orders/:orderId" element={<OrderView user={user} />} />
            </Routes>
          )}
        </main>
        <Footer />
      </div>
    </HashRouter>
  )
}

export default App
