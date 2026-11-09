import { Link } from 'react-router-dom'
import ProductList from '../components/ProductList.jsx'

// The landing view shown when the app first loads. An attractive entrance to
// the site with imagery/branding and a short pitch, plus a preview of a few
// featured products pulled from the catalog.
function HomeView({ products }) {
  const featured = products.filter((p) => p.featuredProduct).slice(0, 4)

  return (
    <>
      <section className="hero-section text-white text-center">
        <div className="container py-5">
          <h1 className="display-5 fw-bold mb-3">Digital Art Supplies to Fulfill Most Needs</h1>
          <p className="lead mb-4">
            Pen tablets, pen displays, and standalone tablets from the brands digital artists
            already trust.
          </p>
          <Link to="/shop" className="btn btn-lg btn-warning fw-semibold">
            Shop the Collection
          </Link>
        </div>
      </section>

      <section className="container py-5">
        <div className="d-flex justify-content-between align-items-end mb-4">
          <h2 className="h3 mb-0">Featured Picks</h2>
          <Link to="/shop" className="link-secondary small">
            View all products &rarr;
          </Link>
        </div>
        <ProductList products={featured} />
      </section>

      <section className="bg-body-tertiary py-5">
        <div className="container">
          <div className="row g-4 text-center">
            <div className="col-md-4">
              <h3 className="h5">Three Categories, One Standard</h3>
              <p className="text-muted small">
                Pen tablets, pen displays, and standalone tablets &mdash; every listing shows the
                same core specs so you can compare apples to apples.
              </p>
            </div>
            <div className="col-md-4">
              <h3 className="h5">Real Spec Sheets</h3>
              <p className="text-muted small">
                Active area, resolution, pressure sensitivity, and connectivity are listed on every
                product so you can order with confidence.
              </p>
            </div>
            <div className="col-md-4">
              <h3 className="h5">Class Project Notice</h3>
              <p className="text-muted small">
                This storefront is a CS351 course project. Brand names are real for realism, but
                this is not an authorized retailer; no real orders are processed.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default HomeView
