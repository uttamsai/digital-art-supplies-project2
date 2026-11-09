import { useCallback, useEffect, useState } from 'react'

const apiUrl = '/api/customers'

// Show the customer names returned by the server.
function CustomersView() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Request the latest customer list from the API.
  const loadCustomers = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch(apiUrl)
      if (!response.ok) throw new Error(`Request failed (${response.status})`)
      const data = await response.json()
      if (!Array.isArray(data.customers)) throw new Error('Unexpected response from the server')
      setCustomers(data.customers)
    } catch (err) {
      setError(err.message || 'Could not load customers')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadCustomers()
  }, [loadCustomers])

  // Reload the list when Refresh customers is clicked.
  function handleRefresh(event) {
    event.preventDefault()
    loadCustomers()
  }

  return (
    <div className="container py-5">
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h1 className="h3 mb-1">Customers</h1>
          <p className="text-muted mb-0">
            Customers saved for the Digital Art Supplies class project.
          </p>
        </div>
        <form onSubmit={handleRefresh}>
          <button type="submit" className="btn btn-outline-primary" disabled={loading}>
            Refresh customers
          </button>
        </form>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}
      {loading ? (
        <p role="status">Loading customers…</p>
      ) : customers.length === 0 ? (
        <p>No customers have been added yet.</p>
      ) : (
        <div className="card">
          <ul className="list-group list-group-flush">
            {customers.map((customer) => (
              <li key={customer.id} className="list-group-item">
                {customer.name}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default CustomersView
