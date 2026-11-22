// Staff accounts management page (Owner / Manager only)

const user = requireLogin();
let accountList = users();

const form = document.getElementById("createAccountForm");
const accountsTableBody = document.getElementById("accountsTableBody");
const statusMsg = document.getElementById("statusMsg");

function notify(msg) {
  statusMsg.textContent = msg;
  clearTimeout(notify._t);
  notify._t = setTimeout(() => { statusMsg.textContent = ""; }, 3500);
}

function renderAccounts() {
  if (accountList.length === 0) {
    accountsTableBody.innerHTML = `<tr><td colspan="4" class="empty">No accounts found.</td></tr>`;
    return;
  }

  accountsTableBody.innerHTML = accountList.map((acc, index) => {
    const isSelf = user && acc.username === user.username;
    return `
      <tr>
        <td><b>${esc(acc.name)}</b>${isSelf ? ' <span class="note">(You)</span>' : ''}</td>
        <td>${esc(acc.username)}</td>
        <td><span class="b ok">${esc(ROLES[acc.role] || acc.role)}</span></td>
        <td class="right">
          <button type="button" class="btn2 btn-sm" onclick="changePassword(${index})">Reset password</button>
          ${isSelf ? '' : `<button type="button" class="btn2 btn-sm" onclick="removeAccount(${index})">Delete</button>`}
        </td>
      </tr>
    `;
  }).join("");
}

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const name = document.getElementById("accName").value.trim();
  const username = document.getElementById("accUsername").value.trim().toLowerCase();
  const role = document.getElementById("accRole").value;
  const password = document.getElementById("accPassword").value;
  const confirm = document.getElementById("accConfirm").value;

  if (!name) return notify("Enter a display name.");
  if (!username || /\s/.test(username)) return notify("Username cannot be empty or contain spaces.");
  if (accountList.some(u => u.username === username)) return notify("That username is already taken.");
  if (password.length < 4) return notify("Password must be at least 4 characters.");
  if (password !== confirm) return notify("Passwords do not match.");

  accountList.push({ username, password, name, role });
  saveUsers(accountList);
  addLog(`Created ${ROLES[role]} account for ${name} (${username})`);

  form.reset();
  renderAccounts();
  notify(`Account created for ${name} (${username}).`);
});

window.changePassword = function (index) {
  const target = accountList[index];
  if (!target) return;

  const newPass = prompt(`Enter new password for ${target.name} (${target.username}):`);
  if (newPass === null) return;
  if (newPass.trim().length < 4) {
    alert("Password must be at least 4 characters.");
    return;
  }

  target.password = newPass;
  saveUsers(accountList);
  addLog(`Reset password for ${target.name} (${target.username})`);
  notify(`Password updated for ${target.username}.`);
};

window.removeAccount = function (index) {
  const target = accountList[index];
  if (!target) return;
  if (user && target.username === user.username) {
    alert("You cannot delete your own active account.");
    return;
  }

  if (!confirm(`Delete account for ${target.name} (${target.username})?`)) return;

  accountList.splice(index, 1);
  saveUsers(accountList);
  addLog(`Deleted account ${target.username}`);
  renderAccounts();
  notify(`Deleted account ${target.username}.`);
};

if (user) {
  renderNav("accounts.html");
  renderAccounts();
}
