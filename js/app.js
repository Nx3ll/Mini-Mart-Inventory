// Login, roles, menu and activity log

// Role names
const ROLES = {
  cashier: 'Cashier',
  clerk:   'Stock clerk',
  manager: 'Owner / Manager'
};

const EVERYONE = ['cashier', 'clerk', 'manager'];

// Pages and which roles can open them
const PAGES = [
  { name: 'Dashboard',    href: 'dashboard.html',    roles: EVERYONE },
  { name: 'Inventory',    href: 'inventory.html',    roles: EVERYONE },
  { name: 'Sales',        href: 'sales.html',        roles: ['cashier', 'manager'] },
  { name: 'Stock In',     href: 'stock-in.html',     roles: ['clerk', 'manager'] },
  { name: 'Reorder',      href: 'reorder.html',      roles: ['clerk', 'manager'] },
  { name: 'Suppliers',    href: 'suppliers.html',    roles: ['clerk', 'manager'] },
  { name: 'Reports',      href: 'reports.html',      roles: ['manager'] },
  { name: 'Activity Log', href: 'activity-log.html', roles: ['manager'] }
];

// Who is logged in (or null)
function currentUser() {
  const username = DB.get('session');
  if (!username) return null;
  return USERS.find(function (user) { return user.username === username; }) || null;
}

// Can this person open this page?
function canAccess(href) {
  const user = currentUser();
  if (!user) return false;

  const page = PAGES.find(function (p) { return p.href === href; });
  if (!page) return true;
  return page.roles.includes(user.role);
}

// Put at the top of every page
function requireLogin() {
  const user = currentUser();

  if (!user) {
    location.replace('index.html');
    return null;
  }

  const thisPage = PAGES.find(function (p) { return location.pathname.endsWith(p.href); });
  if (thisPage && !thisPage.roles.includes(user.role)) {
    alert('Your role cannot open this page.');
    location.replace('dashboard.html');
    return null;
  }

  return user;
}

// Check username and password
function login(username, password) {
  const cleanName = username.trim().toLowerCase();
  const user = USERS.find(function (u) {
    return u.username === cleanName && u.password === password;
  });

  if (!user) return false;

  DB.set('session', user.username);
  addLog('Logged in', user.username);
  return true;
}

// Log out
function logout() {
  const user = currentUser();
  if (user) addLog('Logged out', user.username);

  localStorage.removeItem('mm_session');
  location.href = 'index.html';
}

// Add a line to the activity log
function addLog(action, who) {
  const log = DB.get('log', []);

  log.unshift({
    at: new Date().toISOString(),
    by: who || (currentUser() ? currentUser().username : 'unknown'),
    action: action
  });

  DB.set('log', log.slice(0, 500));
}

// Draw the top menu
function renderNav(activePage) {
  document.title = document.title.split(' · ')[0] + ' · ' + STORE.name;
  const user = currentUser();

  const links = PAGES
    .filter(function (page) { return page.roles.includes(user.role); })
    .map(function (page) {
      const isActive = page.href === activePage ? ' class="on"' : '';
      return '<a href="' + page.href + '"' + isActive + '>' + page.name + '</a>';
    })
    .join('');

  document.getElementById('nav').innerHTML =
    '<span class="brand"><span class="logo">' + esc(STORE.name.charAt(0)) + '</span><b>' + esc(STORE.name) + '</b></span>' +
    links +
    '<span class="who">' + esc(user.name) + ' · ' + ROLES[user.role] +
    '<a href="#" id="logout-link">Log out</a></span>';

  document.getElementById('logout-link').onclick = function (event) {
    event.preventDefault();
    logout();
  };
}
