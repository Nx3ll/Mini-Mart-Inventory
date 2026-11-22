const activeUser = localStorage.getItem("minimart_current_user") || "Ana · Cashier";
document.getElementById("userDisplay").textContent = activeUser;

let eloadState = JSON.parse(localStorage.getItem("minimart_eload") || "null");
if (!eloadState) {
  eloadState = {
    gcashWallet: 0,
    eloadWallet: 0,
    totalFees: 0,
    transactions: []
  };
  localStorage.setItem("minimart_eload", JSON.stringify(eloadState));
}

const mobileInput = document.getElementById("mobileInput");
const digitCounter = document.getElementById("digitCounter");
const statusMsg = document.getElementById("statusMsg");
let statusTimer = null;

function notify(msg) {
  statusMsg.textContent = msg;
  clearTimeout(statusTimer);
  statusTimer = setTimeout(() => {
    statusMsg.textContent = "";
  }, 3500);
}

function saveEloadState() {
  localStorage.setItem("minimart_eload", JSON.stringify(eloadState));
}

function logActivity(actionText) {
  const now = new Date();
  const when = now.toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
  const activityLog = JSON.parse(localStorage.getItem("minimart_activity") || "[]");
  activityLog.unshift({
    when,
    who: activeUser.split("·")[0].trim(),
    action: actionText
  });
  localStorage.setItem("minimart_activity", JSON.stringify(activityLog));
}

function renderWalletsAndLogs() {
  document.getElementById("gcashBalance").textContent = `₱${eloadState.gcashWallet.toLocaleString()}`;
  document.getElementById("eloadBalance").textContent = `₱${eloadState.eloadWallet.toLocaleString()}`;
  document.getElementById("feesEarned").textContent = `₱${eloadState.totalFees.toLocaleString()}`;

  const tbody = document.getElementById("txTableBody");
  if (eloadState.transactions.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" class="empty-msg">No transactions recorded yet.</td></tr>`;
    return;
  }

  tbody.innerHTML = eloadState.transactions.map(tx => `
    <tr>
      <td>${tx.type}</td>
      <td>${tx.mobile}</td>
      <td>₱${tx.amount.toLocaleString()}</td>
      <td>₱${tx.fee.toLocaleString()}</td>
    </tr>
  `).join("");
}

document.getElementById("updateWalletBtn").addEventListener("click", () => {
  const wallet = document.getElementById("walletSelect").value;
  const val = parseFloat(document.getElementById("newWalletAmount").value);

  if (isNaN(val) || val < 0) {
    return notify("Enter a valid wallet balance.");
  }

  if (wallet === "gcash") {
    eloadState.gcashWallet = val;
    logActivity(`Updated GCash wallet balance to ₱${val.toLocaleString()}`);
  } else {
    eloadState.eloadWallet = val;
    logActivity(`Updated E-load wallet balance to ₱${val.toLocaleString()}`);
  }

  saveEloadState();
  document.getElementById("newWalletAmount").value = "";
  renderWalletsAndLogs();
  notify("Wallet balance updated.");
});

mobileInput.addEventListener("input", () => {
  mobileInput.value = mobileInput.value.replace(/\D/g, "").slice(0, 11);
  digitCounter.textContent = `${mobileInput.value.length}/11`;
});

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
  eloadState.transactions.unshift({
    type,
    mobile,
    amount,
    fee
  });

  saveEloadState();
  logActivity(`Recorded ${type} (₱${amount.toLocaleString()})`);

  mobileInput.value = "";
  digitCounter.textContent = "0/11";
  document.getElementById("amountInput").value = "";
  renderWalletsAndLogs();
  notify(`${type} (₱${amount.toLocaleString()}) recorded.`);
});

renderWalletsAndLogs();