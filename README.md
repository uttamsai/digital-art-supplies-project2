# Digital Art Supplies — CS351 Project 2

A React storefront backed by Node.js, Express, and MongoDB Atlas. Customers can create an account, log in, edit their profile, keep a shopping cart through refreshes, and submit simulated orders. The original purple/cream Bootstrap styling and product components are retained.

## Group members

- Uttam Sai Nalla — GitHub: uttamsai
- Giang Nguyen — GitHub username pending
- Filip Rerek — GitHub username pending

## Project structure

- `client/`: React pages, components, styles, and images.
- `server/server.js`: startup and graceful shutdown.
- `server/app.js`: middleware, sessions, API routes, and built React files.
- `server/database.js`: shared MongoDB connection and unique indexes.
- `server/controllers/`: account, product, cart, and order functions.
- `server/routes/`: HTTP routes connected to controllers.
- `server/seed/catalog.json`: one-time product import source; never loaded by the storefront.
- `server/tests/`: API and browser tests using a temporary local MongoDB instance.
- `docs/`: architecture, code notes, and presentation guidance.

The React application has no local products.json. Both the product list and individual product page fetch MongoDB-backed APIs.

## Run locally

Use Node.js 22.18 or newer. From the project root:

```powershell
npm ci
```

Copy `.env.example` to `.env` only if `.env` does not already exist. Fill in `MONGODB_URI` and a random `SESSION_SECRET` of at least 32 characters. Never commit `.env`. Set `MONGODB_DB=digital_art_supplies_project2` to keep Lab10 data separate. Allow your computer's IP in Atlas Network Access.

```powershell
npm run seed
npm run build
npm start
```

Open http://localhost:8080. The seed imports missing products without overwriting existing documents. It creates no customer accounts or orders.

For development, run `npm run dev:server` in one terminal and `npm run dev` in another. Open http://localhost:5173. Vite forwards relative `/api` requests to port 8080.

## Database and behavior

Atlas database: `digital_art_supplies_project2`.

- `products`: catalog and authoritative prices.
- `users`: profiles, unique login/email, bcrypt password hashes.
- `orders`: customer/address/item snapshots linked to the user's permanent `_id`.
- `sessions`: Express session data, including `userId` and the cart; expires after one day.

Login preserves a visitor's cart. Logout destroys the session and its cart. Order history belongs to the signed-in account, even after its email changes. Customers lists account login names only, keeping the earlier lab page available.

Checkout is simulated. It collects only card type and four fictional digits; it never collects a full card number or CVV. Demo tax defaults to 9.5% (`TAX_RATE=0.095`), with $0 demo shipping. These are classroom assumptions, not a real tax/payment service. Orders validate availability but do not decrement inventory. Totals and prices are calculated again on the server.

## Tests

```powershell
npm test
npm run lint
npx playwright install chromium
npm run test:browser
```

Tests use an isolated temporary MongoDB process, not Atlas. The API suite checks duplicate identities, hashing, session isolation, cart validation, price tampering, order ownership, and malformed requests. The browser test creates a fictional account, shops, refreshes, logs in, checks out, edits email, views orders, and logs out. Screenshots go to ignored `work/`.

## Published links and verified status

- [Live Cloud Run website](https://digital-art-supplies-project2-1183981126.us-west1.run.app)
- [Public group repository](https://github.com/uttamsai/digital-art-supplies-project2)
- [GitHub Pages documentation](https://uttamsai.github.io/digital-art-supplies-project2/)

Cloud Run is deployed and connected to Atlas. Live checks passed for the website, all 28 products, individual product reads, secure session cookies, cart persistence/removal, and blocked anonymous order access. Test cart data was cleared. No customer accounts or orders were created during deployment verification.

The approved temporary Atlas network rule expires **November 16, 2026 at 7:37 AM Pacific** (15:37 UTC). Cloud Run database access requires renewing that rule or configuring restricted static outbound networking before it expires.

## Cloud Run deployment

The Dockerfile builds React with Vite and serves its output with Express. One service handles the website and `/api`; MongoDB remains in Atlas. Use `deploy.ps1` from the repository root. The script builds locally before submitting the source to Cloud Run.

Google project: `my-resume-506923` (Uttam Websites), region: `us-west1`.
New service: `digital-art-supplies-project2`.
Runtime identity: `digital-art-project2@my-resume-506923.iam.gserviceaccount.com`.
Secret mappings: `MONGODB_URI` from `digital-art-supplies-mongodb-uri`; `SESSION_SECRET` from `digital-art-supplies-project2-session`. The service identity needs Secret Accessor on these two secrets. No secret values belong in source control or the client bundle.

Atlas must allow connections from Cloud Run. Do not assume an expired temporary IP rule still works. Check `/health` and `/api/products` after deployment. Cloud Run uses secure, HttpOnly session cookies in production. Instances share session storage through MongoDB.
