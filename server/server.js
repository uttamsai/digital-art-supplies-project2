import { connectDatabase } from './database.js'
import { createApp } from './app.js'

// Connect before listening so requests always have a ready database.
async function startServer() {
  const { client, db } = await connectDatabase()
  const app = createApp({
    client,
    db,
    sessionSecret: process.env.SESSION_SECRET,
    secureCookies: process.env.NODE_ENV === 'production',
    taxRate: Number(process.env.TAX_RATE || 0.095),
  })
  const server = app.listen(Number(process.env.PORT || 8080), '0.0.0.0', () =>
    console.log('Digital Art Supplies server is ready'),
  )
  // Finish requests and close the shared connection on shutdown.
  async function stopServer() {
    server.close(async () => {
      await client.close()
      process.exit(0)
    })
    setTimeout(() => process.exit(1), 10000).unref()
  }
  process.on('SIGTERM', stopServer)
  process.on('SIGINT', stopServer)
}

startServer().catch((error) => {
  console.error('Server startup failed:', error.name)
  process.exit(1)
})
