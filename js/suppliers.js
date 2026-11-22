// Suppliers page

// Must be logged in
const user = requireLogin();
let supplierList = suppliers();

const supplierBody = document.getElementById("supplierBody");
const addButton = document.getElementById("addSupplier");

function displaySuppliers() {
supplierBody.innerHTML = "";

supplierList.forEach(function(supplier, index) {
    let row = document.createElement("tr");
    let values = [supplier.name, supplier.contact, supplier.supplies, supplier.delivery];

    values.forEach(function(value) {
    let cell = document.createElement("td");
    cell.textContent = value;
    row.appendChild(cell);
    });

    let actionCell = document.createElement("td");
    let history = document.createElement("a");
    history.href = "#";
    history.textContent = "History";
    history.addEventListener("click", function(event) {
    event.preventDefault();
    alert("No delivery history available for " + supplier.name);
    });

    let remove = document.createElement("button");
    remove.textContent = "Remove";
    remove.className = "removeSupplier";
    remove.addEventListener("click", function() {
    if (confirm("Remove " + supplier.name + "?")) {
    addLog("Removed supplier " + supplier.name);
    supplierList.splice(index, 1);
    displaySuppliers();
    }
    });

    actionCell.appendChild(history);
    actionCell.appendChild(remove);
    row.appendChild(actionCell);
    supplierBody.appendChild(row);
    });

    saveSuppliers(supplierList);
}

function addSupplier() {
    let name = prompt("Enter supplier name:");
    if (!name || !name.trim()) return;

    let contact = prompt("Enter contact number:") || "N/A";
    let supplies = prompt("Enter supplies:") || "N/A";
    let delivery = prompt("Enter last delivery date:") || "N/A";

    supplierList.push({
    name: name.trim(),
    contact: contact,
    supplies: supplies,
    delivery: delivery
    });
    addLog("Added supplier " + name.trim());

    displaySuppliers();
}

addButton.addEventListener("click", addSupplier);

if (user) {
renderNav("suppliers.html");
}

displaySuppliers();
