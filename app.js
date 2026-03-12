// -------------------- Storage & ID --------------------
function getCurrentMonth(){ const now=new Date(); return String(now.getMonth()+1).padStart(2,'0'); }
function generateID(type,category){ 
  const month=getCurrentMonth();
  const key=`${type}${category}_${month}`;
  let c=parseInt(localStorage.getItem(key))||0; c++; localStorage.setItem(key,c);
  return `${type}${category}${month}${String(c).padStart(3,'0')}`;
}
function getAllItems(){ return JSON.parse(localStorage.getItem('centralRegister'))||{}; }
function getRecycleBin(){ return JSON.parse(localStorage.getItem('recycleBin'))||{}; }
function saveItem(type,category,title,desc){
  const id=generateID(type,category);
  let r=getAllItems(); r[id]={title,description:desc,type,category,dateCreated:new Date().toISOString()};
  localStorage.setItem('centralRegister',JSON.stringify(r)); return id;
}

// -------------------- Delete / Restore --------------------
function deleteItem(id){
  let r=getAllItems(),b=getRecycleBin(); b[id]=r[id]; localStorage.setItem('recycleBin',JSON.stringify(b));
  delete r[id]; localStorage.setItem('centralRegister',JSON.stringify(r));
  displayItems(); displayRecycleBin();
}
function restoreItem(id){
  let r=getAllItems(),b=getRecycleBin(); r[id]=b[id]; localStorage.setItem('centralRegister',JSON.stringify(r));
  delete b[id]; localStorage.setItem('recycleBin',JSON.stringify(b));
  displayItems(); displayRecycleBin();
}
function permanentlyDeleteItem(id){ if(!confirm("Permanently delete?")) return; let b=getRecycleBin(); delete b[id]; localStorage.setItem('recycleBin',JSON.stringify(b)); displayRecycleBin(); }

// -------------------- Edit --------------------
function editItem(id){
  let r=getAllItems(); const item=r[id];
  const t=prompt("Title:",item.title),d=prompt("Desc:",item.description);
  if(t!==null)item.title=t; if(d!==null)item.description=d; r[id]=item; localStorage.setItem('centralRegister',JSON.stringify(r));
  displayItems();
}

// -------------------- Display --------------------
function displayItems(){
  const container=document.getElementById('item-list'); const items=getAllItems();
  const ft=document.getElementById('filter-type').value,fc=document.getElementById('filter-category').value;
  container.innerHTML=''; const keys=Object.keys(items).sort();
  if(keys.length===0){container.innerHTML='<em>No items</em>'; return;}
  keys.forEach(id=>{
    const it=items[id]; if(ft && it.type!==ft)return; if(fc && it.category!==fc)return;
    const div=document.createElement('div');
    div.innerHTML=`<span class="item-dot type-${it.type}"></span>
      <span>${id}: ${it.title}</span>
      <span class="category-badge">${it.category}</span>
      <span class="item-actions">
        <button onclick="editItem('${id}')">✎</button>
        <button onclick="deleteItem('${id}')">🗑</button>
      </span>`;
    container.appendChild(div);
  });
}

function displayRecycleBin(){
  const container=document.getElementById('recycle-bin-list'); const items=getRecycleBin(); const keys=Object.keys(items).sort();
  container.innerHTML=''; if(keys.length===0){container.innerHTML='<em>Recycle Bin is empty</em>'; return;}
  keys.forEach(id=>{
    const it=items[id]; const div=document.createElement('div');
    div.innerHTML=`<span class="item-dot type-${it.type}"></span>
      <span>${id}: ${it.title}</span>
      <span class="category-badge">${it.category}</span>
      <span class="item-actions">
        <button onclick="restoreItem('${id}')">⟳</button>
        <button onclick="permanentlyDeleteItem('${id}')">🗑</button>
      </span>`;
    container.appendChild(div);
  });
}

// -------------------- UI Bindings --------------------
document.getElementById('addBtn').addEventListener('click',()=>{
  const t=document.getElementById('title').value.trim();
  const d=document.getElementById('description').value.trim();
  const type=document.getElementById('type').value,cat=document.getElementById('category').value;
  if(!t) return alert("Title required");
  saveItem(type,cat,t,d);
  document.getElementById('title').value=''; document.getElementById('description').value='';
  displayItems(); displayRecycleBin(); document.getElementById('title').focus();
});

// Enter key quick add
document.getElementById('title').addEventListener('keydown',e=>{ if(e.key==='Enter'){document.getElementById('addBtn').click(); e.preventDefault();}});
document.getElementById('filter-type').addEventListener('change',displayItems);
document.getElementById('filter-category').addEventListener('change',displayItems);
document.getElementById('clear-filters').addEventListener('click',()=>{
  document.getElementById('filter-type').value=''; document.getElementById('filter-category').value=''; displayItems();
});

// Toggle Recycle Bin
document.getElementById('toggle-bin').addEventListener('click',()=>{
  const bin=document.getElementById('recycle-bin-list');
  bin.style.display=(bin.style.display==='none')?'block':'none';
});

// Initial render
displayItems(); displayRecycleBin();
