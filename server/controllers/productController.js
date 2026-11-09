import { HttpError } from '../utils/validation.js'

// Read the product catalog from MongoDB.
export async function getProducts(request, response) {
  const products = await request.app.locals.db
    .collection('products')
    .find({})
    .sort({ id: 1 })
    .toArray()
  response.json({ products })
}

// Read one product by its catalog ID.
export async function getProduct(request, response) {
  const product = await request.app.locals.db
    .collection('products')
    .findOne({ id: Number(request.params.id) })
  if (!product) throw new HttpError(404, 'Product not found.')
  response.json({ product })
}
