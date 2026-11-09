import { useRef } from 'react'
import { NavLink } from 'react-router-dom'
import { Collapse } from 'bootstrap'

function BrandLogo() {
  return (
    <svg
      width="30"
      height="30"
      viewBox="0 0 64 64"
      className="me-2"
      role="img"
      aria-label="Digital Art Supplies logo"
    >
      <rect width="64" height="64" rx="12" fill="#e7e1f5" />
      {/* stylized stylus: shaft + nib tip + tail cap */}
      <line x1="16" y1="48" x2="38" y2="26" stroke="#332a55" strokeWidth="6" strokeLinecap="round" />
      <path d="M38,26 L46,18 L50,26 L42,34 Z" fill="#7a5fc4" stroke="#332a55" strokeWidth="2" strokeLinejoin="round" />
      <circle cx="16" cy="48" r="4.5" fill="#332a55" />
    </svg>
  )
}

// Displayed on every page. Provides the identity/logo link back to Home and
// links to the four main views, plus a live cart-count badge. Bootstrap's
// navbar + collapse components handle the switch from a horizontal layout
// on wide screens to a vertical, toggled menu on narrow ones.
function NavBar({ cartCount }) {
  const linkClass = ({ isActive }) =>
    'nav-link' + (isActive ? ' active fw-semibold' : '')

  const collapseRef = useRef(null)

  // On narrow screens the nav links live inside a Bootstrap collapse that
  // the hamburger button toggles open. Bootstrap doesn't close it for you
  // when a link inside is clicked, so without this a mobile visitor who taps
  // "Shop" lands on the Shop view with the menu still covering the page. On
  // wide screens the collapse is always visible via CSS regardless of this
  // "show" state, so calling hide() here is a harmless no-op there.
  function closeMobileMenu() {
    if (collapseRef.current) {
      Collapse.getOrCreateInstance(collapseRef.current).hide()
    }
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-dark sticky-top" id="site-navbar">
      <div className="container">
        <NavLink className="navbar-brand d-flex align-items-center brand-text" to="/">
          <BrandLogo />
          <span>Digital Art Supplies</span>
        </NavLink>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#mainNavCollapse"
          aria-controls="mainNavCollapse"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div
          className="collapse navbar-collapse"
          id="mainNavCollapse"
          ref={collapseRef}
          onClick={closeMobileMenu}
        >
          <ul className="navbar-nav ms-auto mb-2 mb-lg-0 align-items-lg-center">
            <li className="nav-item">
              <NavLink className={linkClass} to="/" end>
                Home
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className={linkClass} to="/shop">
                Shop
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className={linkClass} to="/account">
                Account
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className={linkClass} to="/customers">
                Customers
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                className={(navData) => `${linkClass(navData)} position-relative`}
                to="/cart"
              >
                Cart
                {cartCount > 0 && (
                  <span className="badge rounded-pill bg-danger ms-1" aria-label={`${cartCount} items in cart`}>
                    {cartCount}
                  </span>
                )}
              </NavLink>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  )
}

export default NavBar
