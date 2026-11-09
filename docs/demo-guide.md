# Presentation recordings

Use fictional details. Keep `.env`, secret values, and password inputs out of the recording.

## Create account

1. Show `digital_art_supplies_project2.users` in Atlas and its current count.
2. Use Create Account on the deployed Cloud Run site.
3. Show the success message asking you to log in.
4. Refresh Atlas to show the new user and passwordHash field (do not expose personal details).
5. Log in; show the dashboard and editing a profile field.
6. Explain CreateAccountView.handleSubmit → account route → createAccount → MongoDB.

## Shopping and cart

1. Visit two different products, select bundles/colors/quantities, and add them.
2. Show the navigation cart count and Cart page between additions.
3. Increase/decrease quantity and remove an item.
4. Refresh the page to show the server session restoring the cart.
5. Explain App.changeCart → cart controller → request.session.cart → JSON response.

## Checkout and orders

1. Show the current Atlas orders count before ordering.
2. Sign in, add a product, and open checkout from the cart.
3. Show shipping and separate billing forms, demo card type/last four digits, and totals.
4. Submit; show confirmation, order ID/date, items, addresses, tax/shipping/total, and empty cart.
5. Refresh Atlas to show the new order document.
6. Open Account → View Orders → order details.
7. Explain createOrder's validation, database price lookup, insertion, and cart clearing.

Upload these recordings to YouTube and place the URLs in the corresponding Wiki pages. The application does not create these recordings for you.
