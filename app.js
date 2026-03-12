// ----------------------------
// ID + LocalStorage System
// ----------------------------
function getCurrentMonth() {
  const now = new Date();
  return String(now.getMonth() + 1).padStart(2, '0');
}

function generateID(type, category) {
  const month = getCurrentMonth();
  const counterKey = `${type}${category}_${month}`;
  let counter = parseInt(localStorage.getItem(counterKey)) || 0;
  counter += 1;
  localStorage.setItem(counterKey, counter);
  const sequence = String(counter).padStart(3, '0');
  return `${type}${category}${month}${sequence}`;
}

// Save item
function saveItem(type, category, title, description, tags = []) {
  const id = generateID(type, category);
  let register = JSON.parse(localStorage.getItem('centralRegister')) || {};
  register[id] = { title, description, tags, type, category, dateCreated: new Date().toISOString() };
  localStorage.setItem('centralRegister', JSON.stringify(register));
  return id;
}

// Get items
function getAllItems() {
  return JSON.parse(localStorage.getItem('centralRegister')) || {};
}

function getRecycleBin() {
  return JSON.parse(localStorage.getItem('recycleBin')) || {};
}

// ----------------------------
// Delete / Recycle Bin
// ----------------------------
function deleteItem(id) {
  let register = getAllItems();
  let recycle = getRecycleBin();

  recycle[id] = register[id];
  localStorage.setItem('recycleBin', JSON.stringify(recycle));

  delete register[id];
  localStorage.setItem('centralRegister', JSON.stringify(register));

  displayItems();
  displayRecycleBin();
}

function restoreItem(id) {
  let register = getAllItems();
  let recycle = getRecycleBin();

  register[id] = recycle[id];
  localStorage.setItem('centralRegister', JSON.stringify(register));

  delete recycle[id];
  localStorage.setItem('recycleBin', JSON.stringify(recycle));

  displayItems();
  displayRecycleBin();
}

function permanentlyDeleteItem(id) {
  if (!confirm("Are you sure you want to permanently delete this item?")) return;

  let recycle = getRecycleBin();
  delete recycle[id];
  localStorage.setItem('recycleBin', JSON.stringify(recycle));
  displayRecycleBin();
}

// Edit active item
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
  const keys = Object.keys(items).sort();
  if (keys.length === 0) container.innerHTML = '<em>No items</em>';

  keys.forEach(id => {
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

function displayRecycleBin() {
  const container = document.getElementById('recycle-bin-list');
  const items = getRecycleBin();
  container.innerHTML = '';
  const keys = Object.keys(items).sort();
  if (keys.length === 0) container.innerHTML = '<em>Recycle Bin is empty</em>';

  keys.forEach(id => {
    const item = items[id];
    const div = document.createElement('div');
    div.innerHTML = `<strong>${id}</strong>: ${item.title} - ${item.description}
      <span class="item-actions">
        <button onclick="restoreItem('${id}')">Restore</button>
        <button onclick="permanentlyDeleteItem('${id}')">Delete Permanently</button>
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

  document.getElementById('title').value = '';
  document.getElementById('description').value = '';

  displayItems();
  displayRecycleBin();
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
displayRecycleBin();
