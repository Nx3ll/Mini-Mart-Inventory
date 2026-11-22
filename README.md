# Mini-mart Inventory (HTML/CSS/JS, no backend)
Open `index.html` with VS Code Live Server. Data is saved in the browser (localStorage).
Demo logins (password 1234): ana = cashier, ben = stock clerk, owner = manager.

## Pages
login, dashboard, inventory, sales, stock in, reorder, suppliers, reports, activity log

## Files
- css/style.css: shared look and phone/print rules
- js/data.js: shared data (items, sales, suppliers, users, helpers)
- js/app.js: login, role access (PAGES list), menu, addLog()
- js/<page>.js: one script per page
- inventory, reorder and suppliers keep their own page styles inside their HTML

## Store name
Change STORE (name and tagline) in js/data.js. It updates the menu, login page and page titles.

## Making a new page
1. Copy sales.html: keep the menu, the three script tags and the shared classes.
2. Add the page to PAGES in js/app.js (name, file, which roles can open it).
3. Start js/<page>.js with: const user = requireLogin(); ... if (user) { renderNav('page.html'); }
4. Use items(), saveItems(list), sales(), addSale(), suppliers(), saveSuppliers(list), addLog(). Do not use names like items, sales or suppliers for your own variables.
5. Wide tables: put them in <div class="wrap"> and add class "wide" to the table so they scroll sideways on phones.

## Storage keys (all start with mm_)
items, sales, suppliers, log, stockin, session
