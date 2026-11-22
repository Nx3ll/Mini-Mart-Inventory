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

// Demo staff accounts
const USERS = [
  { username: 'ana',   password: '1234', name: 'Ana',   role: 'cashier' },
  { username: 'ben',   password: '1234', name: 'Ben',   role: 'clerk'   },
  { username: 'owner', password: '1234', name: 'Owner', role: 'manager' }
];

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
      { id: 1, name: 'Lucky Me Pancit Canton', category: 'Noodles',      unit: 'Piece',  cost: 12, price: 15, stock: 4,  reorder: 10, expiry: inDays(120), supplier: 'City Wholesale', updatedBy: 'ben' },
      { id: 2, name: 'Coke Mismo',             category: 'Drinks',       unit: 'Bottle', cost: 16, price: 20, stock: 0,  reorder: 12, expiry: inDays(200), supplier: 'Metro Beverage', updatedBy: 'ben' },
      { id: 3, name: 'Milo Sachet',            category: 'Drinks',       unit: 'Sachet', cost: 8,  price: 10, stock: 18, reorder: 10, expiry: inDays(10),  supplier: 'City Wholesale', updatedBy: 'ben' },
      { id: 4, name: 'Sardines 155g',          category: 'Canned goods', unit: 'Can',    cost: 20, price: 25, stock: 9,  reorder: 6,  expiry: inDays(18),  supplier: 'City Wholesale', updatedBy: 'ben' },
      { id: 5, name: 'Skyflakes Pack',         category: 'Snacks',       unit: 'Pack',   cost: 6,  price: 8,  stock: 14, reorder: 8,  expiry: inDays(23),  supplier: 'City Wholesale', updatedBy: 'ben' },
      { id: 6, name: 'Safeguard Soap',         category: 'Toiletries',   unit: 'Piece',  cost: 30, price: 38, stock: 3,  reorder: 6,  expiry: inDays(400), supplier: 'City Wholesale', updatedBy: 'ben' }
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

// Get supplier names
function suppliers() {
  let list = DB.get('suppliers');

  if (!list) {
    list = ['City Wholesale', 'Metro Beverage'];
    DB.set('suppliers', list);
  }

  return list;
}

// Save supplier names
function saveSuppliers(list) {
  DB.set('suppliers', list);
}
