import { test, expect } from '@playwright/test'

// Exercise the real pages against the temporary MongoDB test server.
test('signup, cart persistence, login, checkout, profile editing and logout', async ({ page }) => {
  const errors = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('/#/account/create')
  const values = {
    firstName: 'Demo',
    lastName: 'Student',
    login: 'browserdemo',
    password: 'DemoOnly123!',
    confirmPassword: 'DemoOnly123!',
    email: 'browser@example.invalid',
    street: '123 Demo Street',
    city: 'Hayward',
    state: 'CA',
    zip: '94542',
    phone: '510-555-1212',
  }
  for (const [id, value] of Object.entries(values)) await page.locator(`#${id}`).fill(value)
  await page.getByRole('button', { name: 'Create Account', exact: true }).click()
  await expect(page.getByRole('status')).toContainText('Account created')
  await page.goto('/#/product/1')
  await page.getByRole('group', { name: 'Bundle' }).getByRole('button').first().click()
  await page.getByRole('group', { name: 'Color' }).getByRole('button').first().click()
  await page.getByRole('button', { name: 'Add to Cart', exact: true }).click()
  await expect(page.getByRole('status')).toContainText('Added')
  await page.getByRole('link', { name: 'View cart', exact: true }).click()
  await page.reload()
  await expect(page.getByRole('link', { name: 'Proceed to Checkout' })).toBeVisible()
  await page.getByRole('link', { name: 'Proceed to Checkout' }).click()
  await page.getByRole('link', { name: 'Log In', exact: true }).click()
  await page.locator('#login').fill('browserdemo')
  await page.locator('#password').fill('DemoOnly123!')
  await page.getByRole('button', { name: 'Log In', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Welcome, Demo' })).toBeVisible()
  await page.goto('/#/cart')
  await page.getByRole('link', { name: 'Proceed to Checkout' }).click()
  await page.locator('#same-address').uncheck()
  await page.locator('#billing-street').fill('456 Billing Street')
  await page.locator('#last4').fill('1234')
  await expect(page.getByRole('button', { name: 'Place Demo Order' })).toBeVisible()
  await page.screenshot({ path: 'work/checkout-desktop.png', fullPage: true })
  await page.getByRole('button', { name: 'Place Demo Order' }).click()
  await expect(page.getByRole('heading', { name: 'Order Confirmation' })).toBeVisible()
  await expect(page.getByText('456 Billing Street')).toBeVisible()
  await expect(page.getByText('Visa ending in 1234')).toBeVisible()
  await page.screenshot({ path: 'work/order-desktop.png', fullPage: true })
  const orderURL = page.url()
  await page.goto('/#/cart')
  await expect(page.getByText('Your cart is empty.')).toBeVisible()
  await page.goto('/#/account')
  await page.getByRole('button', { name: 'Edit Account' }).click()
  await page.locator('#edit-email').fill('updated@example.invalid')
  await page.getByRole('button', { name: 'Save Changes' }).click()
  await expect(page.getByRole('status')).toContainText('Account updated')
  await page.getByRole('link', { name: 'View Orders' }).click()
  await expect(page.getByRole('link', { name: /^Order / })).toHaveCount(1)
  await page.goto('/#/account')
  await page.setViewportSize({ width: 390, height: 844 })
  await page.screenshot({ path: 'work/account-mobile.png', fullPage: true })
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.getByRole('button', { name: 'Log Out' }).click()
  await expect(page.getByRole('button', { name: 'Log In', exact: true })).toBeVisible()
  await page.goto(orderURL)
  await expect(page.getByRole('link', { name: 'Log in to view this order' })).toBeVisible()
  expect(errors).toEqual([])
})
