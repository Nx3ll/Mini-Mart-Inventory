// Dashboard page

// Start if logged in
if (requireLogin()) {
  renderNav('dashboard.html');
  showDashboard();
}

// English greeting matching time of day
function englishGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

// Fill in the dashboard
function showDashboard() {
  // Greeting and today's date
  document.getElementById('greeting').textContent =
    greeting() + ' / ' + englishGreeting() + ', ' + currentUser().name + '! ' +
    new Date().toLocaleDateString('en-PH', { weekday: 'long', month: 'long', day: 'numeric' });

  const allItems = items();

  // Sales today
  const salesToday = sales()
    .filter(function (sale) { return localDate(sale.date) === todayStr(); })
    .reduce(function (sum, sale) { return sum + sale.total; }, 0);

  // Items that are low or out
  const lowItems = allItems
    .filter(function (item) { return item.stock <= item.reorder; })
    .sort(function (a, b) { return a.stock - b.stock; });

  // Items expiring within 30 days
  const expiringItems = allItems
    .filter(function (item) {
      const days = daysLeft(item.expiry);
      return days !== null && days <= 30;
    })
    .sort(function (a, b) { return daysLeft(a.expiry) - daysLeft(b.expiry); });

  // Fill in the number cards
  document.getElementById('sales-today').textContent = peso(salesToday);
  document.getElementById('low-count').textContent = countText(lowItems.length);
  document.getElementById('expiring-count').textContent = countText(expiringItems.length);

  // Quick buttons (only for roles that can use them)
  const buttons = [
    { href: 'sales.html',    label: 'Sell items', style: 'btn'  },
    { href: 'stock-in.html', label: 'Stock in',   style: 'btn2' }
  ];
  document.getElementById('quick-buttons').innerHTML = buttons
    .filter(function (b) { return canAccess(b.href); })
    .map(function (b) { return '<a class="' + b.style + '" href="' + b.href + '">' + b.label + '</a>'; })
    .join('');

  // Low stock table
  const lowRows = lowItems.map(function (item) {
    return '<tr>' +
      '<td>' + esc(item.name) + '</td>' +
      '<td><span class="b ' + stockStatus(item) + '">' + item.stock + '</span></td>' +
      '<td>' + item.reorder + '</td>' +
    '</tr>';
  });
  document.getElementById('low-rows').innerHTML =
    lowRows.length ? lowRows.join('') : emptyRow('Nothing is running low.');

  // Expiring soon table
  const expiringRows = expiringItems.map(function (item) {
    return '<tr>' +
      '<td>' + esc(item.name) + '</td>' +
      '<td>' + item.expiry + '</td>' +
      '<td>' + item.stock + '</td>' +
    '</tr>';
  });
  document.getElementById('expiring-rows').innerHTML =
    expiringRows.length ? expiringRows.join('') : emptyRow('Nothing expires in the next 30 days.');
}

// Show "1 item" or "6 items"
function countText(count) {
  return count + (count === 1 ? ' item' : ' items');
}

// Row shown when a table is empty
function emptyRow(message) {
  return '<tr><td class="empty" colspan="3">' + message + '</td></tr>';
}