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

## Cloud Run deployment

The Dockerfile builds React with Vite and serves its output with Express. One service handles the website and `/api`; MongoDB remains in Atlas. Use `deploy.ps1` from the repository root. The script builds locally before submitting the source to Cloud Run.

Google project: `my-resume-506923` (Uttam Websites), region: `us-west1`.
New service: `digital-art-supplies-project2`.
Runtime identity: `digital-art-project2@my-resume-506923.iam.gserviceaccount.com`.
Secret mappings: `MONGODB_URI` from `digital-art-supplies-mongodb-uri`; `SESSION_SECRET` from `digital-art-supplies-project2-session`. The service identity needs Secret Accessor on these two secrets. No secret values belong in source control or the client bundle.

Atlas must allow connections from Cloud Run. Do not assume an expired temporary IP rule still works. Check `/health` and `/api/products` after deployment. Cloud Run uses secure, HttpOnly session cookies in production. Instances share session storage through MongoDB.

## Original work and additions

This project is a separate copy of the existing Digital Art Supplies Lab10 app. The original Lab10 directory and deployment are retained. Existing product cards, product lists, navigation, images, cart presentation, and styling were reused. Account forms and cart handlers now call the APIs; account management, checkout, and order pages were added with approval.

The instructor's `grewe/FormDataSaveMongoDB` sample taught the form → Express → MongoDB flow. This backend extends that approach; it is not an unchanged copy of the instructor's EJS application. The Project 2 frontend remains React.

## Submission checklist

- Confirm the Cloud Run website and Atlas data in your own browser.
- Supply teammates' GitHub usernames and accept repository invitations.
- Assign issue-board tasks to individual members and maintain their due dates/status.
- Record signup (Atlas before/after), shopping/cart, and checkout/orders demos.
- Add the YouTube links and screenshots to the repository Wiki.
- Submit the GitHub and Cloud Run URLs by November 13 at the start of class.
- Complete peer reviews by November 20; consult the Canvas rubric separately.
