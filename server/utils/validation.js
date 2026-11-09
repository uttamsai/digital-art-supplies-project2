export class HttpError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}

// Read a short text field without accepting objects or arrays.
export function text(value, label, required = true, max = 100) {
  if (typeof value !== 'string' || value.trim().length > max || (required && !value.trim())) {
    throw new HttpError(400, `Enter a valid ${label}.`)
  }
  return value.trim()
}

// Normalize and check an email address.
export function email(value) {
  const result = text(value, 'email', true, 254).toLowerCase()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(result)) throw new HttpError(400, 'Enter a valid email.')
  return result
}

// Check the password length before hashing.
export function password(value) {
  if (typeof value !== 'string' || value.length < 6 || Buffer.byteLength(value, 'utf8') > 72) {
    throw new HttpError(400, 'Password must have at least 6 characters and at most 72 UTF-8 bytes.')
  }
  return value
}

// Validate the required US shipping or billing fields.
export function address(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new HttpError(400, 'Enter a complete address.')
  const result = {
    street: text(value.street, 'street', true, 200),
    city: text(value.city, 'city'),
    state: text(value.state, 'state', true, 2).toUpperCase(),
    zip: text(value.zip, 'ZIP code', true, 10),
  }
  const states =
    'AL AK AZ AR CA CO CT DE FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI WY DC'.split(
      ' ',
    )
  if (!states.includes(result.state) || !/^\d{5}(-\d{4})?$/.test(result.zip))
    throw new HttpError(400, 'Enter a two-letter state and valid ZIP code.')
  return result
}

// Accept only positive whole-number quantities.
export function quantity(value) {
  if (!Number.isSafeInteger(value) || value < 1 || value > 999)
    throw new HttpError(400, 'Quantity must be a whole number from 1 to 999.')
  return value
}

// Only expose account fields that are safe for the browser.
export function publicAccount(user) {
  return {
    id: String(user._id),
    login: user.login,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    shippingAddress: user.shippingAddress,
  }
}

// Validate the fields used to create or edit an account.
export function profile(body) {
  const phone = text(body.phone ?? '', 'phone', false, 30)
  if (phone && !/^\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/.test(phone))
    throw new HttpError(400, 'Enter a valid US phone number.')
  const login = text(body.login, 'login')
  if (login.length < 3 || !/^[A-Za-z0-9_.-]+$/.test(login))
    throw new HttpError(
      400,
      'Login needs at least 3 letters, numbers, dots, dashes, or underscores.',
    )
  return {
    login,
    loginKey: login.toLowerCase(),
    email: email(body.email),
    firstName: text(body.firstName, 'first name'),
    lastName: text(body.lastName, 'last name'),
    phone,
    shippingAddress: address(body.shippingAddress),
  }
}
