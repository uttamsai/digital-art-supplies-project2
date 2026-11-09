function Footer() {
  return (
    <footer className="site-footer mt-auto py-4">
      <div className="container d-flex flex-column flex-sm-row justify-content-between align-items-center gap-2 small">
        <span>&copy; {new Date().getFullYear()} Digital Art Supplies. All rights reserved.</span>
        <span className="footer-note">
          Class project for CS351 &mdash; not a real store. No orders are processed.
        </span>
      </div>
    </footer>
  )
}

export default Footer
