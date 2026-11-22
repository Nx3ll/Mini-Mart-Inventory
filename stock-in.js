const activeUser = localStorage.getItem("minimart_current_user") || "Ana · Cashier";
document.getElementById("userDisplay").textContent = activeUser;


let items = JSON.parse(localStorage.getItem("minimart_items") || "null");
if (!Array.isArray(items) || items.length === 0) {
  items = [];
  localStorage.setItem("minimart_items", JSON.stringify(items));
}

let suppliers = JSON.parse(localStorage.getItem("minimart_suppliers") || "null");
if (!Array.isArray(suppliers) || suppliers.length === 0) {
  suppliers = [];
  localStorage.setItem("minimart_suppliers", JSON.stringify(suppliers));
}

let deliveryQueue = [];

const itemSelect = document.getElementById("itemSelect");
const qtyInput = document.getElementById("qtyInput");
const supplierSelect = document.getElementById("supplierSelect");
const deliveryTableBody = document.getElementById("deliveryTableBody");
const statusMsg = document.getElementById("statusMsg");

function notify(msg) {
  statusMsg.textContent = msg;
  clearTimeout(notify._t);
  notify._t = setTimeout(() => { statusMsg.textContent = ""; }, 3500);
}

function formatExpirySixMonthsOut() {
  const d = new Date();
  d.setMonth(d.getMonth() + 6);
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function renderItemOptions(selectedId = null) {
  itemSelect.innerHTML = "";
  items.forEach(item => itemSelect.add(new Option(item.name, item.id)));

  if (selectedId) {
    itemSelect.value = String(selectedId);
  }
  syncSupplierForSelectedItem();
}

function renderSupplierOptions(selectedSupplier = null) {
  supplierSelect.innerHTML = "";
  suppliers.forEach(s => supplierSelect.add(new Option(s, s)));
  if (selectedSupplier && suppliers.includes(selectedSupplier)) {
    supplierSelect.value = selectedSupplier;
  }
}

function syncSupplierForSelectedItem() {
  const item = items.find(i => String(i.id) === String(itemSelect.value));
  if (item && item.supplier && suppliers.includes(item.supplier)) {
    supplierSelect.value = item.supplier;
  }
}

itemSelect.addEventListener("change", syncSupplierForSelectedItem);

function renderDeliveryTable() {
  if (deliveryQueue.length === 0) {
    deliveryTableBody.innerHTML = `<tr><td colspan="5" class="empty-msg">No items queued for delivery.</td></tr>`;
    return;
  }

  deliveryTableBody.innerHTML = deliveryQueue.map(row => `
    <tr>
      <td>${row.itemName}</td>
      <td>${row.qty}</td>
      <td>${row.unit}</td>
      <td>${row.supplier}</td>
      <td>${row.expiry}</td>
    </tr>
  `).join("");
}

document.getElementById("addDeliveryBtn").addEventListener("click", () => {
  const item = items.find(i => String(i.id) === String(itemSelect.value));
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
    expiry: formatExpirySixMonthsOut()
  });

  qtyInput.value = 1;
  renderDeliveryTable();
});

document.getElementById("confirmDeliveryBtn").addEventListener("click", () => {
  if (deliveryQueue.length === 0) return notify("Add items to the delivery list first.");

  const now = new Date();
  const when = now.toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
  const stockInLog = JSON.parse(localStorage.getItem("minimart_stock_in") || "[]");
  const activityLog = JSON.parse(localStorage.getItem("minimart_activity") || "[]");

  deliveryQueue.forEach(entry => {
    const product = items.find(i => i.id === entry.itemId);
    if (product) {
      product.stock = (Number(product.stock) || 0) + entry.qty;
      product.supplier = entry.supplier;
      product.expiryDate = entry.expiry;
    }

    stockInLog.push({ id: Date.now() + Math.random(), date: now.toISOString(), ...entry });
    activityLog.unshift({
      when,
      who: activeUser.split("·")[0].trim(),
      action: `Received delivery from ${entry.supplier} (${entry.qty} ${entry.unit} ${entry.itemName})`
    });
  });

  localStorage.setItem("minimart_items", JSON.stringify(items));
  localStorage.setItem("minimart_stock_in", JSON.stringify(stockInLog));
  localStorage.setItem("minimart_activity", JSON.stringify(activityLog));

  deliveryQueue = [];
  renderDeliveryTable();
  notify("Delivery confirmed and inventory updated.");
});

renderSupplierOptions();
renderItemOptions();
renderDeliveryTable();