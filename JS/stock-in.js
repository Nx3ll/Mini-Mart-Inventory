// Stock in page

// Must be logged in
const user = requireLogin();
// Inventory, suppliers, and items in this delivery
let stockList = items();
let supplierList = suppliers();
let deliveryQueue = [];

// Page elements
const itemSelect = document.getElementById("itemSelect");
const qtyInput = document.getElementById("qtyInput");
const supplierSelect = document.getElementById("supplierSelect");
const deliveryTableBody = document.getElementById("deliveryTableBody");
const statusMsg = document.getElementById("statusMsg");

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

// Show items in this delivery
function renderDeliveryTable() {
  if (deliveryQueue.length === 0) {
    deliveryTableBody.innerHTML = `<tr><td colspan="5" class="empty">No items queued for delivery.</td></tr>`;
    return;
  }

  deliveryTableBody.innerHTML = deliveryQueue.map(row => `
    <tr>
      <td>${esc(row.itemName)}</td>
      <td>${row.qty}</td>
      <td>${esc(row.unit)}</td>
      <td>${esc(row.supplier)}</td>
      <td>${monthYear(row.expiry)}</td>
    </tr>
  `).join("");
}

// Add to delivery button
document.getElementById("addDeliveryBtn").addEventListener("click", () => {
  const item = stockList.find(i => String(i.id) === String(itemSelect.value));
  const qty = parseInt(qtyInput.value, 10);
  const supplier = supplierSelect.value;

  if (!item) return notify("Select a valid item.");
  if (isNaN(qty) || qty < 1) return notify("Enter a valid quantity.");
  if (!supplier) return notify("Select a valid supplier.");

  deliveryQueue.push({
    itemId: item.id,
    itemName: item.name,
    qty,
    unit: item.unit || "Piece",
    supplier,
    expiry: sixMonthsOut()
  });

  qtyInput.value = 1;
  renderDeliveryTable();
});

// Confirm delivery button
document.getElementById("confirmDeliveryBtn").addEventListener("click", () => {
  if (deliveryQueue.length === 0) return notify("Add items to the delivery list first.");

  const stockInLog = DB.get("stockin", []);

  // Add the stock and log it
  deliveryQueue.forEach(entry => {
    const product = stockList.find(i => i.id === entry.itemId);
    if (product) {
      product.stock = (Number(product.stock) || 0) + entry.qty;
      product.supplier = entry.supplier;
      product.expiry = entry.expiry;
      product.updatedBy = user.username;
    }

    stockInLog.push({ id: Date.now() + Math.random(), date: new Date().toISOString(), ...entry });
    addLog(`Received delivery from ${entry.supplier} (${entry.qty} ${entry.unit} ${entry.itemName})`);
  });

  // Save and clear the list
  saveItems(stockList);
  DB.set("stockin", stockInLog);

  deliveryQueue = [];
  renderDeliveryTable();
  notify("Delivery confirmed and inventory updated.");
});

// Start the page
if (user) {
  renderNav("stock-in.html");
  renderSupplierOptions();
  renderItemOptions();
  renderDeliveryTable();
}
