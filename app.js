// -------------------- Storage & ID --------------------
function getCurrentMonth(){ const now=new Date(); return String(now.getMonth()+1).padStart(2,'0'); }

function generateID(type,category){ 
  const month=getCurrentMonth();
  const key=`${type}${category}_${month}`;
  let c=parseInt(localStorage.getItem(key))||0; 
  c++; localStorage.setItem(key,c);
  return `${type}${category}${month}${String(c).padStart(3,'0')}`;
}

function getAllItems(){ return JSON.parse(localStorage.getItem('centralRegister'))||{}; }
function getRecycleBin(){ return JSON.parse(localStorage.getItem('recycleBin'))||{}; }

function saveItem(type,category,title){
  const id=generateID(type,category);
  let r=getAllItems(); 
  r[id]={title,type,category,dateCreated:new Date().toISOString()};
  localStorage.setItem('centralRegister',JSON.stringify(r)); 
  return id;
}

// -------------------- Delete / Restore --------------------
function deleteItem(id){
  let r=getAllItems(),b=getRecycleBin(); 
  b[id]=r[id]; 
  localStorage.setItem('recycleBin',JSON.stringify(b));
  delete r[id]; 
  localStorage.setItem('centralRegister',JSON.stringify(r));
  displayItems(); displayRecycleBin();
}

function restoreItem(id){
  let r=getAllItems(),b=getRecycleBin(); 
  r[id]=b[id]; 
  localStorage.setItem('centralRegister',JSON.stringify(r));
  delete b[id]; 
  localStorage.setItem('recycleBin',JSON.stringify(b));
  displayItems(); displayRecycleBin();
}

function permanentlyDeleteItem(id){ 
  if(!confirm("Permanently delete?")) return; 
  let b=getRecycleBin(); 
  delete b[id]; 
  localStorage.setItem('recycleBin',JSON.stringify(b)); 
  displayRecycleBin(); 
}

// -------------------- Edit --------------------
function editItem(id){
  let r=getAllItems(); const item=r[id];
  const t=prompt("Title:",item.title);
  if(t!==null)item.title=t; 
  r[id]=item; 
  localStorage.setItem('centralRegister',JSON.stringify(r));
  displayItems();
}

// -------------------- Display --------------------
function displayItems(){
  const container=document.getElementById('item-list'); 
  const items=getAllItems();
  const ft=document.getElementById('filter-type').value, fc=document.getElementById('filter-category').value;
  container.innerHTML=''; 
  const keys=Object.keys(items).sort();
  if(keys.length===0){container.innerHTML='<em>No items</em>'; return;}
  
  keys.forEach(id=>{
    const it=items[id]; 
    if(ft && it.type!==ft)return; 
    if(fc && it.category!==fc)return;
    const div=document.createElement('div');
    div.innerHTML = `
      <span class="item-dot type-${it.type}"></span>
      <span class="item-title-container">
        <span class="item-title">${id}: ${it.title}</span>
      </span>
      <span class="category-badge">${it.category}</span>
      <span class="item-actions">
        <button onclick="editItem('${id}')">✎</button>
        <button onclick="deleteItem('${id}')">🗑</button>
      </span>
    `;
    container.appendChild(div);
  });
}

function displayRecycleBin(){
  const container=document.getElementById('recycle-bin-list'); 
  const items=getRecycleBin(); 
  const keys=Object.keys(items).sort();
  container.innerHTML=''; 
  if(keys.length===0){container.innerHTML='<em>Recycle Bin is empty</em>'; return;}
  
  keys.forEach(id=>{
    const it=items[id]; 
    const div=document.createElement('div');
    div.innerHTML = `
      <span class="item-dot type-${it.type}"></span>
      <span class="item-title-container">
        <span class="item-title">${id}: ${it.title}</span>
      </span>
      <span class="category-badge">${it.category}</span>
      <span class="item-actions">
        <button onclick="restoreItem('${id}')">⟳</button>
        <button onclick="permanentlyDeleteItem('${id}')">🗑</button>
      </span>
    `;
    container.appendChild(div);
  });
}

// -------------------- UI Bindings --------------------
const titleInput = document.getElementById('title');

document.getElementById('addBtn').addEventListener('click',()=>{
  const t=titleInput.value.trim();
  const type=document.getElementById('type').value, cat=document.getElementById('category').value;
  if(!t) return alert("Title required");
  saveItem(type,cat,t);
  titleInput.value='';
  displayItems(); displayRecycleBin(); 
  titleInput.focus();
});

// Enter key for adding task
titleInput.addEventListener('keydown',e=>{
  if(e.key==='Enter'){document.getElementById('addBtn').click(); e.preventDefault();}
});

// Keep cursor in title input on refresh
window.addEventListener('load',()=>{ titleInput.focus(); });

document.getElementById('filter-type').addEventListener('change',displayItems);
document.getElementById('filter-category').addEventListener('change',displayItems);

document.getElementById('clear-filters').addEventListener('click',()=>{
  document.getElementById('filter-type').value=''; 
  document.getElementById('filter-category').value=''; 
  displayItems();
});

document.getElementById('toggle-bin').addEventListener('click',()=>{
  const bin=document.getElementById('recycle-bin-list');
  bin.style.display=(bin.style.display==='none')?'block':'none';
});

// Initial render
displayItems(); displayRecycleBin();
titleInput.focus();
