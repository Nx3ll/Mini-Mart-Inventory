# Mini-mart Inventory (HTML/CSS/JS, no backend)
Open `index.html` with VS Code Live Server. Data is saved in the browser (localStorage).
Demo logins (password 1234): ana = cashier, ben = stock clerk, owner = manager.

## Files
- css/style.css: one shared stylesheet for every page
- js/data.js: shared data (items, sales, suppliers, users, helpers)
- js/app.js: login, role access (PAGES list), nav bar, addLog()
- js/<page>.js: one script per page
- Pages done: login, dashboard, sales, stock-in, reports, e-load/GCash, activity log
- Pages still missing: inventory, reorder, suppliers (links already in the nav)

## Making a new page
1. Copy sales.html: keep the nav, the three script tags and the shared classes.
2. Start js/<page>.js with: const user = requireLogin(); ... if (user) { renderNav('page.html'); }
3. Use items(), saveItems(), sales(), addSale(), suppliers(), addLog(). Do not use names like items or sales for your own variables.

## Storage keys (all start with mm_)
items, sales, suppliers, log, stockin, eload, session
