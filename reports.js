const activeUser = localStorage.getItem("minimart_current_user") || "Ana · Cashier";
document.getElementById("userDisplay").textContent = activeUser;

const items = JSON.parse(localStorage.getItem("minimart_items") || "[]");
const salesLog = JSON.parse(localStorage.getItem("minimart_sales") || "[]");

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

function renderReport(period) {
  const filtered = salesLog.filter(tx => isWithinPeriod(tx.date, period));
  const totalSales = filtered.reduce((sum, tx) => sum + (Number(tx.total) || 0), 0);

  const soldMap = {};
  filtered.forEach(tx => {
    (tx.items || []).forEach(line => {
      soldMap[line.name] = (soldMap[line.name] || 0) + (Number(line.qty) || 0);
    });
  });

  document.getElementById("totalSalesAmount").textContent = `₱${totalSales.toLocaleString()}`;

  if (items.length === 0) {
    document.getElementById("bestSellersBody").innerHTML = `<tr><td colspan="2" class="empty-msg">No items yet.</td></tr>`;
    document.getElementById("slowMoversBody").innerHTML = `<tr><td colspan="2" class="empty-msg">No items yet.</td></tr>`;
    return;
  }

  const ranked = items.map(item => ({
    name: item.name,
    sold: soldMap[item.name] || 0
  }));

  const best = [...ranked].sort((a, b) => b.sold - a.sold).slice(0, 3);
  const slow = [...ranked].sort((a, b) => a.sold - b.sold).slice(0, 3);

  document.getElementById("bestSellersBody").innerHTML = best.map(row => `
    <tr>
      <td>${row.name}</td>
      <td>${row.sold}</td>
    </tr>
  `).join("");

  document.getElementById("slowMoversBody").innerHTML = slow.map(row => `
    <tr>
      <td>${row.name}</td>
      <td>${row.sold}</td>
    </tr>
  `).join("");
}

document.querySelectorAll(".filter-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("btn-primary"));
    btn.classList.add("btn-primary");
    renderReport(btn.dataset.period);
  });
});

renderReport("today");