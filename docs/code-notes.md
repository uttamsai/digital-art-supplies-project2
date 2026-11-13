# Code and function reference

## Browser → server → database

The React pages call `api()` in `client/src/utils/api.js`. It uses `fetch('/api/...')`, sends JSON, includes the session cookie, and throws readable server errors. Express routes select a controller. Controllers validate the input, use the shared MongoDB connection, and return JSON. React saves that response in state and renders it.

## Client files

- `App.jsx`: `load()` restores products, cart, and account after refresh. `changeCart()` sends one cart change at a time. `addToCart()`, `adjustQuantity()`, and `removeFromCart()` call the cart API and update React state. Routes choose the view.
- `CreateAccountView.jsx`: `update()` changes form state; `validate()` checks input; `handleSubmit()` POSTs `/api/accounts`; `field()` renders a labeled input. After success it asks the visitor to log in.
- `AccountView.jsx`: `handleLogin()` POSTs `/api/login`; `saveAccount()` PUTs `/api/account`; `handleLogout()` POSTs `/api/logout`. The dashboard displays the saved profile and links to orders.
- `HomeView.jsx` and `ShopView.jsx`: show products received from the API using the existing ProductList/ProductCard components.
- `ProductDetailView.jsx`: its effect GETs `/api/products/:id`; `clampQuantity()` limits the input; `handleAddToCart()` waits for the server before confirming success.
- `CartView.jsx`, `Cart.jsx`, `CartItem.jsx`: display server-synchronized cart data and send button actions to App.
- `CheckoutView.jsx`: loads `/api/orders/quote`; `submitOrder()` POSTs validated addresses, a checkout reference, and card type/last4 to `/api/orders`. The browser does not decide order prices.
- `OrdersView.jsx`: GETs the signed-in user's `/api/orders`.
- `OrderView.jsx`: GETs `/api/orders/:id` and displays the saved order snapshot.
- `AddressFields.jsx`: reuses address inputs for editing and checkout.
- `CustomersView.jsx`: `loadCustomers()` GETs `/api/customers`; `handleRefresh()` repeats it. Only public login names are shown.

## Server files

- `server.js`: `startServer()` connects to MongoDB before listening; `stopServer()` closes requests and the connection on shutdown.
- `database.js`: `connectDatabase()` reads the private environment setting and reuses one MongoClient. `setupIndexes()` prevents duplicate email/login and repeated checkout references.
- `app.js`: `createApp()` adds JSON parsing, origin checking, Mongo-backed sessions, routes, static files, SPA fallback, and JSON errors, in that order.
- `accountController.js`: `createAccount()` validates and hashes the password; `login()` compares it and regenerates the session; `getAccount()` reads the permanent ID; `updateAccount()` updates allowed fields; `logout()` destroys the session.
- `productController.js`: `getProducts()` reads the catalog; `getProduct()` reads one product.
- `cartController.js`: `buildCartItem()` validates options, quantity, stock, and database price; `validateStock()` totals bundles of the same product; `getCart()`, `addItem()`, `updateItem()`, and `removeItem()` manage `request.session.cart`.
- `orderController.js`: `quoteOrder()` previews current totals; `createOrder()` rechecks the cart and saves an order, then clears the cart; `getOrders()` and `getOrder()` restrict results by the session's user ID.
- `middleware/auth.js`: `requireLogin()` protects account/order routes; `checkOrigin()` rejects browser writes from unrelated websites.
- `utils/validation.js`: validates text, email, passwords, addresses, quantity, and profile; `publicAccount()` leaves password hashes out of responses.
- `utils/session.js`: waits for session saves/regeneration before responding.
- `routes/`: maps HTTP verbs and paths to controller functions.
- `seed/seedProducts.js`: one-time catalog import, with no automatic account creation.
