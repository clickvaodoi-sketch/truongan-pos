function initCategories() {
    if(!ALL_PRODUCTS || ALL_PRODUCTS.length === 0) return;
    
    // Tìm cột phân loại một cách linh hoạt, chống sập khi đổi tên cột
    categoryCol = Object.keys(ALL_PRODUCTS[0]).find(k => String(k).toLowerCase().includes('loại')) || 'Loại - N';
    
    let catSet = new Set();
    ALL_PRODUCTS.forEach(p => {
        let cats = String(p[categoryCol] || '');
        if(cats) { cats.split(',').forEach(c => { let cleanCat = c.trim(); if(cleanCat) catSet.add(cleanCat); }); }
    });
    ALL_CATEGORIES = Array.from(catSet).sort(); 
    renderCatTags();
    let catDl = document.getElementById('catDatalist');
    if(catDl) catDl.innerHTML = ALL_CATEGORIES.map(c => `<option value="${c}"></option>`).join('');
}

function renderCatTags() {
    let bar = document.getElementById('catFilterBar');
    if(!categoryCol || ALL_CATEGORIES.length === 0) { if(bar) bar.style.display = 'none'; return; }
    if(bar) {
        bar.style.display = 'flex';
        let html = `<div class="cat-tag ${activeTags.length===0 ? 'active':''}" onclick="toggleTag('ALL')">Tất cả</div>`;
        ALL_CATEGORIES.forEach(c => { let isActive = activeTags.includes(c) ? 'active' : ''; html += `<div class="cat-tag ${isActive}" onclick="toggleTag('${c}')">${c}</div>`; });
        bar.innerHTML = html;
    }
}

function renderCategoryBadges(catStr) {
    let safeStr = String(catStr || '').trim();
    let icon = ' <span style="font-size:10px; opacity:0.6; margin-left:4px;">▼</span>';
    if(!safeStr) return `<div style="opacity:0.6; font-size:12px; cursor:pointer; padding:4px; display:inline-flex; align-items:center; justify-content:center; width:100%;">Chọn ${icon}</div>`; 
    let cats = safeStr.split(',').map(c => c.trim()).filter(c=>c);
    if(cats.length === 0) return `<div style="opacity:0.6; font-size:12px; cursor:pointer; padding:4px; display:inline-flex; align-items:center; justify-content:center; width:100%;">Chọn ${icon}</div>`;
    let display = `<span class="cat-badge">${cats[0]}</span>`;
    if(cats.length > 1) display += `<span class="cat-badge" style="background:transparent;color:inherit;border-color:inherit;opacity:0.7;">+${cats.length-1}</span>`;
    return `<div title="${cats.join(', ')}" style="cursor:pointer; display:inline-flex; align-items:center; justify-content:center; width:100%;">${display}${icon}</div>`;
}

function toggleTag(cat) {
    if(cat === 'ALL') { activeTags = []; } else { if(activeTags.includes(cat)) activeTags = activeTags.filter(t => t !== cat); else activeTags.push(cat); }
    renderCatTags(); renderProductsData(true);
}

function renderProductsData(resetLimit = false) {
    try {
        let pl = document.getElementById("productsList");
        if(!ALL_PRODUCTS || ALL_PRODUCTS.length === 0) {
            if(pl) pl.innerHTML = '<div style="padding:20px; text-align:center; opacity:0.6;">Chưa có sản phẩm nào. Hãy bấm "Tải Về" hoặc Thêm mới.</div>';
            return;
        }

        if(resetLimit) limitProd = 50;
        let sEl = document.getElementById("searchProducts"); let s = sEl ? String(sEl.value).toLowerCase().trim() : '';
        let filtered = s ? ALL_PRODUCTS.filter(p => Object.values(p).join(' ').toLowerCase().includes(s)) : ALL_PRODUCTS;
        if(categoryCol && activeTags.length > 0) { filtered = filtered.filter(p => activeTags.some(tag => String(p[categoryCol]||'').includes(tag))); }
        let exclude = ['link ảnh', 'chi tiết json', '% khuyến mãi', 'giá khuyến mãi', '% km', 'giá km'];
        let keys = Object.keys(ALL_PRODUCTS[0] || {}); 
        let vis = keys.filter(k => !hiddenColsProducts[k] && !exclude.some(ex => String(k).toLowerCase().includes(ex)));
        
        let totalStockVal = filtered.reduce((sum, p) => sum + (Number(p[getKeyByKeyword(p, 'tồn kho')])||0), 0);
        let pcEl = document.getElementById('prodCountDisplay'); 
        if(pcEl) pcEl.innerText = `${filtered.length} mã | Tồn: ${totalStockVal}`;

        let sliced = filtered.slice(0, limitProd);

        let html = viewMode === 'table' ? `<div class="table-responsive"><table><thead><tr><th class="col-check"><input type="checkbox" onclick="toggleAllChecks(this)"/></th>` : `<div class="data-grid">`;
        if(viewMode === 'table') { 
            vis.forEach(k => {
                let cClass = '';
                if(k === 'Mã SP') cClass = 'col-id';
                if(String(k).toLowerCase().includes('tiền') || String(k).toLowerCase().includes('giá') || String(k).toLowerCase().includes('gốc')) cClass += ' text-right';
                let displayName = (k === categoryCol) ? 'Phân loại' : k; 
                html += `<th class="${cClass.trim()}" title="${k}">${displayName}</th>`;
            }); 
            html += `<th style="width:100px;" class="text-center">% K.Mãi</th><th class="col-action">Tác vụ</th></tr></thead><tbody>`; 
        }

        sliced.forEach((p) => {
          try {
              let keyTonKho = getKeyByKeyword(p, 'tồn kho') || 'Tồn kho'; let keyDangDat = getKeyByKeyword(p, 'đang đặt') || 'Đang đặt';
              let keyLe = getKeyByKeyword(p, 'lẻ') || getKeyByKeyword(p, 'bán');
              let tkReal = Number(p[keyTonKho]) || 0; let dangDat = Number(p[keyDangDat]) || 0;
              let isOutOfStock = (tkReal - dangDat) <= 0; 
              let keyPctKm = getKeyByKeyword(p, '% khuyến mãi') || '% Khuyến mãi'; let keyGiaKm = getKeyByKeyword(p, 'giá khuyến mãi') || 'Giá khuyến mãi';
              let curPct = p[keyPctKm] || '';

              if(viewMode === 'table') {
                 html += `<tr id="item_${p['Mã SP']}"><td class="col-check"><input type="checkbox" class="chk-box" value="${p['Mã SP']}" onchange="checkBulk()"/></td>`;
                 vis.forEach(k => {
                    let val = p[k] || ''; let titleVal = String(val).replace(/"/g, '&quot;');
                    let alignCls = '';
                    if(k === 'Mã SP') alignCls = 'col-id';
                    if(String(k).toLowerCase().includes('tiền') || String(k).toLowerCase().includes('giá') || String(k).toLowerCase().includes('gốc')) alignCls += ' text-right';

                    if(k === categoryCol) { html += `<td class="cat-cell-inline ${alignCls.trim()}" title="${titleVal}" onclick="openInlineCatMenu(event, '${p['Mã SP']}')">${renderCategoryBadges(val)}</td>`; } 
                    else {
                        let isDangDat = String(k).toLowerCase().includes('đang đặt');
                        let isEditable = (!['Mã SP', 'Link ảnh'].includes(k) && !isDangDat) ? `contenteditable="true" class="editable-cell" onblur="saveInlineEdit(this, '${p['Mã SP']}', '${k}')"` : '';
                        if (k === keyLe && curPct > 0) {
                            val = `<strike style="color:#9ca3af;font-size:11px;">${formatMoney(p[keyLe])}</strike><br/><span style="color:#ef4444;font-weight:bold;">${formatMoney(p[keyGiaKm])}</span>`;
                            titleVal = `Giá gốc: ${formatMoney(p[keyLe])} | Đã giảm: ${formatMoney(p[keyGiaKm])}`;
                        } else if(String(k).toLowerCase().includes('tiền') || String(k).toLowerCase().includes('giá') || String(k).toLowerCase().includes('gốc')) { 
                            val = formatMoney(val); titleVal = val;
                        }
                        if(k === 'Mã SP' && isOutOfStock) { val = `<span class="out-of-stock-id">${p[k]}</span>`; }
                        if(isDangDat) { val = `<span style="color:#f59e0b;font-weight:bold;" title="Tự động đồng bộ với đơn hàng">${val}</span>`; }
                        html += `<td class="${alignCls.trim()}" ${isEditable} title="${titleVal}">${val}</td>`;
                    }
                 });
                 html += `<td class="text-center" style="width:100px;"><input type="number" class="inline-km-inp" value="${curPct}" placeholder="%" onkeypress="calcInlineKm(event, this, '${p['Mã SP']}')" title="Gõ % và nhấn Enter để lưu"/></td>`;
                 html += `<td class="col-action actions"><button class="action-btn gray" style="padding:4px; border-radius:4px;" onclick="openEditProduct('${p['Mã SP']}')">✏️</button><button class="action-btn red" style="padding:4px; border-radius:4px; margin-left:4px;" onclick="deleteProductItem('${p['Mã SP']}')">🗑️</button></td></tr>`;
              } else {
                 html += `<div class="card" id="item_${p['Mã SP']}"><input type="checkbox" class="chk-box" style="position:absolute;top:15px;right:15px;z-index:10;" value="${p['Mã SP']}" onchange="checkBulk()"/>`;
                 if(p['Link ảnh']) html += `<img class="card-img-top" src="${p['Link ảnh']}" onclick="openImageModal(this.src)"/>`;
                 html += `<div class="btn-edit-tiny" onclick="openEditProduct('${p['Mã SP']}')">✏️</div>`; 
                 html += `<div class="card-header" style="margin-top:5px;"><span style="font-weight:bold; ${isOutOfStock ? 'color:#ef4444;' : ''}" title="${String(p['Tên SP']).replace(/"/g, '&quot;')}">${p['Tên SP']}</span> <span style="${isOutOfStock ? 'color:#ef4444;font-weight:bold;' : 'opacity:0.7;font-weight:normal;'}; margin-right:20px;">#${p['Mã SP']}</span></div>`;
                 vis.forEach(k => {
                    if(!['Link ảnh','Tên SP','Mã SP'].includes(k)) {
                       let v = p[k] || ''; let titleVal = String(v).replace(/"/g, '&quot;');
                       if (k === keyLe && curPct > 0) { v = `<strike style="color:#9ca3af;font-size:11px;">${formatMoney(p[keyLe])}</strike> <span style="color:#ef4444;font-weight:bold;">${formatMoney(p[keyGiaKm])}</span>`; } 
                       else if(String(k).toLowerCase().includes('tiền') || String(k).toLowerCase().includes('giá') || String(k).toLowerCase().includes('gốc')) { v = `<span class="price-text">${formatMoney(p[k])}</span>`; titleVal = formatMoney(p[k]); } 
                       else if(k === categoryCol) { v = renderCategoryBadges(v); }
                       html += `<div class="card-row"><span class="lbl">${k}:</span> <span class="val" title="${titleVal}">${v}</span></div>`;
                    }
                 });
                 html += `<div class="card-row"><span class="lbl">% Khuyến Mãi:</span> <span class="val"><input type="number" class="inline-km-inp" value="${curPct}" placeholder="%" onkeypress="calcInlineKm(event, this, '${p['Mã SP']}')" title="Nhập và Enter"/></span></div></div>`;
              }
          } catch(ex) { console.error(ex); }
        });
        if(viewMode === 'table') html += `</tbody></table></div>`; else html += `</div>`;
        if(filtered.length > limitProd) html += `<div style="text-align:center; padding:15px; clear:both;"><button class="action-btn blue" onclick="loadMore('prod')" style="padding:10px 20px;">⬇️ Xem thêm dữ liệu</button></div>`;
        if(pl) pl.innerHTML = html;
        if(viewMode === 'table' && typeof initResizableColumns === 'function') initResizableColumns();
    } catch(err) { console.error(err); }
}

async function checkDuplicatesFromSheet() {
    let btn = document.getElementById('btnCheckDup');
    if(btn) { btn.dataset.oldText = btn.innerText; btn.innerText = 'Đang đồng bộ...'; }
    await syncData(true, true); 
    if(btn) btn.innerText = btn.dataset.oldText;

    let counts = {};
    ALL_PRODUCTS.forEach(p => { 
        let id = String(p['Mã SP']).trim().toUpperCase(); 
        if(!id || id.includes('_DELETED_')) return;
        if(!counts[id]) counts[id] = [];
        counts[id].push(p);
    });
    
    let dups = Object.keys(counts).filter(k => counts[k].length > 1);
    if(dups.length === 0) return alert("Hệ thống không phát hiện mã sản phẩm nào bị trùng lặp.");

    let html = '';
    dups.forEach(dupId => {
        let items = counts[dupId];
        html += `<div class="dup-group" data-id="${dupId}">
            <b style="color:#38bdf8; font-size:15px;">Mã: ${dupId}</b> <span style="color:#ef4444; font-size:12px;">(Bị trùng ${items.length} lần)</span><br/>
            <div class="dup-group-list">
            ${items.map(i => `<div style="font-size:13px; margin-bottom:5px; color:inherit;">- <b>${i['Tên SP']}</b> (Tồn: ${i['Tồn kho']||0})</div>`).join('')}
            </div>
            <div style="display:flex; gap:15px; margin-top:10px; font-size:13px; color:inherit;">
               <label style="cursor:pointer;"><input type="radio" name="dup_${dupId}" value="merge" checked> Gộp cộng dồn & Xóa mã thừa</label>
               <label style="cursor:pointer;"><input type="radio" name="dup_${dupId}" value="rename"> Giữ nguyên & Tạo mã mới</label>
            </div>
        </div>`;
    });

    html += `<button class="action-btn blue" onclick="processAllDuplicates()" style="width:100%; padding:12px; font-size:15px; margin-top:10px;">💾 XỬ LÝ HÀNG LOẠT VÀ ĐỒNG BỘ</button>`;

    let dBody = document.getElementById('dupModalBody'); if(dBody) dBody.innerHTML = html;
    let dMod = document.getElementById('dupModal'); if(dMod) dMod.style.display = 'flex';
}

function processAllDuplicates() {
    let dupGroups = document.querySelectorAll('.dup-group'); if(dupGroups.length === 0) return; let hasChanges = false;
    dupGroups.forEach(group => {
        let dupId = group.getAttribute('data-id'); let radioOption = group.querySelector(`input[name="dup_${dupId}"]:checked`); if(!radioOption) return;
        let action = radioOption.value; let items = ALL_PRODUCTS.filter(p => String(p['Mã SP']).trim().toUpperCase() === dupId); if(items.length < 2) return;
        hasChanges = true;
        if(action === 'merge') {
            let mainItem = items[0]; let keyTonKho = getKeyByKeyword(mainItem, 'tồn kho') || 'Tồn kho';
            let totalStock = items.reduce((sum, item) => sum + (Number(item[keyTonKho]) || 0), 0); mainItem[keyTonKho] = totalStock;
            let others = items.slice(1); ALL_PRODUCTS = ALL_PRODUCTS.filter(p => !others.includes(p)); addQueueItem('updateProduct', mainItem);
            others.forEach(o => { addQueueItem('deleteProduct', { "Mã SP": o['Mã SP'] }); });
        } else if (action === 'rename') {
            items.forEach((item, index) => { if(index > 0) { let oldId = item['Mã SP']; let newId = oldId + '_' + index; addQueueItem('deleteProduct', { "Mã SP": oldId }); item['Mã SP'] = newId; addQueueItem('updateProduct', item); } });
        }
    });

    if(hasChanges) { localStorage.setItem('ALL_PRODUCTS', JSON.stringify(ALL_PRODUCTS)); closeModal('dupModal'); renderProductsData(); alert("Đã gom các thay đổi! Hệ thống đang xử lý và đẩy lên Google Sheet..."); pushSyncQueue(); }
}

function deleteProductItem(id) { let p = ALL_PRODUCTS.find(x => x['Mã SP'] == id); if(!p) return; if(!confirm(`⚠️ Bạn có chắc chắn muốn xóa vĩnh viễn sản phẩm:\n[${id}] - ${p['Tên SP']}?`)) return; ALL_PRODUCTS = ALL_PRODUCTS.filter(x => x['Mã SP'] !== id); localStorage.setItem('ALL_PRODUCTS', JSON.stringify(ALL_PRODUCTS)); addQueueItem('deleteProduct', { "Mã SP": id }); renderProductsData(); }
function deleteSelectedProducts() { let checkedBoxes = document.querySelectorAll('.chk-box:checked'); if(checkedBoxes.length === 0) return alert("Vui lòng chọn ít nhất 1 sản phẩm để xóa!"); if(!confirm(`🛑 CẢNH BÁO: Bạn đang chọn xóa ${checkedBoxes.length} sản phẩm cùng lúc.\nHành động này KHÔNG THỂ HOÀN TÁC!\n\nBạn có chắc chắn muốn tiếp tục?`)) return; let idsToDelete = Array.from(checkedBoxes).map(cb => cb.value); idsToDelete.forEach(id => { addQueueItem('deleteProduct', { "Mã SP": id }); }); ALL_PRODUCTS = ALL_PRODUCTS.filter(p => !idsToDelete.includes(p['Mã SP'])); localStorage.setItem('ALL_PRODUCTS', JSON.stringify(ALL_PRODUCTS)); document.querySelectorAll('.chk-box').forEach(c => c.checked = false); checkBulk(); renderProductsData(); }
function toggleAllChecks(el) { document.querySelectorAll('.chk-box').forEach(c => c.checked = el.checked); checkBulk(); }
function checkBulk() { let cnt = document.querySelectorAll('.chk-box:checked').length; let bar = document.getElementById('bulkEditBar'); if(bar) { bar.style.display = cnt > 0 ? 'flex' : 'none'; let sc = document.getElementById('selCount'); if(sc) sc.innerText = cnt; } }
function applyBulkEdit() { let updates = {}; document.querySelectorAll('.bulk-inp').forEach(inp => { if(inp.value.trim() !== '') updates[inp.dataset.key] = inp.value.trim(); }); if(Object.keys(updates).length === 0) return alert("Vui lòng điền ít nhất 1 ô để sửa hàng loạt!"); document.querySelectorAll('.chk-box:checked').forEach(c => { let p = ALL_PRODUCTS.find(x => x['Mã SP'] == c.value); if(p) { for(let k in updates) { p[k] = updates[k]; } addQueueItem('updateProduct', p); } }); localStorage.setItem('ALL_PRODUCTS', JSON.stringify(ALL_PRODUCTS)); document.querySelectorAll('.chk-box').forEach(c => c.checked = false); checkBulk(); document.querySelectorAll('.bulk-inp').forEach(inp => inp.value = ''); renderProductsData(); }
function openAddProductModal() { document.getElementById('apId').value = ''; document.getElementById('apName').value = ''; document.getElementById('apStock').value = 0; document.getElementById('apCat').value = ''; document.getElementById('apCost').value = 0; document.getElementById('apRetail').value = 0; document.getElementById('apWholesale').value = 0; document.getElementById('addSpModal').style.display = 'flex'; }

function saveNewProduct() {
    let newId = document.getElementById('apId').value.trim().toUpperCase(); let newName = document.getElementById('apName').value.trim();
    let newStock = Number(document.getElementById('apStock').value) || 0; let apCat = document.getElementById('apCat').value.trim();
    let apCost = Number(document.getElementById('apCost').value) || 0; let apRetail = Number(document.getElementById('apRetail').value) || 0;
    let apWholesale = Number(document.getElementById('apWholesale').value) || 0;

    if(!newId || !newName) return alert("Vui lòng điền Mã SP và Tên SP!");

    let existing = ALL_PRODUCTS.find(p => String(p['Mã SP']).trim().toUpperCase() === newId);
    if(existing) {
         let conf = confirm(`⚠️ CẢNH BÁO: Mã hàng [${newId}] đã tồn tại với tên: ${existing['Tên SP']}\n\nBạn có muốn CỘNG THÊM ${newStock} vào tồn kho thay vì tạo mới không?`);
         if(conf) { let keyTonKho = getKeyByKeyword(existing, 'tồn kho') || 'Tồn kho'; existing[keyTonKho] = (Number(existing[keyTonKho]) || 0) + newStock; addQueueItem('updateProduct', existing); } else { newId = newId + "_" + Date.now().toString().slice(-4); let newP = { "Mã SP": newId, "Tên SP": newName, "Loại - N": apCat, "Tồn kho": newStock, "Đang đặt": 0, "Sỉ từ": "", "Giá bán sỉ": apWholesale, "Giá bán lẻ": apRetail, "Giá gốc": apCost, "% Khuyến mãi": 0, "Giá khuyến mãi": 0 }; ALL_PRODUCTS.unshift(newP); addQueueItem('updateProduct', newP); }
    } else {
        let newP = { "Mã SP": newId, "Tên SP": newName, "Loại - N": apCat, "Tồn kho": newStock, "Đang đặt": 0, "Sỉ từ": "", "Giá bán sỉ": apWholesale, "Giá bán lẻ": apRetail, "Giá gốc": apCost, "% Khuyến mãi": 0, "Giá khuyến mãi": 0 }; ALL_PRODUCTS.unshift(newP); addQueueItem('updateProduct', newP); 
    }
    localStorage.setItem('ALL_PRODUCTS', JSON.stringify(ALL_PRODUCTS)); initCategories(); renderProductsData(true); closeModal('addSpModal');
}

function openEditProduct(id) {
    let p = ALL_PRODUCTS.find(x => x['Mã SP'] == id); if(!p) return; editingProductId = id;
    let eL = document.getElementById('smartLoiNhuan'); if(eL) eL.value = ''; let eK = document.getElementById('smartKM'); if(eK) eK.value = ''; 
    let keyPctKm = getKeyByKeyword(p, '% khuyến mãi') || '% Khuyến mãi'; let keyGiaKm = getKeyByKeyword(p, 'giá khuyến mãi') || 'Giá khuyến mãi'; let html = '';
    Object.keys(p).forEach(k => {
       if(k === 'Mã SP') { html += `<div><label style="font-size:12px;opacity:0.7;">${k}</label><input disabled class="form-inp" style="margin-top:2px;" value="${p[k]}"/></div>`; } 
       else if (String(k).toLowerCase() === String(keyPctKm).toLowerCase() || String(k).toLowerCase() === String(keyGiaKm).toLowerCase()) {} 
       else if (k === categoryCol) {
          let selected = String(p[k] || '').split(',').map(s=>s.trim());
          html += `<div class="form-grid-full"><label style="display:block; font-size:12px;opacity:0.7; margin-bottom:5px;">${k} (Chọn nhiều)</label><div style="display:grid; grid-template-columns: 1fr 1fr; gap:5px; margin-bottom:5px; padding:8px; border-radius:8px; border:1px solid #444; max-height:120px; overflow-y:auto;">`;
          ALL_CATEGORIES.forEach(c => { let chk = selected.includes(c) ? 'checked' : ''; html += `<label style="font-size:13px; display:flex; align-items:center; gap:5px; margin:0;"><input type="checkbox" class="edit-cat-chk" value="${c}" ${chk}/> ${c}</label>`; });
          html += `</div><input type="text" id="edit_new_cat" class="form-inp" style="margin-top:0;" placeholder="+ Nhập nhóm mới (cách bằng dấu phẩy)"/></div>`;
       } 
       else if (String(k).toLowerCase().includes('đang đặt')) { html += `<div><label style="font-size:12px;color:#f59e0b;font-weight:bold;">🔒 ${k}</label><input disabled class="form-inp" style="margin-top:2px;background:#fef3c7;color:#333;" value="${p[k]||0}" title="Tự động tính từ đơn hàng Chờ xử lý"/></div>`; }
       else { html += `<div><label style="font-size:12px;opacity:0.7;">${k}</label><input id="edit_${String(k).replace(/\s/g,'_')}" class="form-inp" style="margin-top:2px;" value="${p[k]||''}"/></div>`; }
    });
    html += `<div class="form-grid-full" style="padding:10px; border-radius:8px; border:1px dashed #10b981; display:flex; align-items:center; gap:15px; margin-top:5px;"><div style="flex:1;"><label style="font-size:12px;color:#10b981;font-weight:bold;">% Khuyến Mãi</label><input type="number" id="edit_pct_km_real" class="form-inp" style="margin-top:4px;" value="${p[keyPctKm]||''}" oninput="calcKmPriceInside()" placeholder="% (vd: 10)"/></div><div style="flex:1;"><label style="font-size:12px;color:#10b981;font-weight:bold;">Giá Đang Sale</label><br/><span id="display_km_price" style="color:#ef4444; font-size:18px; font-weight:bold; display:inline-block; margin-top:8px;">${formatMoney(p[keyGiaKm]||0)}</span></div></div>`;
    let pb = document.getElementById('productModalBody'); if(pb) pb.innerHTML = html; let pm = document.getElementById('productModal'); if(pm) pm.style.display = 'flex';
}

function saveEditProduct() {
   let p = ALL_PRODUCTS.find(x => x['Mã SP'] == editingProductId); if(!p) return;
   let keyPctKm = getKeyByKeyword(p, '% khuyến mãi') || '% Khuyến mãi'; let keyGiaKm = getKeyByKeyword(p, 'giá khuyến mãi') || 'Giá khuyến mãi';
   Object.keys(p).forEach(k => { 
       if(k !== 'Mã SP' && !String(k).toLowerCase().includes('đang đặt')) { 
           if (k === categoryCol) {
               let checked = Array.from(document.querySelectorAll('.edit-cat-chk:checked')).map(el => el.value);
               let eCat = document.getElementById('edit_new_cat'); let newCats = eCat ? String(eCat.value).split(',').map(s=>s.trim()).filter(s=>s) : []; p[k] = [...new Set([...checked, ...newCats])].join(', ');
           } else if(String(k).toLowerCase() !== String(keyPctKm).toLowerCase() && String(k).toLowerCase() !== String(keyGiaKm).toLowerCase()) { let inputEl = document.getElementById('edit_'+String(k).replace(/\s/g,'_')); if(inputEl) p[k] = inputEl.value; }
       }
   });
   let eKm = document.getElementById('edit_pct_km_real'); if(eKm) p[keyPctKm] = eKm.value; 
   let eGk = document.getElementById('display_km_price'); if(eGk) p[keyGiaKm] = Number(String(eGk.innerText).replace(/[^0-9]/g,""));
   localStorage.setItem('ALL_PRODUCTS', JSON.stringify(ALL_PRODUCTS)); addQueueItem('updateProduct', p); initCategories(); closeModal('productModal');
}

function calcInlineKm(e, el, id) {
    if(e.key === 'Enter') { e.preventDefault(); let p = ALL_PRODUCTS.find(x => x['Mã SP'] == id); if(!p) return; let pct = Number(el.value); let keyLe = getKeyByKeyword(p, 'lẻ') || getKeyByKeyword(p, 'bán'); let keyPctKm = getKeyByKeyword(p, '% khuyến mãi') || '% Khuyến mãi'; let keyGiaKm = getKeyByKeyword(p, 'giá khuyến mãi') || 'Giá khuyến mãi'; if(keyLe) { let giaLe = Number(String(p[keyLe]||0).replace(/[^0-9]/g, "")); let giaMoi = giaLe; if(pct > 0) { giaMoi = smartRound(giaLe * (1 - pct/100)); p[keyPctKm] = pct; p[keyGiaKm] = giaMoi; } else { p[keyPctKm] = ''; p[keyGiaKm] = giaLe; } localStorage.setItem('ALL_PRODUCTS', JSON.stringify(ALL_PRODUCTS)); addQueueItem('updateProduct', p); el.style.background = '#d1fae5'; setTimeout(() => el.style.background = '', 500); renderProductsData(); } }
}

function calcKmPriceInside() { let p = ALL_PRODUCTS.find(x => x['Mã SP'] == editingProductId); if(!p) return; let elLe = document.getElementById('edit_' + String(getKeyByKeyword(p, 'lẻ') || getKeyByKeyword(p, 'bán')).replace(/\s/g,'_')); let giaLe = elLe ? (Number(String(elLe.value).replace(/[^0-9]/g,"")) || 0) : 0; let pctEl = document.getElementById('edit_pct_km_real'); let pct = pctEl ? Number(pctEl.value) : 0; let giaKM = giaLe; if(pct > 0) giaKM = smartRound(giaLe * (1 - pct/100)); let dk = document.getElementById('display_km_price'); if(dk) dk.innerText = formatMoney(giaKM); }

function autoCalcRealtimePrice() { let p = ALL_PRODUCTS.find(x => x['Mã SP'] == editingProductId); if(!p) return; let getEl = (kw) => { let k = getKeyByKeyword(p, kw); return k ? document.getElementById('edit_' + String(k).replace(/\s/g,'_')) : null; }; let elGoc = getEl('gốc') || getEl('nhập'); let elLe = getEl('lẻ') || getEl('bán'); if(!elGoc || !elLe) return; let giaGoc = Number(String(elGoc.value).replace(/[^0-9]/g, "")) || 0; let elL = document.getElementById('smartLoiNhuan'); let pctLoi = elL ? Number(elL.value) : 0; let elK = document.getElementById('smartKM'); let pctGiam = elK ? Number(elK.value) : 0; let giaLe = giaGoc; if(pctLoi > 0) { giaLe = smartRound(giaGoc * (1 + pctLoi/100)); elLe.value = giaLe; } if(pctGiam > 0) { let eKm = document.getElementById('edit_pct_km_real'); if(eKm) { eKm.value = pctGiam; calcKmPriceInside(); } } }

function openInlineCatMenu(e, id) {
    e.stopPropagation(); inlineEditCatId = id; let p = ALL_PRODUCTS.find(x => x['Mã SP'] == id); if(!p) return;
    let selected = String(p[categoryCol] || '').split(',').map(s=>s.trim());
    let html = `<div style="padding:10px; font-weight:bold; border-bottom:1px solid #ccc; display:flex; justify-content:space-between; align-items:center;"><span>🏷️ Chọn Phân Loại:</span><button onclick="closeInlineCatMenu()" style="border:none;background:none;color:#ef4444;font-weight:bold;cursor:pointer;font-size:16px;">&times;</button></div>`;
    html += `<div style="max-height:200px; overflow-y:auto; padding:5px 0;">`;
    if(ALL_CATEGORIES.length === 0) html += `<div style="padding:10px; opacity:0.6; text-align:center; font-size:12px;">Chưa có phân loại nào trong kho.</div>`;
    ALL_CATEGORIES.forEach(c => { 
        let chk = selected.includes(c) ? 'checked' : ''; 
        html += `<label style="display:flex; align-items:center; padding:8px 15px; cursor:pointer; transition:0.2s; margin:0;"><input type="checkbox" class="inline-cat-chk" value="${c}" onchange="saveInlineCatMenu()" style="margin-right:8px; width:16px; height:16px; accent-color:#0070f4;" ${chk}/> <span style="font-size:13px;">${c}</span></label>`; 
    });
    html += `</div>`;
    html += `<div style="padding:10px; border-top:1px solid #eee; display:flex; gap:5px;"><input id="inlineNewCatInput" class="form-inp" style="margin:0; flex:1;" placeholder="Tạo phân loại mới..."><button class="action-btn green" onclick="addInlineNewCat()">+</button></div>`;
    html += `<div style="padding:10px; text-align:center; border-top:1px solid #ccc;"><button class="action-btn blue" onclick="closeInlineCatMenu()" style="width:100%; padding:8px;">XONG</button></div>`;
    let menu = document.getElementById('inlineCatMenu'); if(!menu) return;
    menu.innerHTML = html; menu.style.display = 'block';
    let rect = e.target.getBoundingClientRect(); let topPos = rect.bottom + 5;
    if(topPos + 250 > window.innerHeight) topPos = rect.top - 250; 
    menu.style.top = topPos + 'px'; menu.style.left = Math.max(10, rect.left - 50) + 'px';
}

function addInlineNewCat() {
    let inp = document.getElementById('inlineNewCatInput'); if(!inp) return;
    let newVal = inp.value.trim(); if(!newVal) return;
    if(!ALL_CATEGORIES.includes(newVal)) ALL_CATEGORIES.push(newVal);
    let p = ALL_PRODUCTS.find(x => x['Mã SP'] == inlineEditCatId);
    if(p) { let currentCats = String(p[categoryCol] || '').split(',').map(s=>s.trim()).filter(s=>s); if(!currentCats.includes(newVal)) currentCats.push(newVal); p[categoryCol] = currentCats.join(', '); localStorage.setItem('ALL_PRODUCTS', JSON.stringify(ALL_PRODUCTS)); addQueueItem('updateProduct', p); }
    initCategories(); renderProductsData(); openInlineCatMenu({stopPropagation:()=>{}, target: document.getElementById('inlineCatMenu')}, inlineEditCatId);
}

function saveInlineCatMenu() {
    if(!inlineEditCatId) return; let p = ALL_PRODUCTS.find(x => x['Mã SP'] == inlineEditCatId); if(!p) return;
    let checked = Array.from(document.querySelectorAll('.inline-cat-chk:checked')).map(el => el.value);
    p[categoryCol] = checked.join(', '); localStorage.setItem('ALL_PRODUCTS', JSON.stringify(ALL_PRODUCTS)); addQueueItem('updateProduct', p); renderProductsData();
}
function closeInlineCatMenu() { let m = document.getElementById('inlineCatMenu'); if(m) m.style.display = 'none'; inlineEditCatId = null; }
function saveInlineEdit(el, id, key) { let p = ALL_PRODUCTS.find(x => x['Mã SP'] == id); if(!p) return; let newVal = String(el.innerText).trim(); if(String(key).toLowerCase().includes('giá') || String(key).toLowerCase().includes('tiền')) newVal = newVal.replace(/[^0-9]/g, ""); if(p[key] != newVal) { p[key] = newVal; localStorage.setItem('ALL_PRODUCTS', JSON.stringify(ALL_PRODUCTS)); addQueueItem('updateProduct', p); if(String(key).toLowerCase().includes('giá')) el.innerText = formatMoney(newVal); } }

function buildSettingsMenu() {
    try {
        if(ALL_PRODUCTS && ALL_PRODUCTS.length > 0) { 
            let exclude = ['link ảnh', 'chi tiết json', '% khuyến mãi', 'giá khuyến mãi', '% km', 'giá km']; 
            let keysP = Object.keys(ALL_PRODUCTS[0] || {}).filter(k => !exclude.some(ex => String(k).toLowerCase().includes(ex))); 
            let htmlP = '<div style="padding:10px; font-weight:bold; border-bottom:1px solid #eee;">Cột hiển thị:</div>'; 
            htmlP += keysP.map(k => `<label><input type="checkbox" onchange="toggleCol('products', '${String(k).replace(/'/g, "\\'")}')" ${!hiddenColsProducts[k]?'checked':''}/> <span style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${k}</span></label>`).join(''); 
            let elP = document.getElementById('colMenuProducts'); if(elP) elP.innerHTML = htmlP; 
        }
        if(ALL_ORDERS && ALL_ORDERS.length > 0) { 
            let exclude = ['chi tiết json']; 
            let keysO = Object.keys(ALL_ORDERS[0] || {}).filter(k => !exclude.some(ex => String(k).toLowerCase().includes(ex))); 
            let htmlO = '<div style="padding:10px; font-weight:bold; border-bottom:1px solid #eee;">Cột hiển thị:</div>'; 
            htmlO += keysO.map(k => `<label><input type="checkbox" onchange="toggleCol('orders', '${String(k).replace(/'/g, "\\'")}')" ${!hiddenColsOrders[k]?'checked':''}/> <span style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${k}</span></label>`).join(''); 
            let elO = document.getElementById('colMenuOrders'); if(elO) elO.innerHTML = htmlO; 
        }
    } catch(e) { console.error("Lỗi tạo menu hiển thị cột:", e); }
}

function toggleCol(type, key) { 
    if(type === 'products') { 
        hiddenColsProducts[key] = !hiddenColsProducts[key]; 
        localStorage.setItem('hiddenColsProducts', JSON.stringify(hiddenColsProducts)); 
        renderProductsData(); 
    } else { 
        hiddenColsOrders[key] = !hiddenColsOrders[key]; 
        localStorage.setItem('hiddenColsOrders', JSON.stringify(hiddenColsOrders)); 
        renderOrdersData(); 
    } 
}

function buildBulkEditMenu() { if(ALL_PRODUCTS.length > 0) { let exclude = ['mã sp', 'link ảnh', 'đang đặt', 'khuyến mãi', '% km', 'giá km']; let keys = Object.keys(ALL_PRODUCTS[0]).filter(k => { let lowK = String(k).toLowerCase(); return !exclude.some(ex => lowK.includes(ex)); }); let html = keys.map(k => `<div><label style="font-size:11px;opacity:0.7;font-weight:bold;">${k}</label><br/><input type="text" class="form-inp bulk-inp" data-key="${k}" placeholder="Giữ nguyên..." style="padding:6px; margin-top:2px; font-size:12px;"/></div>`).join(''); let formGrid = document.getElementById('bulkFormGrid'); if(formGrid) formGrid.innerHTML = html; } }

function initResizableColumns() { const tables = document.querySelectorAll('table'); tables.forEach(table => { const cols = table.querySelectorAll('th'); cols.forEach(col => { if (col.querySelector('.resizer') || col.classList.contains('col-check')) return; const resizer = document.createElement('div'); resizer.classList.add('resizer'); col.appendChild(resizer); createResizableColumn(col, resizer); }); }); }
function createResizableColumn(col, resizer) { let x = 0, w = 0; const mouseDownHandler = function(e) { x = e.clientX; const styles = window.getComputedStyle(col); w = parseInt(styles.width, 10); document.addEventListener('mousemove', mouseMoveHandler); document.addEventListener('mouseup', mouseUpHandler); resizer.classList.add('resizing'); }; const mouseMoveHandler = function(e) { const dx = e.clientX - x; col.style.width = `${w + dx}px`; }; const mouseUpHandler = function() { document.removeEventListener('mousemove', mouseMoveHandler); document.removeEventListener('mouseup', mouseUpHandler); resizer.classList.remove('resizing'); }; resizer.addEventListener('mousedown', mouseDownHandler); }
