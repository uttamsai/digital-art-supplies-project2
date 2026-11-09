import { readFile } from 'node:fs/promises'
import { connectDatabase } from '../database.js'

// Import the original catalog once without replacing existing products.
const catalog = JSON.parse(await readFile(new URL('./catalog.json', import.meta.url), 'utf8'))
const { client, db } = await connectDatabase()
try {
  const result = await db.collection('products').bulkWrite(
    catalog.map((product) => ({
      updateOne: { filter: { id: product.id }, update: { $setOnInsert: product }, upsert: true },
    })),
  )
  console.log(`Added ${result.upsertedCount} products to ${db.databaseName}.`)
} finally {
  await client.close()
}
