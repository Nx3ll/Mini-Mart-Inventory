// Shared data used by every page

// Save and load data (kept in the browser)
const DB = {
  // Read a saved value
  get(key, fallback) {
    try {
      const saved = JSON.parse(localStorage.getItem('mm_' + key));
      return saved === null ? fallback : saved;
    } catch (error) {
      return fallback;
    }
  },

  // Save a value
  set(key, value) {
    localStorage.setItem('mm_' + key, JSON.stringify(value));
  }
};

// Store details. Change the name here and it updates on every page.
const STORE = {
  name: 'MN Sari',
  tagline: 'Your local store as your market'
};

// Demo staff accounts
const USERS = [
  { username: 'ana',   password: '1234', name: 'Ana',   role: 'cashier' },
  { username: 'ben',   password: '1234', name: 'Ben',   role: 'clerk'   },
  { username: 'owner', password: '1234', name: 'Owner', role: 'manager' }
];

// Filipino greeting that matches the time of day
function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Magandang umaga';
  if (hour < 13) return 'Magandang tanghali';
  if (hour < 18) return 'Magandang hapon';
  return 'Magandang gabi';
}

// Date as YYYY-MM-DD
function localDate(value) {
  const d = new Date(value);
  const twoDigits = function (n) { return String(n).padStart(2, '0'); };
  return d.getFullYear() + '-' + twoDigits(d.getMonth() + 1) + '-' + twoDigits(d.getDate());
}

// Today's date
function todayStr() {
  return localDate(new Date());
}

// Date N days from now
function inDays(n) {
  return localDate(Date.now() + n * 24 * 60 * 60 * 1000);
}

// Days until a date (negative = expired)
function daysLeft(dateText) {
  if (!dateText) return null;
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.ceil((new Date(dateText) - new Date(todayStr())) / msPerDay);
}

// Get all items (starts with sample items)
function items() {
  let list = DB.get('items');

  if (!list) {
    list = [
      { id: 1, name: 'Lucky Me Pancit Canton', category: 'Processed Foods', unit: 'Piece', cost: 12, price: 15, stock: 4, reorder: 10, expiry: inDays(120), supplier: 'City Wholesale', updatedBy: 'ben' },
      { id: 2, name: 'Coke Mismo', category: 'Drinks', unit: 'Bottle', cost: 16, price: 20, stock: 0, reorder: 12, expiry: inDays(200), supplier: 'Metro Beverage', updatedBy: 'ben' },
      { id: 3, name: 'Milo Sachet', category: 'Drinks', unit: 'Sachet', cost: 8, price: 10, stock: 18, reorder: 10, expiry: inDays(10), supplier: 'City Wholesale', updatedBy: 'ben' },
      { id: 4, name: 'Ligo Sardines 155g', category: 'Canned Goods', unit: 'Can', cost: 20, price: 25, stock: 9, reorder: 6, expiry: inDays(18), supplier: 'City Wholesale', updatedBy: 'ben' },
      { id: 5, name: 'Skyflakes Pack', category: 'Processed Foods', unit: 'Pack', cost: 6, price: 8, stock: 14, reorder: 8, expiry: inDays(23), supplier: 'City Wholesale', updatedBy: 'ben' },
      { id: 6, name: 'Safeguard Soap', category: 'Utilities', unit: 'Piece', cost: 30, price: 38, stock: 3, reorder: 6, expiry: inDays(400), supplier: 'City Wholesale', updatedBy: 'ben' },
      { id: 7, name: 'Kopiko 3-in-1 Sachet', category: 'Drinks', unit: 'Sachet', cost: 5, price: 7, stock: 40, reorder: 20, expiry: inDays(300), supplier: 'City Wholesale', updatedBy: 'ben' },
      { id: 8, name: 'Surf Sachet', category: 'Utilities', unit: 'Sachet', cost: 4, price: 6, stock: 30, reorder: 15, expiry: inDays(500), supplier: 'City Wholesale', updatedBy: 'ben' },
      { id: 9, name: 'Datu Puti Vinegar 200ml', category: 'Processed Foods', unit: 'Bottle', cost: 14, price: 18, stock: 7, reorder: 5, expiry: inDays(250), supplier: 'City Wholesale', updatedBy: 'ben' },
      { id: 10, name: 'Silver Swan Soy Sauce 200ml', category: 'Processed Foods', unit: 'Bottle', cost: 14, price: 18, stock: 8, reorder: 5, expiry: inDays(250), supplier: 'City Wholesale', updatedBy: 'ben' },
      { id: 11, name: 'Piattos Pack', category: 'Processed Foods', unit: 'Pack', cost: 14, price: 18, stock: 12, reorder: 8, expiry: inDays(25), supplier: 'City Wholesale', updatedBy: 'ben' },
      { id: 12, name: 'Bear Brand Sachet', category: 'Drinks', unit: 'Sachet', cost: 11, price: 13, stock: 25, reorder: 12, expiry: inDays(150), supplier: 'Metro Beverage', updatedBy: 'ben' },
      { id: 13, name: 'Itlog (Egg)', category: 'Fragile/Perishable', unit: 'Piece', cost: 8, price: 10, stock: 30, reorder: 24, expiry: inDays(12), supplier: 'Palengke', updatedBy: 'ben' }
    ];
    DB.set('items', list);
  }

  return list;
}

// Save the item list
function saveItems(list) {
  DB.set('items', list);
}

// Is the item out, low or ok?
function stockStatus(item) {
  if (item.stock <= 0) return 'out';
  if (item.stock <= item.reorder) return 'low';
  return 'ok';
}

// Status badge for tables
function badgeHTML(item) {
  const status = stockStatus(item);
  const label = { out: 'OUT', low: 'LOW', ok: 'In stock' }[status];
  return '<span class="b ' + status + '">' + label + '</span>';
}

// Get all sales
function sales() {
  let list = DB.get('sales');

  if (!list) {
    list = [];
    DB.set('sales', list);
  }

  return list;
}

// Save one sale
function addSale(sale) {
  const list = sales();
  list.push(sale);
  DB.set('sales', list);
}

// Format money, like ₱1,250
function peso(amount) {
  return '₱' + Number(amount).toLocaleString('en-PH');
}

// Make text safe to show on the page
function esc(text) {
  return String(text).replace(/[&<>"']/g, function (char) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char];
  });
}

// Get suppliers, each one is { name, contact, supplies, delivery }
function suppliers() {
  let list = DB.get('suppliers');

  if (!list) {
    list = [
      { name: 'City Wholesale', contact: 'N/A', supplies: 'Noodles, canned goods, snacks, soap', delivery: 'N/A' },
      { name: 'Metro Beverage', contact: 'N/A', supplies: 'Drinks', delivery: 'N/A' },
      { name: 'Palengke', contact: 'N/A', supplies: 'Eggs', delivery: 'N/A' }
    ];
    DB.set('suppliers', list);
  }

  // Older saved data was only names. Turn those into full suppliers.
  return list.map(function (s) {
    return typeof s === 'string' ? { name: s, contact: 'N/A', supplies: 'N/A', delivery: 'N/A' } : s;
  });
}

// Save the supplier list
function saveSuppliers(list) {
  DB.set('suppliers', list);
}
