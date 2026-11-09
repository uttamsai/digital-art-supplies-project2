import { HttpError } from '../utils/validation.js'

// Require a signed-in session for account and order requests.
export function requireLogin(request, _response, next) {
  if (!request.session.userId) return next(new HttpError(401, 'Please log in to continue.'))
  next()
}

// Block cross-site writes; the browser and API share one origin.
export function checkOrigin(request, _response, next) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) return next()
  const origin = request.get('Origin')
  const expected = `${request.protocol}://${request.get('host')}`
  const local =
    process.env.NODE_ENV !== 'production' &&
    ['http://localhost:5173', 'http://127.0.0.1:5173'].includes(origin)
  if (origin && origin !== expected && !local)
    return next(new HttpError(403, 'This request origin is not allowed.'))
  next()
}
