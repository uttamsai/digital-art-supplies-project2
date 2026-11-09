import { Link } from 'react-router-dom'
import { getProductImage, useImageFallback } from '../utils/images.js'
import { formatCurrency } from '../utils/cart.js'

// Displays a single product. Clicking anywhere on the card navigates to the
// Product Detail view (via the :productId route), where the full
// information, options, quantity, and Add to Cart form live.
function ProductCard({ product }) {
  const {
    id,
    name,
    brand,
    category,
    price,
    salePrice,
    description,
    hasScreen,
    rating,
    numberOfReviews,
    newArrival,
    featuredProduct,
    quantityInStock,
  } = product

  const onSale = typeof salePrice === 'number'

  return (
    <div className="col">
      <Link to={`/product/${id}`} className="product-card-link text-decoration-none">
        <div className="card h-100 product-card shadow-sm">
          <div className="product-card-img-wrap">
            <img
              src={getProductImage(product.image)}
              alt={name}
              className="card-img-top product-card-img"
              loading="lazy"
              onError={(e) => useImageFallback(e, product.imageFallback)}
            />
            <div className="product-card-badges">
              {newArrival && <span className="badge text-bg-info me-1">New</span>}
              {featuredProduct && <span className="badge text-bg-warning me-1">Featured</span>}
              {onSale && <span className="badge text-bg-danger">Sale</span>}
            </div>
          </div>
          <div className="card-body d-flex flex-column">
            <p className="text-uppercase text-muted small mb-1">{brand} &middot; {category}</p>
            <h3 className="h6 card-title mb-1">{name}</h3>
            <p className="card-text small text-muted flex-grow-1">{description}</p>
            <div className="d-flex justify-content-between align-items-center mb-1">
              <span className="badge text-bg-light border">
                {hasScreen ? 'Screen' : 'No Screen'}
              </span>
              <span className="rating small" aria-label={`Rated ${rating} out of 5`}>
                ★ {rating.toFixed(1)}{' '}
                <span className="text-muted">({numberOfReviews})</span>
              </span>
            </div>
            <div className="d-flex align-items-baseline justify-content-between">
              <div>
                {onSale ? (
                  <>
                    <span className="text-decoration-line-through text-muted me-2 small">
                      {formatCurrency(price)}
                    </span>
                    <span className="fw-bold text-danger">{formatCurrency(salePrice)}</span>
                  </>
                ) : (
                  <span className="fw-bold">{formatCurrency(price)}</span>
                )}
              </div>
              {quantityInStock === 0 && (
                <span className="badge text-bg-secondary">Out of stock</span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </div>
  )
}

export default ProductCard
