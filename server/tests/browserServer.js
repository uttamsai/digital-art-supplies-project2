import { MongoMemoryServer } from 'mongodb-memory-server'
import { MongoClient } from 'mongodb'
import { readFile } from 'node:fs/promises'
import { createApp } from '../app.js'
import { setupIndexes } from '../database.js'

// Run browser tests against an isolated temporary database.
const mongo = await MongoMemoryServer.create()
const client = new MongoClient(mongo.getUri())
await client.connect()
const db = client.db('browser_tests')
await setupIndexes(db)
const products = JSON.parse(
  await readFile(new URL('../seed/catalog.json', import.meta.url), 'utf8'),
)
await db.collection('products').insertMany(products)
const app = createApp({
  client,
  db,
  sessionSecret: 'browser-test-session-secret-not-for-production',
})
const server = app.listen(8091, '127.0.0.1')
async function stop() {
  server.close()
  await client.close()
  await mongo.stop()
  process.exit(0)
}
process.on('SIGTERM', stop)
process.on('SIGINT', stop)
