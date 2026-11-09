import { before, after, test } from 'node:test'
import assert from 'node:assert/strict'
import request from 'supertest'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { MongoClient } from 'mongodb'
import { createApp } from '../app.js'
import { setupIndexes } from '../database.js'

let mongo, client, db, app
const shippingAddress = { street: '123 Demo Street', city: 'Hayward', state: 'CA', zip: '94542' }
const account = (login) => ({
  login,
  email: `${login}@example.invalid`,
  password: 'DemoOnly123!',
  firstName: 'Demo',
  lastName: 'Student',
  phone: '510-555-1212',
  shippingAddress,
})
const item = { productId: 1, size: 'Tablet Only', color: 'Black', quantity: 2, unitPrice: 0.01 }

before(async () => {
  mongo = await MongoMemoryServer.create()
  client = new MongoClient(mongo.getUri())
  await client.connect()
  db = client.db('project2_tests')
  await setupIndexes(db)
  await db.collection('products').insertOne({
    id: 1,
    name: 'Demo Tablet',
    brand: 'Demo',
    sizes: ['Tablet Only'],
    colors: ['Black'],
    price: 100,
    salePrice: 80,
    quantityInStock: 5,
    image: 'demo.svg',
  })
  app = createApp({
    client,
    db,
    sessionSecret: 'test-session-secret-at-least-thirty-two-characters',
  })
})

after(async () => {
  if (client) await client.close()
  if (mongo) await mongo.stop()
})

test('products come from MongoDB and missing routes return JSON', async () => {
  const list = await request(app).get('/api/products').expect(200)
  assert.equal(list.body.products[0].name, 'Demo Tablet')
  await request(app).get('/api/products/1').expect(200)
  await request(app).get('/api/products/999').expect(404)
  await request(app).get('/api/missing').expect('Content-Type', /json/).expect(404)
})

test('account creation hashes passwords and prevents duplicate identity', async () => {
  await request(app).post('/api/accounts').send(account('alpha')).expect(201)
  const stored = await db.collection('users').findOne({ loginKey: 'alpha' })
  assert.ok(stored.passwordHash.startsWith('$2'))
  assert.equal(stored.password, undefined)
  assert.notEqual(stored.passwordHash, account('alpha').password)
  await request(app)
    .post('/api/accounts')
    .send({ ...account('alpha'), email: 'other@example.invalid' })
    .expect(409)
  await request(app)
    .post('/api/accounts')
    .send({ ...account('other'), email: account('alpha').email })
    .expect(409)
  await request(app)
    .post('/api/accounts')
    .send({ ...account('invalid'), shippingAddress: {} })
    .expect(400)
  await request(app)
    .post('/api/accounts')
    .send({ ...account('longpass'), password: 'x'.repeat(73) })
    .expect(400)
  await request(app).post('/api/accounts').send({}).expect(400)
})

test('sessions isolate carts and preserve a guest cart through login', async () => {
  const visitor = request.agent(app)
  const stranger = request.agent(app)
  await visitor.post('/api/cart').send(item).expect(200)
  const cart = await visitor.get('/api/cart').expect(200)
  assert.equal(cart.body.cartItems[0].unitPrice, 80)
  assert.equal((await stranger.get('/api/cart')).body.cartItems.length, 0)
  await visitor.post('/api/login').send({ login: 'alpha', password: 'wrong123' }).expect(401)
  const signedIn = await visitor
    .post('/api/login')
    .send({ login: 'alpha', password: 'DemoOnly123!' })
    .expect(200)
  assert.equal(signedIn.body.user.passwordHash, undefined)
  assert.equal((await visitor.get('/api/cart')).body.cartItems.length, 1)
  const cookie = signedIn.headers['set-cookie'].join(';')
  assert.match(cookie, /HttpOnly/)
  assert.match(cookie, /SameSite=Lax/)
  await visitor.get('/api/account').expect(200)
  await visitor.post('/api/logout').expect(200)
  await visitor.get('/api/account').expect(401)
})

test('cart validates products, stock, quantities, options and removal', async () => {
  const visitor = request.agent(app)
  await visitor
    .post('/api/cart')
    .send({ ...item, productId: 999 })
    .expect(404)
  await visitor
    .post('/api/cart')
    .send({ ...item, color: 'Invalid' })
    .expect(400)
  await visitor
    .post('/api/cart')
    .send({ ...item, quantity: 1.5 })
    .expect(400)
  await visitor
    .post('/api/cart')
    .send({ ...item, quantity: 6 })
    .expect(400)
  const added = await visitor.post('/api/cart').send(item).expect(200)
  const id = encodeURIComponent(added.body.cartItems[0].cartItemId)
  await visitor.put(`/api/cart/${id}`).send({ quantity: 0 }).expect(400)
  const changed = await visitor
    .put(`/api/cart/${id}`)
    .send({ quantity: 3, unitPrice: 0 })
    .expect(200)
  assert.equal(changed.body.cartItems[0].quantity, 3)
  assert.equal(changed.body.cartItems[0].unitPrice, 80)
  await visitor.delete(`/api/cart/${id}`).expect(200)
  assert.equal((await visitor.get('/api/cart')).body.cartItems.length, 0)
})

test('orders reprice, avoid full card storage, clear cart, and enforce ownership', async () => {
  const visitor = request.agent(app)
  const stranger = request.agent(app)
  await request(app).post('/api/accounts').send(account('beta')).expect(201)
  await visitor.post('/api/login').send({ login: 'alpha', password: 'DemoOnly123!' }).expect(200)
  await stranger.post('/api/login').send({ login: 'beta', password: 'DemoOnly123!' }).expect(200)
  await visitor.post('/api/cart').send(item).expect(200)
  await db.collection('products').updateOne({ id: 1 }, { $set: { salePrice: 75 } })
  const checkout = {
    checkoutKey: 'demo-order-1',
    shippingAddress,
    billingAddress: shippingAddress,
    payment: { cardType: 'Visa', last4: '1234', cardNumber: '4111111111111234', cvv: '123' },
    total: 0.01,
  }
  await request(app).post('/api/orders').send(checkout).expect(401)
  const result = await visitor.post('/api/orders').send(checkout).expect(201)
  assert.equal(result.body.order.subtotal, 150)
  assert.equal(result.body.order.tax, 14.25)
  assert.equal(result.body.order.total, 164.25)
  assert.deepEqual(result.body.order.payment, { cardType: 'Visa', last4: '1234' })
  assert.equal((await visitor.get('/api/cart')).body.cartItems.length, 0)
  const repeated = await visitor.post('/api/orders').send(checkout).expect(200)
  assert.equal(repeated.body.order._id, result.body.order._id)
  assert.equal(await db.collection('orders').countDocuments(), 1)
  await stranger.get(`/api/orders/${result.body.order._id}`).expect(404)
  assert.equal((await stranger.get('/api/orders')).body.orders.length, 0)
  await visitor
    .post('/api/orders')
    .send({ ...checkout, checkoutKey: 'empty-cart' })
    .expect(400)
  const changed = await visitor
    .put('/api/account')
    .send({ ...account('alpha'), email: 'changed@example.invalid' })
    .expect(200)
  assert.equal(changed.body.user.id, result.body.order.userId)
  assert.equal((await visitor.get('/api/orders')).body.orders.length, 1)
  await visitor
    .put('/api/account')
    .send({ ...account('alpha'), email: account('beta').email })
    .expect(409)
})

test('cross-site mutations and malformed JSON are rejected', async () => {
  await request(app)
    .post('/api/cart')
    .set('Origin', 'https://untrusted.example')
    .send(item)
    .expect(403)
  await request(app)
    .post('/api/cart')
    .set('Content-Type', 'application/json')
    .send('{broken')
    .expect(400)
})

test('stock is shared across bundles and rejected changes leave the cart intact', async () => {
  await db.collection('products').updateOne({ id: 1 }, { $set: { colors: ['Black', 'White'] } })
  const visitor = request.agent(app)
  await visitor
    .post('/api/cart')
    .send({ ...item, quantity: 3 })
    .expect(200)
  await visitor
    .post('/api/cart')
    .send({ ...item, color: 'White', quantity: 3 })
    .expect(400)
  const cart = (await visitor.get('/api/cart')).body.cartItems
  assert.equal(cart.length, 1)
  assert.equal(cart[0].quantity, 3)
})

test('another app instance can restore the same Mongo-backed session', async () => {
  const visitor = request.agent(app)
  const added = await visitor.post('/api/cart').send(item).expect(200)
  const cookie = added.headers['set-cookie'][0].split(';')[0]
  const secondApp = createApp({
    client,
    db,
    sessionSecret: 'test-session-secret-at-least-thirty-two-characters',
  })
  const restored = await request(secondApp).get('/api/cart').set('Cookie', cookie).expect(200)
  assert.equal(restored.body.cartItems[0].quantity, 2)
})
