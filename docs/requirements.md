# Project 2 requirement checklist

| Requirement | Implementation | Status |
| --- | --- | --- |
| Reuse Project 1 React frontend | client/src, same existing CSS/components | Implemented |
| Top-level client/server separation | npm workspaces | Implemented |
| Product list/detail from Atlas | productController and product API calls | Implemented; 28 products seeded |
| Create account validation/unique login and email | validation helpers and unique indexes | API tested |
| Password hashing | bcryptjs create/compare | API tested |
| Login/logout and session user ID | accountController, express-session | API/browser tested |
| Profile editing with permanent ID | PUT /api/account | API/browser tested |
| Server-owned persistent cart | Mongo-backed sessions, cartController | API/browser tested |
| Server-checked prices, quantities/options/stock | buildCartItem and validateStock | API tested |
| Shipping/billing and safe demo payment | CheckoutView | Browser tested |
| Order creation, totals, cart clearing | orderController | API/browser tested |
| Order confirmation/history/details | OrderView, OrdersView | Browser tested |
| Private user order access | userId filter on every order read | API tested |
| Shared database client and shutdown cleanup | database.js and server.js | Implemented |
| One Cloud Run service for website/API | Dockerfile, deploy.ps1 | Deployment verification in progress |
| New group repository | local repository prepared | Visibility awaiting user decision |
| README/group members/build/deployment | README.md | Prepared |
| GitHub Pages documentation | docs/ | Publication pending repository |
| Issue board, individual assignees and due dates | docs/task-plan.csv | GitHub usernames and assignment decisions needed |
| Wiki and demonstration recordings | docs/demo-guide.md | Recordings and YouTube URLs still needed |
| Canvas submission/rubric/peer reviews | External coursework | Group must complete |

Only the supplied Project 2 PDF was available. The separate Canvas rubric has not been reviewed.
