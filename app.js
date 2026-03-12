// ----------------------------
// ID + LocalStorage System
// ----------------------------

// Get current month as 2 digits
function getCurrentMonth() {
  const now = new Date();
  return String(now.getMonth() + 1).padStart(2, '0'); // 01 - 12
}

// Generate unique ID
function generateID(type, category) {
  const month = getCurrentMonth();
  const counterKey = `${type}${category}_${month}`;

  let counter = parseInt(localStorage.getItem(counterKey)) || 0;
  counter += 1;
  localStorage.setItem(counterKey, counter);

  const sequence = String(counter).padStart(3, '0');
  return `${type}${category}${month}${sequence}`;
}

// Save item in central register
function saveItem(type, category, title, description, tags = []) {
  const id = generateID(type, category);
  let register = JSON.parse(localStorage.getItem('centralRegister')) || {};
  register[id] = {
    title,
    description,
    tags,
    type,
    category,
    dateCreated: new Date().toISOString()
  };
  localStorage.setItem('centralRegister', JSON.stringify(register));
  return id;
}

// Get all items
function getAllItems() {
  return JSON.parse(localStorage.getItem('centralRegister')) || {};
}

// Delete item
function deleteItem(id) {
  let register = getAllItems();
  delete register[id];
  localStorage.setItem('centralRegister', JSON.stringify(register));
  displayItems();
}

// Edit item
function editItem(id) {
  let register = getAllItems();
  const item = register[id];
  const newTitle = prompt("Edit Title:", item.title);
  const newDesc = prompt("Edit Description:", item.description);
  if (newTitle !== null) item.title = newTitle;
  if (newDesc !== null) item.description = newDesc;
  register[id] = item;
  localStorage.setItem('centralRegister', JSON.stringify(register));
  displayItems();
}

// ----------------------------
// Display + Filter
// ----------------------------
function displayItems() {
  const container = document.getElementById('item-list');
  const items = getAllItems();
  const filterType = document.getElementById('filter-type').value;
  const filterCategory = document.getElementById('filter-category').value;

  container.innerHTML = '';
  Object.keys(items).sort().forEach(id => {
    const item = items[id];

    if (filterType && item.type !== filterType) return;
    if (filterCategory && item.category !== filterCategory) return;

    const div = document.createElement('div');
    div.innerHTML = `<strong>${id}</strong>: ${item.title} - ${item.description}
      <span class="item-actions">
        <button onclick="editItem('${id}')">Edit</button>
        <button onclick="deleteItem('${id}')">Delete</button>
      </span>`;
    container.appendChild(div);
  });
}

// ----------------------------
// UI Bindings
// ----------------------------
document.getElementById('addBtn').addEventListener('click', () => {
  const title = document.getElementById('title').value.trim();
  const description = document.getElementById('description').value.trim();
  const type = document.getElementById('type').value;
  const category = document.getElementById('category').value;

  if (!title) return alert("Title required");

  saveItem(type, category, title, description);
  displayItems();

  document.getElementById('title').value = '';
  document.getElementById('description').value = '';
});

document.getElementById('filter-type').addEventListener('change', displayItems);
document.getElementById('filter-category').addEventListener('change', displayItems);
document.getElementById('clear-filters').addEventListener('click', () => {
  document.getElementById('filter-type').value = '';
  document.getElementById('filter-category').value = '';
  displayItems();
});

// Initial display
displayItems();
