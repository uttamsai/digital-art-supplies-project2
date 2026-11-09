import express from 'express'
import session from 'express-session'
import MongoStore from 'connect-mongo'
import { fileURLToPath } from 'node:url'
import accountRoutes from './routes/accountRoutes.js'
import productRoutes from './routes/productRoutes.js'
import cartRoutes from './routes/cartRoutes.js'
import orderRoutes from './routes/orderRoutes.js'
import { checkOrigin } from './middleware/auth.js'

// Build the API and serve the React application from the same origin.
export function createApp({ client, db, sessionSecret, secureCookies = false, taxRate = 0.095 }) {
  if (!sessionSecret || sessionSecret.length < 32)
    throw new Error('SESSION_SECRET must contain at least 32 characters')
  if (!Number.isFinite(taxRate) || taxRate < 0 || taxRate > 1)
    throw new Error('TAX_RATE must be between 0 and 1')
  const app = express()
  app.set('trust proxy', 1)
  app.disable('x-powered-by')
  app.locals.db = db
  app.locals.taxRate = taxRate
  app.use(express.json({ limit: '32kb' }))
  app.use('/api', (request, response, next) => {
    request.body ??= {}
    if (Array.isArray(request.body))
      return response.status(400).json({ error: 'Send a JSON object.' })
    next()
  })
  app.use('/api', checkOrigin)
  app.use(
    session({
      name: 'digitalart.sid',
      secret: sessionSecret,
      resave: false,
      saveUninitialized: false,
      store: MongoStore.create({
        client,
        dbName: db.databaseName,
        collectionName: 'sessions',
        ttl: 86400,
      }),
      cookie: { httpOnly: true, secure: secureCookies, sameSite: 'lax', maxAge: 86400000 },
    }),
  )
  app.get('/health', (_request, response) => response.json({ ok: true }))
  app.use('/api', accountRoutes)
  app.use('/api/products', productRoutes)
  app.use('/api/cart', cartRoutes)
  app.use('/api/orders', orderRoutes)
  app.get('/api/customers', async (_request, response) => {
    const docs = await db
      .collection('users')
      .find({}, { projection: { login: 1 } })
      .sort({ _id: 1 })
      .toArray()
    response.json({ customers: docs.map((user) => ({ id: String(user._id), name: user.login })) })
  })
  app.use('/api', (_request, response) =>
    response.status(404).json({ error: 'API route not found.' }),
  )
  const clientDist = fileURLToPath(new URL('../client/dist/', import.meta.url))
  app.use(express.static(clientDist))
  app.get('/{*path}', (_request, response) => response.sendFile('index.html', { root: clientDist }))
  app.use((error, _request, response, _next) => {
    const status = error.code === 11000 ? 409 : error.status || 500
    const message =
      error.code === 11000
        ? 'That login or email is already registered.'
        : status < 500
          ? error.message
          : 'The server could not complete this request.'
    if (status >= 500) console.error('Request failed:', error.name)
    response.status(status).json({ error: message })
  })
  return app
}
