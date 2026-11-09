import bcrypt from 'bcryptjs'
import { ObjectId } from 'mongodb'
import { HttpError, profile, password, publicAccount, text } from '../utils/validation.js'
import { saveSession, regenerateSession } from '../utils/session.js'

// Validate the form and save a hashed password.
export async function createAccount(request, response) {
  const info = profile(request.body)
  const passwordHash = await bcrypt.hash(password(request.body.password), 12)
  const result = await request.app.locals.db
    .collection('users')
    .insertOne({ ...info, passwordHash, createdAt: new Date() })
  response
    .status(201)
    .json({ id: String(result.insertedId), message: 'Account created. Please log in.' })
}

// Check the password and start a fresh signed-in session.
export async function login(request, response) {
  const identity = text(
    request.body.login ?? request.body.email,
    'login or email',
    true,
    254,
  ).toLowerCase()
  const suppliedPassword = password(request.body.password)
  const users = request.app.locals.db.collection('users')
  const user = await users.findOne({ $or: [{ loginKey: identity }, { email: identity }] })
  if (!user || !(await bcrypt.compare(suppliedPassword, user.passwordHash)))
    throw new HttpError(401, 'Incorrect login or password.')
  const cart = request.session.cart || []
  await regenerateSession(request)
  request.session.userId = String(user._id)
  request.session.cart = cart
  await saveSession(request)
  response.json({ user: publicAccount(user) })
}

// Destroy the session when the customer logs out.
export async function logout(request, response) {
  await new Promise((resolve, reject) =>
    request.session.destroy((error) => (error ? reject(error) : resolve())),
  )
  response.clearCookie('digitalart.sid', { path: '/' })
  response.json({ message: 'Logged out.' })
}

// Read the profile using the permanent account ID.
export async function getAccount(request, response) {
  const user = await request.app.locals.db
    .collection('users')
    .findOne({ _id: new ObjectId(request.session.userId) })
  if (!user) throw new HttpError(401, 'Please log in again.')
  response.json({ user: publicAccount(user) })
}

// Update only allowed profile fields and keep the permanent user ID.
export async function updateAccount(request, response) {
  const info = profile(request.body)
  if (request.body.password)
    info.passwordHash = await bcrypt.hash(password(request.body.password), 12)
  const user = await request.app.locals.db
    .collection('users')
    .findOneAndUpdate(
      { _id: new ObjectId(request.session.userId) },
      { $set: info },
      { returnDocument: 'after' },
    )
  if (!user) throw new HttpError(401, 'Please log in again.')
  response.json({ user: publicAccount(user), message: 'Account updated.' })
}
