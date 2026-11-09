# Digital Art Supplies

CS351 Project 2 by Uttam Sai Nalla, Giang Nguyen, and Filip Rerek.

This project extends the original React Digital Art Supplies storefront with Express, MongoDB Atlas, account sessions, a persistent cart, and simulated checkout. One Cloud Run service hosts the client and API.

- [Code and function notes](code-notes.html)
- [Video demonstration guide](demo-guide.html)
- [Requirements checklist](requirements.html)

## Published application

[Open the live store](https://digital-art-supplies-project2-1183981126.us-west1.run.app) · [View the public repository](https://github.com/uttamsai/digital-art-supplies-project2)

The temporary Atlas demo network rule expires November 16, 2026 at 7:37 AM Pacific. Database features require renewed or restricted network access after that time.

## How a request works

1. A React page calls `api()` with a relative `/api` URL.
2. Express reads JSON and the browser's session cookie.
3. A route calls an account, product, cart, or order controller.
4. The controller validates input and uses the shared MongoDB client.
5. The controller returns JSON; React updates state and redraws the page.

The frontend never connects directly to Atlas and never receives the Atlas connection string.

## Collections

| Collection | What it stores |
| --- | --- |
| products | Catalog, options, stock, and prices |
| users | Profile, unique login/email, and bcrypt password hash |
| orders | Permanent customer ID, order date, item/address snapshots, totals, safe payment details |
| sessions | Express session identity and authoritative cart |

## API routes

| Method | Path | Function |
| --- | --- | --- |
| GET | /api/products | List products |
| GET | /api/products/:id | Read one product |
| POST | /api/accounts | Create an account |
| POST | /api/login | Sign in and regenerate session |
| POST | /api/logout | Destroy session |
| GET / PUT | /api/account | Read / edit own profile |
| GET / POST | /api/cart | Read / add to session cart |
| PUT / DELETE | /api/cart/:itemId | Change quantity / remove item |
| GET | /api/orders/quote | Preview current server totals |
| POST / GET | /api/orders | Place order / read own history |
| GET | /api/orders/:id | Read own saved order |
| GET | /api/customers | List public login names for the earlier lab feature |

## Run and test

Use Node.js 22.18+. Run `npm ci`, configure the private root `.env` from `.env.example`, and run `npm run seed`, `npm run build`, and `npm start`. Open localhost:8080. See the repository README for the two-terminal development setup and Cloud Run deployment.

`npm test` runs database/API tests. `npm run test:browser` runs the full browser flow against a temporary database. Test customers never enter the Atlas class database.

## Design decisions

Existing Bootstrap styles, navigation, cards, images, and cart components are reused. New account and checkout pages use the same form/card conventions.

The server owns prices, stock checks, totals, and the cart. React state is only a display copy. Orders are linked by MongoDB `_id`, so email changes do not break history. A unique checkout reference prevents retrying the same submission from inserting the same order twice.

This is a classroom demo: no real payment is processed, only card type and last four fictional digits are collected, shipping is $0, and the configured demo tax defaults to 9.5%. Inventory is validated but not decremented after orders.
