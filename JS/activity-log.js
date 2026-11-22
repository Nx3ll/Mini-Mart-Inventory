// Activity log page

// Start if logged in
if (requireLogin()) {
  renderNav('activity-log.html');
  showLog();
}

// Show the log, newest first
function showLog() {
  const log = DB.get('log', []);
  const tableBody = document.getElementById('log-rows');

  if (log.length === 0) {
    tableBody.innerHTML =
      '<tr><td class="empty" colspan="3">No activity yet. Actions like logins and sales will show here.</td></tr>';
    return;
  }

  tableBody.innerHTML = log.map(function (entry) {
    return '<tr>' +
      '<td>' + niceTime(entry.at) + '</td>' +
      '<td>' + whoText(entry.by) + '</td>' +
      '<td>' + esc(entry.action) + '</td>' +
    '</tr>';
  }).join('');
}

// Show time like Nov 22, 9:42 AM
function niceTime(isoText) {
  return new Date(isoText).toLocaleString('en-PH', {
    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
  });
}

// Show name and role
function whoText(username) {
  const user = USERS.find(function (u) { return u.username === username; });
  return user ? esc(user.name) + ' (' + ROLES[user.role] + ')' : esc(username);
}
