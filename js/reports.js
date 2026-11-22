// Reports page

// Must be logged in
const user = requireLogin();
// Inventory and sales
const stockList = items();
const salesLog = sales();

// Is this sale in the chosen time range?
function isWithinPeriod(isoDate, period) {
  const d = new Date(isoDate);
  if (isNaN(d)) return true;

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (period === "today") return d >= startOfToday;
  if (period === "week") {
    const weekAgo = new Date(startOfToday);
    weekAgo.setDate(weekAgo.getDate() - 6);
    return d >= weekAgo;
  }
  if (period === "month") {
    return d >= new Date(now.getFullYear(), now.getMonth(), 1);
  }
  return true;
}

// Make table rows
function rankRows(rows) {
  return rows.map(row => `
    <tr>
      <td>${esc(row.name)}</td>
      <td>${row.sold}</td>
    </tr>
  `).join("");
}

// Show the report for one time range
function renderReport(period) {
  const filtered = salesLog.filter(tx => isWithinPeriod(tx.date, period));
  const totalSales = filtered.reduce((sum, tx) => sum + (Number(tx.total) || 0), 0);

  // How many of each item were sold
  const soldMap = {};
  filtered.forEach(tx => {
    (tx.items || []).forEach(line => {
      soldMap[line.name] = (soldMap[line.name] || 0) + (Number(line.qty) || 0);
    });
  });

  document.getElementById("totalSalesAmount").textContent = peso(totalSales);

  if (stockList.length === 0) {
    const none = `<tr><td colspan="2" class="empty">No items yet.</td></tr>`;
    document.getElementById("bestSellersBody").innerHTML = none;
    document.getElementById("slowMoversBody").innerHTML = none;
    return;
  }

  // Best = top 3, slow = bottom 3
  const ranked = stockList.map(item => ({ name: item.name, sold: soldMap[item.name] || 0 }));
  const best = [...ranked].sort((a, b) => b.sold - a.sold).slice(0, 3);
  const slow = [...ranked].sort((a, b) => a.sold - b.sold).slice(0, 3);

  document.getElementById("bestSellersBody").innerHTML = rankRows(best);
  document.getElementById("slowMoversBody").innerHTML = rankRows(slow);
}

// Time range buttons
document.querySelectorAll(".filter-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".filter-btn").forEach(b => {
      b.classList.remove("btn");
      b.classList.add("btn2");
    });
    btn.classList.remove("btn2");
    btn.classList.add("btn");
    renderReport(btn.dataset.period);
  });
});

// Start the page
if (user) {
  renderNav("reports.html");
  renderReport("today");
}
