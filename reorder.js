
let items = JSON.parse(localStorage.getItem("items")) || [];

const reorderBody = document.getElementById("reorderBody");
const printButton = document.getElementById("printList");

function displayReorder() {
   reorderBody.innerHTML = "";

    let reorderItems = items.filter(function(item) {
    return Number(item.stock) <= Number(item.reorder);
    });

    if (reorderItems.length === 0) {
    reorderBody.innerHTML = `
    <tr>
    <td colspan="5" class="emptyMessage">No items need restocking.</td>
    </tr>
    `;
    return;
    }

    reorderItems.forEach(function(item) {
    let status = Number(item.stock) === 0 ? "OUT" : "LOW";
    let row = document.createElement("tr");

    let values = [
    item.name,
    item.stock,
    item.reorder,
    item.supplier || "N/A"
    ];

    values.forEach(function(value) {
    let cell = document.createElement("td");
    cell.textContent = value;
    row.appendChild(cell);
    });

    let statusCell = document.createElement("td");
    let badge = document.createElement("span");

    badge.textContent = status;
    badge.className = status === "OUT" ? "statusBadge out" : "statusBadge low";

    statusCell.appendChild(badge);
    row.appendChild(statusCell);
    reorderBody.appendChild(row);
    });
}

printButton.addEventListener("click", function() {
    window.print();
});

displayReorder();