import { useMemo, useState } from 'react'
import ProductList from '../components/ProductList.jsx'
import Pagination from '../components/Pagination.jsx'

const PAGE_SIZE = 10

// Displays the full catalog using ProductList, with a category filter, a
// text search, and pagination limited to 10 products per page as required
// by the assignment.
function ShopView({ products }) {
  const [category, setCategory] = useState('All')
  const [query, setQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const categories = useMemo(
    () => ['All', ...new Set(products.map((p) => p.category))],
    [products],
  )

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory = category === 'All' || p.category === category
      const matchesQuery =
        query.trim() === '' ||
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.description.toLowerCase().includes(query.toLowerCase())
      return matchesCategory && matchesQuery
    })
  }, [products, category, query])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(currentPage, totalPages)
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  function handleCategoryChange(value) {
    setCategory(value)
    setCurrentPage(1)
  }

  function handleQueryChange(value) {
    setQuery(value)
    setCurrentPage(1)
  }

  return (
    <div className="container py-5">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end gap-3 mb-4">
        <div>
          <h1 className="h3 mb-1">Shop All Tablets</h1>
          <p className="text-muted mb-0">
            {filtered.length} product{filtered.length === 1 ? '' : 's'} found
          </p>
        </div>

        <div className="d-flex flex-column flex-sm-row gap-2">
          <input
            type="search"
            className="form-control"
            placeholder="Search products..."
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            aria-label="Search products"
          />
          <select
            className="form-select"
            value={category}
            onChange={(e) => handleCategoryChange(e.target.value)}
            aria-label="Filter by category"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      <ProductList products={pageItems} />

      <Pagination
        currentPage={safePage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  )
}

export default ShopView
