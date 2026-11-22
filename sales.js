const activeUser = localStorage.getItem("minimart_current_user") || "Ana · Cashier";
document.getElementById("userDisplay").textContent = activeUser;

let items = JSON.parse(localStorage.getItem("minimart_items") || "null");
if (!Array.isArray(items) || items.length === 0) {
  items = [];
  localStorage.setItem("minimart_items", JSON.stringify(items));
}

let cart = [];

const searchInput = document.getElementById("searchInput");
const productTableBody = document.getElementById("productTableBody");
const cartList = document.getElementById("cartList");
const cartTotal = document.getElementById("cartTotal");
const statusMsg = document.getElementById("statusMsg");

function notify(msg) {
  statusMsg.textContent = msg;
  clearTimeout(notify._t);
  notify._t = setTimeout(() => { statusMsg.textContent = ""; }, 3000);
}

function renderProducts(filter = "") {
  const q = filter.toLowerCase();
  const visible = items.filter(i => i.stock > 0 && i.name.toLowerCase().includes(q));

  if (visible.length === 0) {
    productTableBody.innerHTML = `<tr><td colspan="4" class="empty-msg">No available items found.</td></tr>`;
    return;
  }

  productTableBody.innerHTML = visible.map(item => `
    <tr>
      <td>${item.name}</td>
      <td>₱${item.price}</td>
      <td>${item.stock}</td>
      <td style="text-align: right;">
        <button type="button" class="btn btn-sm" onclick="addToCart(${item.id})">Add</button>
      </td>
    </tr>
  `).join("");
}

function addToCart(id) {
  const product = items.find(i => i.id === id);
  if (!product || product.stock <= 0) return;

  const existing = cart.find(c => c.id === id);
  if (existing) {
    if (existing.qty >= product.stock) {
      return notify(`Only ${product.stock} left in stock.`);
    }
    existing.qty++;
  } else {
    cart.push({ id: product.id, name: product.name, price: Number(product.price), qty: 1 });
  }
  renderCart();
}

function removeOneFromCart(id) {
  const idx = cart.findIndex(c => c.id === id);
  if (idx === -1) return;
  if (cart[idx].qty > 1) {
    cart[idx].qty--;
  } else {
    cart.splice(idx, 1);
  }
  renderCart();
}

function renderCart() {
  if (cart.length === 0) {
    cartList.innerHTML = `<div class="empty-msg" style="padding-left:0;">No items in current sale.</div>`;
    cartTotal.textContent = "₱0";
    return;
  }

  cartList.innerHTML = cart.map(c => `
    <div class="cart-row">
      <span class="cart-row-name" title="Click to decrease quantity" onclick="removeOneFromCart(${c.id})">
        ${c.name} x ${c.qty}
      </span>
      <span>₱${(c.price * c.qty).toLocaleString()}</span>
    </div>
  `).join("");

  const total = cart.reduce((sum, c) => sum + c.price * c.qty, 0);
  cartTotal.textContent = `₱${total.toLocaleString()}`;
}

document.getElementById("clearCartBtn").addEventListener("click", () => {
  cart = [];
  renderCart();
});

document.getElementById("completeSaleBtn").addEventListener("click", () => {
  if (cart.length === 0) return notify("Add at least one item first.");

  const total = cart.reduce((sum, c) => sum + c.price * c.qty, 0);
  const totalItems = cart.reduce((sum, c) => sum + c.qty, 0);

  cart.forEach(c => {
    const product = items.find(i => i.id === c.id);
    if (product) product.stock = Math.max(0, Number(product.stock) - c.qty);
  });

  const now = new Date();
  const when = now.toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

  const salesLog = JSON.parse(localStorage.getItem("minimart_sales") || "[]");
  salesLog.push({
    id: Date.now(),
    date: now.toISOString(),
    cashier: activeUser,
    items: cart.map(c => ({ id: c.id, name: c.name, qty: c.qty, price: c.price })),
    total
  });

  const activityLog = JSON.parse(localStorage.getItem("minimart_activity") || "[]");
  activityLog.unshift({
    when,
    who: activeUser.split("·")[0].trim(),
    action: `Sold ${totalItems} ${totalItems === 1 ? "item" : "items"}, ₱${total.toLocaleString()}`
  });

  localStorage.setItem("minimart_items", JSON.stringify(items));
  localStorage.setItem("minimart_sales", JSON.stringify(salesLog));
  localStorage.setItem("minimart_activity", JSON.stringify(activityLog));

  cart = [];
  renderCart();
  renderProducts(searchInput.value);
  notify(`Sale completed (₱${total.toLocaleString()}).`);
});

searchInput.addEventListener("input", e => renderProducts(e.target.value));

renderProducts();
renderCart();