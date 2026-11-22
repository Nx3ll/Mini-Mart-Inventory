// E-load / GCash page

// Must be logged in
const user = requireLogin();

// Wallets, fees and transactions
let eloadState = DB.get("eload", null);
if (!eloadState) {
  eloadState = { gcashWallet: 0, eloadWallet: 0, totalFees: 0, transactions: [] };
  DB.set("eload", eloadState);
}

// Page elements
const mobileInput = document.getElementById("mobileInput");
const digitCounter = document.getElementById("digitCounter");
const statusMsg = document.getElementById("statusMsg");
let statusTimer = null;

// Show a short message
function notify(msg) {
  statusMsg.textContent = msg;
  clearTimeout(statusTimer);
  statusTimer = setTimeout(() => { statusMsg.textContent = ""; }, 3500);
}

// Save wallets and transactions
function saveEloadState() {
  DB.set("eload", eloadState);
}

// Show balances and transactions
function renderWalletsAndLogs() {
  document.getElementById("gcashBalance").textContent = peso(eloadState.gcashWallet);
  document.getElementById("eloadBalance").textContent = peso(eloadState.eloadWallet);
  document.getElementById("feesEarned").textContent = peso(eloadState.totalFees);

  const tbody = document.getElementById("txTableBody");
  if (eloadState.transactions.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" class="empty">No transactions recorded yet.</td></tr>`;
    return;
  }

  tbody.innerHTML = eloadState.transactions.map(tx => `
    <tr>
      <td>${esc(tx.type)}</td>
      <td>${esc(tx.mobile)}</td>
      <td>${peso(tx.amount)}</td>
      <td>${peso(tx.fee)}</td>
    </tr>
  `).join("");
}

// Update a wallet balance by hand
document.getElementById("updateWalletBtn").addEventListener("click", () => {
  const wallet = document.getElementById("walletSelect").value;
  const val = parseFloat(document.getElementById("newWalletAmount").value);

  if (isNaN(val) || val < 0) {
    return notify("Enter a valid wallet balance.");
  }

  if (wallet === "gcash") {
    eloadState.gcashWallet = val;
    addLog(`Updated GCash wallet balance to ${peso(val)}`);
  } else {
    eloadState.eloadWallet = val;
    addLog(`Updated E-load wallet balance to ${peso(val)}`);
  }

  saveEloadState();
  document.getElementById("newWalletAmount").value = "";
  renderWalletsAndLogs();
  notify("Wallet balance updated.");
});

// Digits only, max 11
mobileInput.addEventListener("input", () => {
  mobileInput.value = mobileInput.value.replace(/\D/g, "").slice(0, 11);
  digitCounter.textContent = `${mobileInput.value.length}/11`;
});

// Record a transaction
document.getElementById("recordTxBtn").addEventListener("click", () => {
  const type = document.getElementById("txType").value;
  const mobile = mobileInput.value.trim();
  const amount = parseFloat(document.getElementById("amountInput").value);
  const fee = parseFloat(document.getElementById("feeInput").value) || 0;

  if (mobile.length !== 11 || !mobile.startsWith("09")) {
    return notify("Enter a valid 11-digit mobile number starting with 09.");
  }

  if (!amount || amount <= 0) {
    return notify("Enter a valid transaction amount.");
  }

  // Check there is enough money, then move it
  if (type === "GCash Cash-In") {
    if (amount > eloadState.gcashWallet) {
      return notify("Insufficient GCash wallet balance.");
    }
    eloadState.gcashWallet -= amount;
  } else if (type === "GCash Cash-Out") {
    eloadState.gcashWallet += amount;
  } else if (type === "E-load") {
    if (amount > eloadState.eloadWallet) {
      return notify("Insufficient E-load retailer balance.");
    }
    eloadState.eloadWallet -= amount;
  }

  eloadState.totalFees += fee;
  eloadState.transactions.unshift({ type, mobile, amount, fee });

  saveEloadState();
  addLog(`Recorded ${type} (${peso(amount)})`);

  mobileInput.value = "";
  digitCounter.textContent = "0/11";
  document.getElementById("amountInput").value = "";
  renderWalletsAndLogs();
  notify(`${type} (${peso(amount)}) recorded.`);
});

// Start the page
if (user) {
  renderNav("eload.html");
  renderWalletsAndLogs();
}
