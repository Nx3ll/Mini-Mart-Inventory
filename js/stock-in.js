// Stock in page: Place order -> Waiting (In transport) -> Confirm delivery

// Must be logged in
const user = requireLogin();

// Inventory and suppliers
let stockList = items();
let supplierList = suppliers().map(function (s) { return s.name; });

// Persistent draft & active orders in localStorage (via DB)
let orderDraft = DB.get("stockin_draft", []);
let activeOrders = DB.get("stockin_orders", []);
let activeTab = "order";

// Page elements
const itemSelect = document.getElementById("itemSelect");
const qtyInput = document.getElementById("qtyInput");
const supplierSelect = document.getElementById("supplierSelect");
const deliveryTableBody = document.getElementById("deliveryTableBody");
const waitingTableBody = document.getElementById("waitingTableBody");
const confirmTableBody = document.getElementById("confirmTableBody");
const waitingCount = document.getElementById("waitingCount");
const confirmCount = document.getElementById("confirmCount");
const statusMsg = document.getElementById("statusMsg");

function saveDraft() {
  DB.set("stockin_draft", orderDraft);
}

function saveOrders() {
  DB.set("stockin_orders", activeOrders);
}

// Show a short message
function notify(msg) {
  statusMsg.textContent = msg;
  clearTimeout(notify._t);
  notify._t = setTimeout(() => { statusMsg.textContent = ""; }, 3500);
}

// Expiry is assumed to be 6 months from today
function sixMonthsOut() {
  const d = new Date();
  d.setMonth(d.getMonth() + 6);
  return localDate(d);
}

// Date as "May 2027"
function monthYear(isoDate) {
  return new Date(isoDate + "T00:00:00").toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

// Short timestamp like "Nov 23, 12:30 AM"
function shortTime(isoText) {
  return new Date(isoText).toLocaleString("en-PH", {
    month: "short", day: "numeric", hour: "numeric", minute: "2-digit"
  });
}

// Switch between Place order / Waiting / Confirm delivery tabs
function setTab(tabName) {
  activeTab = tabName;
  document.querySelectorAll(".tab-btn").forEach(btn => {
    const isSelected = btn.dataset.tab === tabName;
    btn.className = isSelected ? "btn tab-btn" : "btn2 tab-btn";
  });
  document.querySelectorAll(".tab-panel").forEach(panel => {
    panel.style.display = panel.id === "tab-" + tabName ? "block" : "none";
  });
  renderAll();
}

document.querySelectorAll(".tab-btn").forEach(btn => {
  btn.addEventListener("click", () => setTab(btn.dataset.tab));
});

// Update counts on tab buttons
function updateBadges() {
  const count = activeOrders.length;
  waitingCount.textContent = count > 0 ? `(${count})` : "";
  confirmCount.textContent = count > 0 ? `(${count})` : "";
}

// Fill the item dropdown
function renderItemOptions() {
  itemSelect.innerHTML = "";
  stockList.forEach(item => itemSelect.add(new Option(item.name, item.id)));
  syncSupplierForSelectedItem();
}

// Fill the supplier dropdown
function renderSupplierOptions() {
  supplierSelect.innerHTML = "";
  supplierList.forEach(s => supplierSelect.add(new Option(s, s)));
}

// Pick the item's usual supplier
function syncSupplierForSelectedItem() {
  const item = stockList.find(i => String(i.id) === String(itemSelect.value));
  if (item && item.supplier && supplierList.includes(item.supplier)) {
    supplierSelect.value = item.supplier;
  }
}

itemSelect.addEventListener("change", syncSupplierForSelectedItem);

// Render Tab 1: Current order draft
function renderDraftTable() {
  if (orderDraft.length === 0) {
    deliveryTableBody.innerHTML = `<tr><td colspan="6" class="empty">No items in your current order draft.</td></tr>`;
    return;
  }

  deliveryTableBody.innerHTML = orderDraft.map((row, idx) => `
    <tr>
      <td>${esc(row.itemName)}</td>
      <td>${row.qty}</td>
      <td>${esc(row.unit)}</td>
      <td>${esc(row.supplier)}</td>
      <td>${monthYear(row.expiry)}</td>
      <td class="right"><button type="button" class="btn2 btn-sm" onclick="removeDraftItem(${idx})">Remove</button></td>
    </tr>
  `).join("");
}

window.removeDraftItem = function (idx) {
  orderDraft.splice(idx, 1);
  saveDraft();
  renderDraftTable();
};

// Format items summary for an order row
function formatOrderItems(entries) {
  return entries.map(e => `${e.qty} ${esc(e.unit)} ${esc(e.itemName)}`).join(", ");
}

// Render Tab 2: Waiting / In transport
function renderWaitingTable() {
  if (activeOrders.length === 0) {
    waitingTableBody.innerHTML = `<tr><td colspan="6" class="empty">No orders currently in transport.</td></tr>`;
    return;
  }

  waitingTableBody.innerHTML = activeOrders.map(order => `
    <tr>
      <td><b>#${esc(order.orderCode)}</b></td>
      <td>${shortTime(order.placedAt)}</td>
      <td>${esc(order.suppliersLabel)}</td>
      <td>${formatOrderItems(order.items)}</td>
      <td><span class="b low">IN TRANSPORT</span></td>
      <td class="right">
        <button type="button" class="btn2 btn-sm" onclick="goToConfirm('${esc(order.id)}')">Receive</button>
      </td>
    </tr>
  `).join("");
}

window.goToConfirm = function () {
  setTab("confirm");
};

// Render Tab 3: Confirm delivery
function renderConfirmTable() {
  if (activeOrders.length === 0) {
    confirmTableBody.innerHTML = `<tr><td colspan="5" class="empty">No pending deliveries to confirm.</td></tr>`;
    return;
  }

  confirmTableBody.innerHTML = activeOrders.map(order => `
    <tr>
      <td><b>#${esc(order.orderCode)}</b></td>
      <td>${shortTime(order.placedAt)}</td>
      <td>${esc(order.suppliersLabel)}</td>
      <td>${formatOrderItems(order.items)}</td>
      <td>
        <button type="button" class="btn btn-sm" onclick="confirmOrder('${esc(order.id)}')">Confirm delivered</button>
        <button type="button" class="btn2 btn-sm" onclick="cancelOrder('${esc(order.id)}')">Cancel</button>
      </td>
    </tr>
  `).join("");
}

// Add to order draft button
document.getElementById("addDeliveryBtn").addEventListener("click", () => {
  const item = stockList.find(i => String(i.id) === String(itemSelect.value));
  const qty = parseInt(qtyInput.value, 10);
  const supplier = supplierSelect.value;

  if (!item) return notify("Select a valid item.");
  if (isNaN(qty) || qty < 1) return notify("Enter a valid quantity.");
  if (!supplier) return notify("Select a valid supplier.");

  // Merge if same item and supplier already in draft
  const existing = orderDraft.find(r => r.itemId === item.id && r.supplier === supplier);
  if (existing) {
    existing.qty += qty;
  } else {
    orderDraft.push({
      itemId: item.id,
      itemName: item.name,
      qty,
      unit: item.unit || "Piece",
      supplier,
      expiry: sixMonthsOut()
    });
  }

  saveDraft();
  qtyInput.value = 1;
  renderDraftTable();
  notify(`Added ${qty} ${item.unit || "Piece"} ${item.name} to order.`);
});

// Clear draft button
document.getElementById("clearDraftBtn").addEventListener("click", () => {
  if (orderDraft.length === 0) return;
  orderDraft = [];
  saveDraft();
  renderDraftTable();
  notify("Order draft cleared.");
});

// Place order -> moves to Waiting / In transport
document.getElementById("placeOrderBtn").addEventListener("click", () => {
  if (orderDraft.length === 0) return notify("Add items to your order first.");

  const uniqueSuppliers = [...new Set(orderDraft.map(i => i.supplier))];
  const orderCode = String(Date.now()).slice(-5);
  const newOrder = {
    id: "ord_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
    orderCode,
    placedAt: new Date().toISOString(),
    placedBy: user.username,
    suppliersLabel: uniqueSuppliers.join(", "),
    items: orderDraft.map(entry => ({ ...entry }))
  };

  activeOrders.unshift(newOrder);
  saveOrders();

  addLog(`Placed stock order #${orderCode} (${formatOrderItems(newOrder.items)})`);

  orderDraft = [];
  saveDraft();
  setTab("waiting");
  notify(`Order #${orderCode} placed and is now in transport.`);
});

// Confirm delivery -> updates inventory and logs stock-in
window.confirmOrder = function (orderId) {
  const idx = activeOrders.findIndex(o => o.id === orderId);
  if (idx === -1) return;

  const order = activeOrders[idx];
  const stockInLog = DB.get("stockin", []);
  stockList = items();

  order.items.forEach(entry => {
    const product = stockList.find(i => i.id === entry.itemId);
    if (product) {
      product.stock = (Number(product.stock) || 0) + entry.qty;
      product.supplier = entry.supplier;
      product.expiry = entry.expiry;
      product.updatedBy = user.username;
    }

    stockInLog.push({ id: Date.now() + Math.random(), date: new Date().toISOString(), ...entry });
    addLog(`Confirmed delivery #${order.orderCode} from ${entry.supplier} (${entry.qty} ${entry.unit} ${entry.itemName})`);
  });

  saveItems(stockList);
  DB.set("stockin", stockInLog);

  // Update each supplier's last delivery date
  const supplierRecords = suppliers();
  order.items.forEach(entry => {
    const record = supplierRecords.find(s => s.name === entry.supplier);
    if (record) record.delivery = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" });
  });
  saveSuppliers(supplierRecords);

  activeOrders.splice(idx, 1);
  saveOrders();
  renderAll();
  notify(`Delivery #${order.orderCode} confirmed and inventory updated.`);
};

// Cancel pending order
window.cancelOrder = function (orderId) {
  const idx = activeOrders.findIndex(o => o.id === orderId);
  if (idx === -1) return;
  const order = activeOrders[idx];
  if (!confirm(`Cancel order #${order.orderCode}?`)) return;

  activeOrders.splice(idx, 1);
  saveOrders();
  addLog(`Cancelled stock order #${order.orderCode}`);
  renderAll();
  notify(`Order #${order.orderCode} cancelled.`);
};

function renderAll() {
  updateBadges();
  renderDraftTable();
  renderWaitingTable();
  renderConfirmTable();
}

// Start the page
if (user) {
  renderNav("stock-in.html");
  renderSupplierOptions();
  renderItemOptions();
  renderAll();
}
