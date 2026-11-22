// Sales page

// Must be logged in
const user = requireLogin();
// Inventory and the current cart
let stockList = items();
let cart = [];

// Page elements
const searchInput = document.getElementById("searchInput");
const productTableBody = document.getElementById("productTableBody");
const cartList = document.getElementById("cartList");
const cartTotal = document.getElementById("cartTotal");
const statusMsg = document.getElementById("statusMsg");

// Show a short message
function notify(msg) {
  statusMsg.textContent = msg;
  clearTimeout(notify._t);
  notify._t = setTimeout(() => { statusMsg.textContent = ""; }, 3000);
}

// Show products on the left
function renderProducts(filter = "") {
  const q = filter.toLowerCase();
  const visible = stockList.filter(i => i.stock > 0 && i.name.toLowerCase().includes(q));

  if (visible.length === 0) {
    productTableBody.innerHTML = `<tr><td colspan="4" class="empty">No available items found.</td></tr>`;
    return;
  }

  productTableBody.innerHTML = visible.map(item => `
    <tr>
      <td>${esc(item.name)}</td>
      <td>${peso(item.price)}</td>
      <td>${item.stock}</td>
      <td class="right"><button type="button" class="btn2 btn-sm" onclick="addToCart(${item.id})">Add</button></td>
    </tr>
  `).join("");
}

// Add one item to the cart
function addToCart(id) {
  const product = stockList.find(i => i.id === id);
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

// Remove one item from the cart
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

// Show the cart and total
function renderCart() {
  if (cart.length === 0) {
    cartList.innerHTML = `<div class="empty">No items in current sale.</div>`;
    cartTotal.textContent = peso(0);
    return;
  }

  cartList.innerHTML = cart.map(c => `
    <div class="cart-row">
      <span class="cart-row-name" title="Click to decrease quantity" onclick="removeOneFromCart(${c.id})">${esc(c.name)} x ${c.qty}</span>
      <span>${peso(c.price * c.qty)}</span>
    </div>
  `).join("");

  cartTotal.textContent = peso(cart.reduce((sum, c) => sum + c.price * c.qty, 0));
}

// Clear button
document.getElementById("clearCartBtn").addEventListener("click", () => {
  cart = [];
  renderCart();
});

// Complete sale button
document.getElementById("completeSaleBtn").addEventListener("click", () => {
  if (cart.length === 0) return notify("Add at least one item first.");

  const total = cart.reduce((sum, c) => sum + c.price * c.qty, 0);
  const totalItems = cart.reduce((sum, c) => sum + c.qty, 0);

  // Lower the stock
  cart.forEach(c => {
    const product = stockList.find(i => i.id === c.id);
    if (product) {
      product.stock = Math.max(0, Number(product.stock) - c.qty);
      product.updatedBy = user.username;
    }
  });

  // Save the stock, the sale and the log
  saveItems(stockList);
  addSale({
    id: Date.now(),
    date: new Date().toISOString(),
    by: user.username,
    items: cart.map(c => ({ id: c.id, name: c.name, qty: c.qty, price: c.price })),
    total
  });
  addLog(`Sold ${totalItems} ${totalItems === 1 ? "item" : "items"}, ${peso(total)}`);

  // Start fresh for the next customer
  cart = [];
  renderCart();
  renderProducts(searchInput.value);
  notify(`Sale completed (${peso(total)}).`);
});

// Search as you type
searchInput.addEventListener("input", e => renderProducts(e.target.value));

// Start the page
if (user) {
  renderNav("sales.html");
  renderProducts();
  renderCart();
}
