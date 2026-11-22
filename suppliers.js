
let suppliers = JSON.parse(localStorage.getItem("suppliers")) || [];

// Remove the old sample suppliers
suppliers = suppliers.filter(function(supplier) {
    return supplier.name !== "Metro Beverage" && supplier.name !== "City Wholesale";
});

const supplierBody = document.getElementById("supplierBody");
const addButton = document.getElementById("addSupplier");

function displaySuppliers() {
supplierBody.innerHTML = "";

suppliers.forEach(function(supplier, index) {
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
    suppliers.splice(index, 1);
    displaySuppliers();
    }
    });

    actionCell.appendChild(history);
    actionCell.appendChild(remove);
    row.appendChild(actionCell);
    supplierBody.appendChild(row);
    });

    localStorage.setItem("suppliers", JSON.stringify(suppliers));
}

function addSupplier() {
    let name = prompt("Enter supplier name:");
    if (!name || !name.trim()) return;

    let contact = prompt("Enter contact number:") || "N/A";
    let supplies = prompt("Enter supplies:") || "N/A";
    let delivery = prompt("Enter last delivery date:") || "N/A";

    suppliers.push({
    name: name.trim(),
    contact: contact,
    supplies: supplies,
    delivery: delivery
    });

    displaySuppliers();
}

addButton.addEventListener("click", addSupplier);

displaySuppliers();