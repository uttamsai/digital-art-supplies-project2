import ProductCard from './ProductCard.jsx'

// Renders every product it is handed as a responsive grid of ProductCards.
// Required by the assignment to use .map() to turn the product collection
// into a matching collection of ProductCard components.
function ProductList({ products }) {
  if (products.length === 0) {
    return <p className="text-muted">No products match your filters right now.</p>
  }

  return (
    <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 row-cols-xl-4 g-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}

export default ProductList
