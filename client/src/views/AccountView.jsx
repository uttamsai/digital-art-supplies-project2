import { useState } from 'react'
import { Link } from 'react-router-dom'
import AddressFields from '../components/AddressFields.jsx'
import { api } from '../utils/api.js'

// Sign in or display the current customer's account.
export default function AccountView({ user, onUser, onCart }) {
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({})

  // Authenticate and restore the session cart.
  async function handleLogin(event) {
    event.preventDefault()
    setError('')
    setBusy(true)
    try {
      const data = await api('/login', 'POST', { login, password })
      onUser(data.user)
      setPassword('')
      onCart((await api('/cart')).cartItems)
    } catch (error) {
      setError(error.message)
    } finally {
      setBusy(false)
    }
  }

  // End the session and remove its cart from the browser.
  async function handleLogout() {
    setError('')
    setBusy(true)
    try {
      await api('/logout', 'POST')
      onUser(null)
      onCart([])
      setEditing(false)
      setMessage('')
    } catch (error) {
      setError(error.message)
    } finally {
      setBusy(false)
    }
  }

  // Save account changes while retaining the permanent account ID.
  async function saveAccount(event) {
    event.preventDefault()
    setError('')
    setBusy(true)
    try {
      const data = await api('/account', 'PUT', form)
      onUser(data.user)
      setEditing(false)
      setMessage('Account updated.')
    } catch (error) {
      setError(error.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <h1 className="h3 mb-4 text-center">Account</h1>
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}
          {message && (
            <div className="alert alert-success" role="status">
              {message}
            </div>
          )}
          {!user ? (
            <>
              <div className="card mb-4">
                <div className="card-body">
                  <h2 className="h5 card-title">Log In</h2>
                  <form onSubmit={handleLogin}>
                    <div className="mb-3">
                      <label htmlFor="login" className="form-label">
                        Username or Email
                      </label>
                      <input
                        id="login"
                        className="form-control"
                        required
                        value={login}
                        onChange={(event) => setLogin(event.target.value)}
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="password" className="form-label">
                        Password
                      </label>
                      <input
                        id="password"
                        type="password"
                        className="form-control"
                        required
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                      />
                    </div>
                    <button className="btn btn-primary w-100" disabled={busy}>
                      Log In
                    </button>
                  </form>
                </div>
              </div>
              <div className="text-center">
                <p className="mb-2 text-muted">New to Digital Art Supplies?</p>
                <Link to="/account/create" className="btn btn-outline-secondary w-100">
                  Create an Account
                </Link>
              </div>
            </>
          ) : (
            <div className="card">
              <div className="card-body">
                <h2 className="h5">Welcome, {user.firstName}</h2>
                {editing ? (
                  <form onSubmit={saveAccount}>
                    {['firstName', 'lastName', 'login', 'email', 'phone', 'password'].map(
                      (name) => (
                        <div className="mb-3" key={name}>
                          <label className="form-label" htmlFor={`edit-${name}`}>
                            {
                              {
                                firstName: 'First Name',
                                lastName: 'Last Name',
                                login: 'Login',
                                email: 'Email',
                                phone: 'Phone',
                                password: 'New Password (leave blank to keep)',
                              }[name]
                            }
                          </label>
                          <input
                            id={`edit-${name}`}
                            className="form-control"
                            type={
                              name === 'password' ? 'password' : name === 'email' ? 'email' : 'text'
                            }
                            required={!['password', 'phone'].includes(name)}
                            value={form[name] || ''}
                            onChange={(event) => setForm({ ...form, [name]: event.target.value })}
                          />
                        </div>
                      ),
                    )}
                    <AddressFields
                      value={form.shippingAddress}
                      onChange={(shippingAddress) => setForm({ ...form, shippingAddress })}
                    />
                    <button className="btn btn-primary me-2" disabled={busy}>
                      Save Changes
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      disabled={busy}
                      onClick={() => setEditing(false)}
                    >
                      Cancel
                    </button>
                  </form>
                ) : (
                  <>
                    <p>
                      {user.firstName} {user.lastName}
                      <br />
                      {user.login}
                      <br />
                      {user.email}
                      <br />
                      {user.phone}
                    </p>
                    <p>
                      {user.shippingAddress.street}
                      <br />
                      {user.shippingAddress.city}, {user.shippingAddress.state}{' '}
                      {user.shippingAddress.zip}
                    </p>
                    <div className="d-flex flex-wrap gap-2">
                      <button
                        className="btn btn-primary"
                        onClick={() => {
                          setForm({ ...user, password: '' })
                          setEditing(true)
                          setMessage('')
                        }}
                      >
                        Edit Account
                      </button>
                      <Link className="btn btn-outline-primary" to="/orders">
                        View Orders
                      </Link>
                      <button
                        className="btn btn-outline-secondary"
                        disabled={busy}
                        onClick={handleLogout}
                      >
                        Log Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
