import { MongoClient } from 'mongodb'
import { parseEnv } from 'node:util'

// Open one client and reuse it for requests and sessions.
export async function connectDatabase() {
  const setting = (process.env.MONGODB_URI || '').trim()
  const uri = /^MONGODB_URI\s*=/.test(setting) ? parseEnv(setting).MONGODB_URI : setting
  if (!uri) throw new Error('MONGODB_URI is required')
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 15000 })
  await client.connect()
  const db = client.db(process.env.MONGODB_DB || 'digital_art_supplies_project2')
  await setupIndexes(db)
  return { client, db }
}

// Keep account identities and checkout references unique.
export async function setupIndexes(db) {
  await db.collection('users').createIndex({ email: 1 }, { unique: true })
  await db.collection('users').createIndex({ loginKey: 1 }, { unique: true })
  await db.collection('products').createIndex({ id: 1 }, { unique: true })
  await db.collection('orders').createIndex({ userId: 1, checkoutKey: 1 }, { unique: true })
}
