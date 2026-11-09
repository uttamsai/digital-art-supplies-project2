import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'bootstrap/dist/css/bootstrap.min.css'
// Importing the ESM package (rather than the prebuilt dist bundle) still
// registers Bootstrap's data-api listeners (e.g. the navbar toggler's
// data-bs-toggle="collapse") as a side effect, and additionally lets any
// component import the Collapse/etc. classes directly for programmatic
// control (see NavBar, which closes the mobile menu after navigation).
import 'bootstrap'
import './styles/index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
