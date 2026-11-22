// Inventory page

// Must be logged in
const user = requireLogin();
let stockList = items();

const addButton = document.getElementById("openAddItem");
const overlay = document.getElementById("addItemOverlay");
const cancelButton = document.getElementById("cancelAddItem");
const form = document.getElementById("addItemForm");
const inventoryBody = document.getElementById("inventoryBody");

const searchInput = document.querySelector(".itemsearch.i");
const categoryFilter = document.getElementById("categoryFilter");
const statusFilter = document.getElementById("statusFilter");

addButton.addEventListener("click", () => {
    overlay.style.display = "block";
});

cancelButton.addEventListener("click", () => {
overlay.style.display = "none";
form.reset();
});

function getStatus(item) {
if (item.stock == 0) {
return "Out of Stock";
}

if (item.stock <= item.reorder) {
return "Low Stock";
}

return "Available";
}

function displayItems() {
inventoryBody.innerHTML = "";

const search = searchInput.value.toLowerCase();
const category = categoryFilter.value;
const status = statusFilter.value;

stockList.forEach((item, index) => {
    const itemStatus = getStatus(item);
    if (
    !item.name.toLowerCase().includes(search) ||
    (category && item.category !== category) ||
    (status && itemStatus !== status)
    ) {
    return;
    }
    const row = document.createElement("tr");
    row.innerHTML = `
    <td>${esc(item.name)}</td>
    <td>${esc(item.category)}</td>
    <td>${esc(item.unit)}</td>
    <td>₱${Number(item.price).toFixed(2)}</td>
    <td>${item.stock}</td>
    <td>${itemStatus}</td>
    <td>
    <button onclick="editItem(${index})">Edit</button>
    <button onclick="deleteItem(${index})">Delete</button>
    </td>
    `;
    inventoryBody.appendChild(row);
    });
}

// Give a new item the next free id (Sales and Stock In need it)
function nextItemId() {
return stockList.reduce(function(max, item) {
return Math.max(max, Number(item.id) || 0);
}, 0) + 1;
}

form.addEventListener("submit", (e) => {
e.preventDefault();

const newItem = {
 id: nextItemId(),
 name: document.getElementById("itemName").value.trim(),
 category: document.getElementById("itemCategory").value,
 unit: document.getElementById("itemUnit").value.trim(),
 cost: Number(document.getElementById("costPrice").value),
 price: Number(document.getElementById("sellingPrice").value),
 stock: Number(document.getElementById("currentStock").value),
 reorder: Number(document.getElementById("reorderLevel").value),
 expiry: document.getElementById("expiryDate").value,
 supplier: document.getElementById("itemSupplier").value.trim(),
 updatedBy: user.username
    };

 stockList.push(newItem);
 saveItems(stockList);
 addLog("Added item " + newItem.name);
 displayItems();
 form.reset();
 overlay.style.display = "none";
});

function editItem(index) {
 const item = stockList[index];
 const newName = prompt("Item name:", item.name);
if (newName === null) return;
 const newPrice = prompt("Selling price:", item.price);
if (newPrice === null) return;
 const newStock = prompt("Current stock:", item.stock);
if (newStock === null) return;

if (
newName.trim() === "" ||
 newPrice.trim() === "" ||
 newStock.trim() === "" ||
 !Number.isFinite(Number(newPrice)) ||
 Number(newPrice) < 0 ||
 !Number.isInteger(Number(newStock)) ||
 Number(newStock) < 0) {
 alert("Please enter valid item details.");
 return;
}

item.name = newName.trim();
item.price = Number(newPrice);
item.stock = Number(newStock);
item.updatedBy = user.username;

saveItems(stockList);
addLog("Edited item " + item.name);
displayItems();
}

function deleteItem(index) {
if (confirm("Are you sure you want to delete this item?")) {
addLog("Deleted item " + stockList[index].name);
stockList.splice(index, 1);
saveItems(stockList);
displayItems();
}
}

searchInput.addEventListener("input", displayItems);
categoryFilter.addEventListener("change", displayItems);
statusFilter.addEventListener("change", displayItems);

if (user) {
renderNav("inventory.html");
}

displayItems();
