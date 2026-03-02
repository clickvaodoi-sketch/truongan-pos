let isOrderProcessing = false;

function toggleAllOrderChecks(el) { document.querySelectorAll('.chk-order-box').forEach(c => c.checked = el.checked); }

function renderOrdersData(resetLimit = false) {
    try {
        if(resetLimit) limitOrd = 50;
        let sEl = document.getElementById("searchOrders"); let s = sEl ? String(sEl.value).toLowerCase().trim() : '';
        let sfEl = document.getElementById("orderStatusFilter"); let statusFilter = sfEl ? sfEl.value : "ALL";
        
        let filtered = ALL_ORDERS.filter(o => {
            let matchSearch = true;
            if(s) {
                let name = String(o['Tên Khách Hàng'] || '').toLowerCase(); 
                let phone = cleanPhone(o['SDT']); let orderId = String(o['Mã Đơn'] || '').toLowerCase();
                matchSearch = name.includes(s) || phone.includes(s) || orderId.includes(s);
            }
            let matchStatus = true;
            if(statusFilter !== "ALL") matchStatus = String(o['Trạng Thái']).trim() === statusFilter;
            return matchSearch && matchStatus;
        });

        filtered.sort((a, b) => { return parseDateString(b['Thời Gian']).getTime() - parseDateString(a['Thời Gian']).getTime(); });
        let countEl = document.getElementById('orderCountDisplay'); if (countEl) countEl.innerText = filtered.length;
        
        let sliced = filtered.slice(0, limitOrd);
        let keys = Object.keys(ALL_ORDERS[0] || {}); let vis = keys.filter(k => !hiddenColsOrders[k]);
        let essentialCols = ['Mã Đơn', 'Tên Khách Hàng', 'SDT', 'Tổng Tiền', 'Thành Tiền Sau Chiết Khấu'];
        
        let html = viewMode === 'table' ? `<div class="table-responsive"><table><thead><tr><th class="col-check"><input type="checkbox" onclick="toggleAllOrderChecks(this)"/></th>` : `<div class="data-grid">`;
        if(viewMode === 'table') {
            vis.forEach(k => { 
                let cCls = essentialCols.includes(k) ? '' : 'hide-on-mobile';
                if(k==='Mã Đơn') cCls += ' col-id'; if(k==='SDT') cCls += ' col-phone';
                if(k==='Tổng Tiền' || k==='Khách Thanh Toán' || k==='Thành Tiền Sau Chiết Khấu' || k==='Còn Nợ') cCls += ' col-money text-right';
                if(k!=='Chi Tiết JSON') html += `<th class="${cCls.trim()}" title="${k}">${k}</th>`; 
            });
            html += `<th class="col-action text-center">Tác vụ</th></tr></thead><tbody>`;
        }

        sliced.forEach(o => {
          try {
              let status = String(o['Trạng Thái']).trim(); let isDelivered = status === 'Đã giao' || status === 'Đã hoàn trả';
              let isDraft = status === 'Nháp'; let btnText = status === 'Đã hoàn trả' ? '↩️' : (isDelivered ? '✔️' : (isDraft ? '💾' : '🚚'));
              let btnColor = status === 'Đã hoàn trả' ? 'red' : (isDelivered ? 'gray' : (isDraft ? 'orange' : 'green'));
              let lockAttr = isDelivered ? 'disabled title="Đơn đã xử lý xong không thể sửa/xóa"' : '';
              let sdtTrim = cleanPhone(o['SDT']); let isVIP = (sdtTrim.length >= 8 && vipPhones.has(sdtTrim));
              let vipBadge = isVIP ? `<span class="vip-badge">🌟 VIP</span>` : ''; let maDon = String(o['Mã Đơn']||'').replace(/'/g, "\\'");

              let finalTotalVal = Number(String(o['Thành Tiền Sau Chiết Khấu']||o['Tổng Tiền']||0).replace(/[^0-9\-]/g,""));

              if(viewMode === 'table') {
                 html += `<tr><td class="col-check"><input type="checkbox" class="chk-order-box" value="${maDon}"/></td>`;
                 vis.forEach(k => {
                    if(k !== 'Chi Tiết JSON') {
                       let isMoney = (String(k).toLowerCase().includes('tiền') || String(k).toLowerCase().includes('thanh toán') || String(k).toLowerCase().includes('nợ'));
                       let val = isMoney ? `<b class="price-text">${formatMoney(o[k])}</b>` : (o[k] || '');
                       let titleVal = String(val).replace(/(<([^>]+)>)/gi, ""); 
                       
                       if(k === 'Mã Đơn') { val = `<span onclick="openOrderModal('${maDon}')" style="color:#3b82f6; font-weight:bold; cursor:pointer; text-decoration:underline;">${o['Mã Đơn']}</span>`; }
                       else if(k === 'Tên Khách Hàng') { val = `<span onclick="openOrderModal('${maDon}')" style="color:#3b82f6; font-weight:bold; cursor:pointer;">${o[k]||''}</span> ${vipBadge}`; }
                       else if(k === 'Chiết Khấu %') {
                           let valNum = Number(o[k] || 0);
                           if (valNum > 0) { let raw = Number(String(o['Tổng Tiền']||0).replace(/[^0-9\-]/g,"")); val = `<span class="price-text" title="Đã giảm: -${formatMoney(raw - finalTotalVal)}">-${valNum}%</span>`; } 
                           else { val = '0%'; } 
                       }
                       else if(k === 'Thành Tiền Sau Chiết Khấu') {
                           val = `<b class="price-text" style="color:#10b981;">${formatMoney(finalTotalVal)}</b>`;
                       }
                       
                       let cCls = essentialCols.includes(k) ? '' : 'hide-on-mobile';
                       if(k==='Mã Đơn') cCls += ' col-id'; if(k==='SDT') cCls += ' col-phone'; if(isMoney) cCls += ' col-money text-right';
                       html += `<td class="${cCls.trim()}" title="${titleVal}">${val}</td>`;
                    }
                 });
                 html += `<td class="col-action actions"><button class="action-btn gray" style="padding:6px; flex:1;" ${lockAttr} onclick="openEditOrderModal('${maDon}')">✏️</button><button class="action-btn gray" style="padding:6px; flex:1;" title="In" onclick="printOrder('${maDon}')">🖨️</button><button class="action-btn ${btnColor}" style="padding:6px; flex:1.5;" ${lockAttr} onclick="markDelivered('${maDon}')">${btnText}</button><button class="action-btn red" style="padding:6px; flex:1;" ${lockAttr} onclick="deleteOrder('${maDon}')">🗑️</button></td></tr>`;
              } else {
                 html += `<div class="card"><div class="card-header"><span onclick="openOrderModal('${maDon}')" style="color:#3b82f6; font-weight:bold; cursor:pointer; text-decoration:underline;">${o['Mã Đơn']}</span> <span style="color:${isDelivered?'#10b981':(isDraft?'#f59e0b':'#ef4444')}; font-size:12px; background:${isDelivered?'#d1fae5':(isDraft?'#fef3c7':'#fee2e2')}; padding:3px 10px; border-radius:15px;">${o['Trạng Thái']}</span></div>`;
                 vis.forEach(k => {
                    if(!['Mã Đơn', 'Trạng Thái', 'Chi Tiết JSON'].includes(k)) {
                       let isMoney = (String(k).toLowerCase().includes('tiền') || String(k).toLowerCase().includes('thanh toán') || String(k).toLowerCase().includes('nợ'));
                       let val = isMoney ? `<span class="price-text">${formatMoney(o[k])}</span>` : (o[k] || ''); let titleVal = String(o[k] || '').replace(/"/g, '&quot;');
                       
                       if(k === 'Chiết Khấu %') {
                           let valNum = Number(o[k] || 0);
                           if (valNum > 0) { let raw = Number(String(o['Tổng Tiền']||0).replace(/[^0-9\-]/g,"")); val = `<span class="price-text" title="Đã giảm: -${formatMoney(raw - finalTotalVal)}">-${valNum}%</span>`; } 
                           else { val = '0%'; }
                       }
                       else if(k === 'Thành Tiền Sau Chiết Khấu') {
                           val = `<span class="price-text" style="color:#10b981;">${formatMoney(finalTotalVal)}</span>`;
                       }
                       if(k === 'Tên Khách Hàng') { val = `<span onclick="openOrderModal('${maDon}')" style="color:#3b82f6; font-weight:bold; cursor:pointer;">${o[k]||''}</span> ${vipBadge}`; }
                       html += `<div class="card-row"><span class="lbl">${k}:</span> <span class="val" title="${titleVal}">${val}</span></div>`;
                    }
                 });
                 html += `<div class="btn-group" style="display:flex; gap:5px; margin-top:10px;"><button class="action-btn gray" style="flex:1;" ${lockAttr} onclick="openEditOrderModal('${maDon}')">✏️</button><button class="action-btn gray" style="flex:1;" onclick="printOrder('${maDon}')">🖨️</button><button class="action-btn ${btnColor}" style="flex:2;" ${lockAttr} onclick="markDelivered('${maDon}')">${btnText}</button><button class="action-btn red" style="flex:1;" ${lockAttr} onclick="deleteOrder('${maDon}')">🗑️</button></div></div>`;
              }
          } catch(ex) { console.error("Lỗi vẽ Đơn Hàng: ", ex); }
        });
        if(viewMode === 'table') html += `</tbody></table></div>`; else html += `</div>`;
        if(filtered.length > limitOrd) { html += `<div style="text-align:center; padding:15px; clear:both;"><button class="action-btn blue" onclick="loadMore('ord')" style="padding:10px 20px;">⬇️ Xem thêm dữ liệu</button></div>`; }
        let ol = document.getElementById("ordersList"); if(ol) ol.innerHTML = html;
        if(viewMode === 'table' && typeof initResizableColumns === 'function') initResizableColumns();
    } catch(err) { console.error("Lỗi Render Orders:", err); }
}

function markDelivered(id) { 
   if(isOrderProcessing) return; isOrderProcessing = true;
   let o = ALL_ORDERS.find(x => x['Mã Đơn'] === id); 
   if(o) { 
       o['Trạng Thái'] = 'Đã giao'; 
       if(o['Chi Tiết JSON']) {
           try {
               JSON.parse(String(o['Chi Tiết JSON'])).forEach(item => {
                   let p = ALL_PRODUCTS.find(x => x['Mã SP'] == item.maSP);
                   if(p) {
                       let keyTonKho = getKeyByKeyword(p, 'tồn kho') || 'Tồn kho'; let keyDangDat = getKeyByKeyword(p, 'đang đặt') || 'Đang đặt';
                       p[keyTonKho] = (Number(p[keyTonKho]) || 0) - Number(item.soLuong); p[keyDangDat] = (Number(p[keyDangDat]) || 0) - Number(item.soLuong);
                       if(p[keyDangDat] < 0) p[keyDangDat] = 0; addQueueItem('updateProduct', p); 
                   }
               });
               localStorage.setItem('ALL_PRODUCTS', JSON.stringify(ALL_PRODUCTS));
           } catch(e) {}
       }
       localStorage.setItem('ALL_ORDERS', JSON.stringify(ALL_ORDERS));
       addQueueItem('updateOrder', o); 
       if(currentPage === 'orders') renderOrdersData();
   } 
   setTimeout(() => { isOrderProcessing = false; }, 500);
}

function deleteOrder(id) {
    let o = ALL_ORDERS.find(x => x['Mã Đơn'] === id); if(!o) return;
    if(!confirm("Xóa vĩnh viễn đơn hàng #" + id + "?")) return;
    if(String(o['Trạng Thái']).trim() !== 'Đã giao' && String(o['Trạng Thái']).trim() !== 'Đã hoàn trả' && String(o['Trạng Thái']).trim() !== 'Nháp' && o['Chi Tiết JSON']) {
        try { JSON.parse(String(o['Chi Tiết JSON'])).forEach(item => { let p = ALL_PRODUCTS.find(x => x['Mã SP'] == item.maSP); if(p) { let keyDangDat = getKeyByKeyword(p, 'đang đặt') || 'Đang đặt'; p[keyDangDat] = (Number(p[keyDangDat]) || 0) - Number(item.soLuong); if(p[keyDangDat] < 0) p[keyDangDat] = 0; addQueueItem('updateProduct', p); } }); localStorage.setItem('ALL_PRODUCTS', JSON.stringify(ALL_PRODUCTS)); } catch(e){}
    }
    
    // Cập nhật lại nợ sau khi xóa đơn
    let debt = Number(o['Còn Nợ'] || 0); let cPhoneClean = cleanPhone(o['SDT']);
    if(debt > 0 && cPhoneClean) { 
        let cus = ALL_CUSTOMERS.find(c => cleanPhone(c['Điện thoại']) === cPhoneClean); 
        if(cus) { 
            let stats = calcCustomerStats(cPhoneClean);
            cus['Tổng Nợ Thực Tế'] = stats.currentDebt - debt; // Trừ nợ đi
            addQueueItem('updateCustomer', cus); localStorage.setItem('ALL_CUSTOMERS', JSON.stringify(ALL_CUSTOMERS)); 
        } 
    }
    ALL_ORDERS = ALL_ORDERS.filter(x => x['Mã Đơn'] !== id); localStorage.setItem('ALL_ORDERS', JSON.stringify(ALL_ORDERS)); addQueueItem('deleteOrder', { id: id });
    if(currentPage === 'orders') renderOrdersData();
}

function printOrder(id) {
    let o = ALL_ORDERS.find(x => x['Mã Đơn'] === id); if(!o) return;
    let finalTotal = Number(String(o['Thành Tiền Sau Chiết Khấu']||o['Tổng Tiền']||0).replace(/[^0-9\-]/g,"")); 
    let chietKhauPct = Number(o['Chiết Khấu %'] || 0); let tongTienHang = Number(String(o['Tổng Tiền']||0).replace(/[^0-9\-]/g,"")); let tienGiam = tongTienHang - finalTotal;
    let paid = Number(String(o['Khách Thanh Toán']||0).replace(/[^0-9\-]/g,"")); let debtThisOrder = finalTotal - paid;
    let cOldDebt = 0; let cPhoneClean = cleanPhone(o['SDT']);
    if(cPhoneClean) { let cus = ALL_CUSTOMERS.find(c => cleanPhone(c['Điện thoại']) === cPhoneClean); if(cus) { let totalDebtNow = getRealtimeCustomerDebt(cPhoneClean); cOldDebt = totalDebtNow - debtThisOrder; } }

    let printContent = `<div style="font-family: monospace; width: 100%; max-width: 300px; margin: 0 auto; color: #000;"><h2 style="text-align: center; margin-bottom: 5px;">TRƯỜNG AN STORE</h2><div style="text-align: center; font-size: 12px; border-bottom: 1px dashed #000; padding-bottom: 10px; margin-bottom: 10px;">HÓA ĐƠN BÁN HÀNG</div><div style="font-size: 13px; line-height: 1.5;"><b>Mã đơn:</b> #${o['Mã Đơn']}<br><b>Khách:</b> ${o['Tên Khách Hàng']}<br><b>SĐT:</b> ${o['SDT'] || ''}</div><div style="border-top: 1px dashed #000; margin-top: 10px; padding-top: 10px;"><b style="font-size: 13px;">SẢN PHẨM:</b><br>`;
    if(o['Chi Tiết JSON']) { try { JSON.parse(String(o['Chi Tiết JSON'])).forEach(i => { printContent += `<div style="display:flex; justify-content:space-between; font-size:13px; margin-top:8px; border-bottom:1px dotted #eee; padding-bottom:5px;"><div style="flex:1; padding-right:5px;"><div>[${i.maSP}] ${i.tenSP}</div><div style="font-size:11px; color:#555;">${formatMoney(i.giaBan)} x ${i.soLuong}</div></div><div style="font-weight:bold; align-self:flex-end;">${formatMoney(i.thanhTien)}</div></div>`; }); } catch(e) {} }

    printContent += `</div><div style="border-top: 1px dashed #000; margin-top: 10px; padding-top: 10px; text-align: right; font-size: 14px; line-height: 1.5;">`;
    if(chietKhauPct > 0) { printContent += `Tổng tiền hàng: ${formatMoney(tongTienHang)}<br>Chiết khấu (${chietKhauPct}%): <span style="font-weight:normal;">-${formatMoney(tienGiam)}</span><br>`; }
    printContent += `<b style="font-size:16px;">Thành tiền đơn này: ${formatMoney(finalTotal)}</b><br>`;
    if(cOldDebt > 0) printContent += `<span style="font-size:13px;">Nợ cũ: ${formatMoney(cOldDebt)}</span><br>`;
    printContent += `<b style="font-size:18px;">TỔNG PHẢI THU: ${formatMoney(finalTotal + cOldDebt)}</b><br>`;
    printContent += `<span style="font-size:13px;">Khách thanh toán: ${formatMoney(paid)}</span><br>`;
    printContent += `<span style="font-size:13px;">Còn nợ: ${formatMoney(finalTotal + cOldDebt - paid)}</span><br>`;
    printContent += `</div><div style="text-align: center; font-size: 12px; margin-top: 20px;">Cảm ơn quý khách!<br>Hẹn gặp lại.</div></div>`;
    let printWin = window.open('', '_blank', 'width=400,height=600'); if(printWin){ printWin.document.write('<html><body>' + printContent + '</body></html>'); printWin.document.close(); printWin.focus(); setTimeout(function() { printWin.print(); printWin.close(); }, 500); }
}

function openOrderModal(id) { 
    let o = ALL_ORDERS.find(x => x['Mã Đơn'] === id); if(!o) return;
    let sdtTrim = cleanPhone(o['SDT']); let isVIP = (sdtTrim.length >= 8 && vipPhones.has(sdtTrim));
    let statusColor = o['Trạng Thái'] === 'Đã giao' ? '#10b981' : (o['Trạng Thái'] === 'Nháp' ? '#f59e0b' : (o['Trạng Thái'] === 'Đã hoàn trả' ? '#ef4444' : '#3b82f6'));
    
    let html = `<div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:15px; border-bottom:1px solid #eee; padding-bottom:10px;"><div><h3 style="margin:0; color:#3b82f6;">${o['Mã Đơn']}</h3><span style="font-size:12px; opacity:0.7;">${o['Thời Gian']}</span></div><div style="background:${statusColor}; color:#fff; padding:4px 10px; border-radius:12px; font-size:12px; font-weight:bold;">${o['Trạng Thái']}</div></div>`;
    html += `<div class="order-detail-box"><div style="margin-bottom:5px;">👤 <b>Khách hàng:</b> ${o['Tên Khách Hàng']} ${isVIP?'<span class="vip-badge">🌟 VIP</span>':''}</div><div style="margin-bottom:5px;">📞 <b>SĐT:</b> ${o['SDT']||'---'}</div><div>📍 <b>Địa chỉ:</b> ${o['Địa Chỉ']||'---'}</div></div>`;
    if(o['Ghi Chú']) html += `<div class="order-detail-note"><b>Ghi chú:</b> ${o['Ghi Chú']}</div>`;
    html += `<div style="font-weight:bold; margin-bottom:10px; color:inherit;">📦 Danh sách sản phẩm:</div><div style="max-height:250px; overflow-y:auto; border:1px solid #eee; border-radius:8px; padding:10px; margin-bottom:15px;">`;
    
    let rawTotal = 0;
    if(o['Chi Tiết JSON']) { try { JSON.parse(String(o['Chi Tiết JSON'])).forEach(i => { rawTotal += i.thanhTien; html += `<div class="order-item-row"><div style="flex:1;"><b>[${i.maSP}] ${i.tenSP}</b> <br/><span style="font-size:12px; color:#64748b;">${formatMoney(i.giaBan)} x ${i.soLuong}</span></div><div style="font-weight:bold; color:#0070f4; display:flex; align-items:center;">${formatMoney(i.thanhTien)}</div></div>`; }); } catch(e) {} }
    
    let chietKhau = Number(o['Chiết Khấu %']||0); let finalTotal = Number(String(o['Thành Tiền Sau Chiết Khấu']||o['Tổng Tiền']||0).replace(/[^0-9\-]/g,"")); 
    
    html += `</div><div class="order-detail-box"><div style="display:flex; justify-content:space-between; font-size:13px; margin-bottom:8px;"><span>Tổng tiền hàng:</span> <b>${formatMoney(rawTotal)}</b></div>`;
    if(chietKhau > 0) { let tienGiam = Math.abs(rawTotal) - Math.abs(finalTotal); html += `<div style="display:flex; justify-content:space-between; font-size:13px; margin-bottom:8px; color:#10b981;"><span>Được giảm giá (${chietKhau}%):</span> <b>-${formatMoney(tienGiam)}</b></div>`; }
    html += `<div style="display:flex; justify-content:space-between; align-items:center; border-top:1px dashed #cbd5e1; padding-top:10px; margin-top:5px;"><span style="font-size:15px; font-weight:bold;">THÀNH TIỀN:</span> <span style="font-size:18px; font-weight:bold; color:#d32f2f;">${formatMoney(finalTotal)}</span></div>`;

    let paid = Number(String(o['Khách Thanh Toán']||0).replace(/[^0-9\-]/g,"")); let debt = Number(String(o['Còn Nợ']||0).replace(/[^0-9\-]/g,""));
    html += `<div style="display:flex; justify-content:space-between; background:var(--btn-bg, #f0fdf4); border:1px solid #bbf7d0; padding:10px; border-radius:6px; margin-top:10px;"><div style="text-align:center;"><span style="font-size:12px; opacity:0.7;">Đã thanh toán</span><br/><b style="color:#10b981;">${formatMoney(paid)}</b></div><div style="text-align:center;"><span style="font-size:12px; opacity:0.7;">Còn nợ</span><br/><b style="color:#ef4444;">${formatMoney(debt)}</b></div></div></div>`;
    html += `<div style="display:flex; gap:10px; margin-top:15px;"><button class="action-btn orange" style="flex:1; padding:12px; font-size:14px;" onclick="closeModal('orderModal'); openEditOrderModal('${id}')">✏️ SỬA ĐƠN NÀY</button><button class="action-btn gray" style="flex:1; padding:12px; font-size:14px;" onclick="printOrder('${id}')">🖨️ IN HÓA ĐƠN</button></div>`;
    
    document.getElementById('orderModalBody').innerHTML = html; document.getElementById('orderModal').style.display = 'flex';
}

function openEditOrderModal(id) {
    let o = ALL_ORDERS.find(x => x['Mã Đơn'] === id); if(!o) return; editingOrderId = id;
    let en = document.getElementById("eoName"); if(en) en.value = o['Tên Khách Hàng'] || ''; 
    let ep = document.getElementById("eoPhone"); if(ep) ep.value = o['SDT'] || '';
    let ea = document.getElementById("eoAddress"); if(ea) ea.value = o['Địa Chỉ'] || ''; 
    let eno = document.getElementById("eoNote"); if(eno) eno.value = o['Ghi Chú'] || '';
    let ed = document.getElementById("eoDiscount"); if(ed) ed.value = o['Chiết Khấu %'] || '';
    let epa = document.getElementById("eoPaid"); if(epa) epa.value = o['Khách Thanh Toán'] || 0;
    
    let cOldDebt = 0; let cPhoneClean = cleanPhone(o['SDT']);
    if(cPhoneClean) { let cus = ALL_CUSTOMERS.find(c => cleanPhone(c['Điện thoại']) === cPhoneClean); if(cus) { cOldDebt = getRealtimeCustomerDebt(cPhoneClean) - Number(String(o['Còn Nợ']||0).replace(/[^0-9\-]/g,"")); let ect = document.getElementById('eoCustomerType'); if(ect) ect.value = cus['Nhóm KH'] || 'Khách Lẻ'; } }
    let eod = document.getElementById("eoOldDebt"); if(eod) eod.value = cOldDebt;
    currentOrderItems = []; if(o['Chi Tiết JSON']) { try { currentOrderItems = JSON.parse(String(o['Chi Tiết JSON'])); } catch(e){} }
    renderAddFormUI(); renderOrderItemsList(true); let m = document.getElementById('editOrderModal'); if(m) m.style.display = 'flex';
}

function saveEditOrder() {
    if(currentOrderItems.length === 0) return alert("Đơn hàng không thể rỗng!");
    let o = ALL_ORDERS.find(x => x['Mã Đơn'] === editingOrderId); if(!o) return;

    if(String(o['Trạng Thái']).trim() !== 'Nháp') {
        let oldItems = []; try { oldItems = JSON.parse(String(o['Chi Tiết JSON'])); } catch(e){}
        oldItems.forEach(item => { let p = ALL_PRODUCTS.find(x => x['Mã SP'] == item.maSP); if(p) { let keyDangDat = getKeyByKeyword(p, 'đang đặt') || 'Đang đặt'; p[keyDangDat] = (Number(p[keyDangDat]) || 0) - item.soLuong; if(p[keyDangDat] < 0) p[keyDangDat] = 0; } });
        currentOrderItems.forEach(item => { let p = ALL_PRODUCTS.find(x => x['Mã SP'] == item.maSP); if(p) { let keyDangDat = getKeyByKeyword(p, 'đang đặt') || 'Đang đặt'; p[keyDangDat] = (Number(p[keyDangDat]) || 0) + item.soLuong; addQueueItem('updateProduct', p); } });
        localStorage.setItem('ALL_PRODUCTS', JSON.stringify(ALL_PRODUCTS));
    }

    let nEl = document.getElementById("eoName"); if(nEl) o['Tên Khách Hàng'] = nEl.value; 
    let pEl = document.getElementById("eoPhone"); if(pEl) o['SDT'] = cleanPhone(pEl.value); 
    let aEl = document.getElementById("eoAddress"); if(aEl) o['Địa Chỉ'] = aEl.value; 
    let noEl = document.getElementById("eoNote"); if(noEl) o['Ghi Chú'] = noEl.value;
    let dEl = document.getElementById("eoDiscount"); let disc = dEl ? (Number(dEl.value) || 0) : 0; 
    let paEl = document.getElementById("eoPaid"); let paid = paEl ? (Number(paEl.value) || 0) : 0;
    let odEl = document.getElementById("eoOldDebt"); let oldDebtRecord = odEl ? (Number(odEl.value) || 0) : 0;
    let ctSel = document.getElementById('eoCustomerType'); let cusType = ctSel ? ctSel.value : 'Khách Lẻ';
    
    let rawTotal = currentOrderItems.reduce((sum, item) => sum + item.thanhTien, 0); let totalItems = currentOrderItems.reduce((sum, item) => sum + Number(item.soLuong), 0);
    let finalTotal = disc > 0 ? smartRound(rawTotal * (1 - disc/100)) : rawTotal; 
    let tongCong = finalTotal + oldDebtRecord; let newDebt = tongCong - paid;

    o['Loại Đơn'] = "APP - " + cusType; o['Chiết Khấu %'] = disc; o['Tổng SP'] = totalItems; o['Tổng Tiền'] = rawTotal; 
    o['Thành Tiền Sau Chiết Khấu'] = finalTotal; 
    delete o['Thành Tiền Sau CK']; 
    o['Khách Thanh Toán'] = paid; o['Còn Nợ'] = newDebt; o['Chi Tiết JSON'] = JSON.stringify(currentOrderItems);

    if(String(o['Trạng Thái']).trim() === 'Nháp') o['Trạng Thái'] = 'Chờ xử lý';

    let cPhoneClean = cleanPhone(pEl ? pEl.value : '');
    if (cPhoneClean) {
       let cusIdx = ALL_CUSTOMERS.findIndex(c => cleanPhone(c['Điện thoại']) === cPhoneClean);
       if(cusIdx === -1) { 
           let cus = { "Mã khách hàng": generateCustomerId(), "Tên khách hàng": nEl.value, "Điện thoại": cPhoneClean, "Địa Chỉ": aEl.value, "Nhóm KH": cusType, "Nợ Đầu Kỳ": 0, "Đã Thu Nợ": 0, "Tổng Nợ Thực Tế": 0, "Tổng đơn hàng": 0, "Tổng mua": 0 };
           ALL_CUSTOMERS.push(cus); addQueueItem('updateCustomer', cus);
       } else {
           let cus = ALL_CUSTOMERS[cusIdx]; let changed = false;
           if(!cus['Tên khách hàng'] && nEl.value) { cus['Tên khách hàng'] = nEl.value; changed = true; }
           if(!cus['Địa Chỉ'] && aEl.value) { cus['Địa Chỉ'] = aEl.value; changed = true; }
           if(cus['Nhóm KH'] !== cusType) { cus['Nhóm KH'] = cusType; changed = true; }
           if(changed) addQueueItem('updateCustomer', cus);
       }
       localStorage.setItem('ALL_CUSTOMERS', JSON.stringify(ALL_CUSTOMERS));
    }

    localStorage.setItem('ALL_ORDERS', JSON.stringify(ALL_ORDERS)); addQueueItem('updateOrder', o); 
    if(cPhoneClean) syncCustomerStatsToSheet(cPhoneClean);
    
    closeModal('editOrderModal'); if(currentPage === 'orders') renderOrdersData();
}

function getProductPriceInfo(p, qty = 1, cusType = 'Khách Lẻ') {
    if(!p) return { price: 0, isWholesale: false, appliedKm: 0, basePrice: 0 };
    let giaSi = Number(String(p['Giá bán sỉ']||0).replace(/[^0-9]/g,""));
    let siTu = Number(String(p['Sỉ từ']||999999).replace(/[^0-9]/g,"")) || 999999;
    let giaLe = Number(String(p['Giá bán lẻ']||0).replace(/[^0-9]/g,""));
    let pctKm = Number(String(p['% Khuyến mãi']||0).replace(/[^0-9.]/g,""));
    let giaGoc = Number(String(p['Giá gốc']||0).replace(/[^0-9]/g,""));
    let basePrice = giaLe > 0 ? giaLe : giaGoc;
    let isSỉ = String(cusType).trim().toLowerCase().includes('sỉ');

    if (isSỉ || (giaSi > 0 && qty >= siTu)) { let finalSi = giaSi > 0 ? giaSi : basePrice; return { price: finalSi, isWholesale: true, basePrice: finalSi, appliedKm: 0 }; }
    let finalPrice = basePrice; if (pctKm > 0) finalPrice = smartRound(basePrice * (1 - pctKm / 100));
    return { price: finalPrice, isWholesale: false, basePrice: basePrice, appliedKm: pctKm };
}

function changePriceType(isEditMode) {
    let pTypeEl = document.getElementById(isEditMode ? 'eoCustomerType' : 'cCustomerType'); let pType = pTypeEl ? pTypeEl.value : 'Khách Lẻ';
    currentOrderItems.forEach(item => { let p = ALL_PRODUCTS.find(x => x['Mã SP'] == item.maSP); if(p) { let priceInfo = getProductPriceInfo(p, item.soLuong, pType); item.giaBan = priceInfo.price; item.ckPercent = priceInfo.appliedKm || ''; item.thanhTien = item.soLuong * item.giaBan; } });
    renderOrderItemsList(isEditMode); renderAddFormUI(); 
}

function saveDraftLocal() {
    let n = document.getElementById('cName'); let p = document.getElementById('cPhone'); let a = document.getElementById('cAddress');
    let no = document.getElementById('cNote'); let d = document.getElementById('cDiscount'); let pd = document.getElementById('cPaid'); let selT = document.getElementById('cCustomerType');
    let draft = { name: n ? n.value : '', phone: p ? p.value : '', address: a ? a.value : '', note: no ? no.value : '', discount: d ? d.value : '', paid: pd ? pd.value : '', cusType: selT ? selT.value : 'Khách Lẻ', items: currentOrderItems };
    localStorage.setItem('draftOrderData', JSON.stringify(draft));
}

function restoreDraftLocal() {
    let draftStr = localStorage.getItem('draftOrderData');
    if(draftStr) {
        try {
            let draft = JSON.parse(draftStr);
            let n = document.getElementById('cName'); if(n) n.value = draft.name || ''; let p = document.getElementById('cPhone'); if(p) p.value = draft.phone || '';
            let a = document.getElementById('cAddress'); if(a) a.value = draft.address || ''; let no = document.getElementById('cNote'); if(no) no.value = draft.note || '';
            let d = document.getElementById('cDiscount'); if(d) d.value = draft.discount || ''; let pd = document.getElementById('cPaid'); if(pd) pd.value = draft.paid || '';
            let cst = document.getElementById('cCustomerType'); if(cst && draft.cusType) cst.value = draft.cusType;
            currentOrderItems = draft.items || [];
        } catch(e){}
    }
}

function clearDraftLocal() {
    localStorage.removeItem('draftOrderData'); let ids = ['cName', 'cPhone', 'cAddress', 'cNote', 'cDiscount', 'cPaid'];
    ids.forEach(id => { let el = document.getElementById(id); if(el) el.value = ''; });
    let od = document.getElementById('cOldDebt'); if(od) od.value = 0; let cst = document.getElementById('cCustomerType'); if(cst) { cst.value = 'Khách Lẻ'; changePriceType(false); }
    currentOrderItems = []; renderAddFormUI();
}

function buildCustomerList() {
    let list = [...ALL_CUSTOMERS];
    ALL_ORDERS.forEach(o => {
        let sdt = cleanPhone(o['SDT']); let name = String(o['Tên Khách Hàng']||'').trim();
        if(sdt && !list.find(c => cleanPhone(c['Điện thoại']) === sdt)) { list.push({ 'Mã khách hàng': '', 'Tên khách hàng': name, 'Điện thoại': sdt, 'Địa Chỉ': String(o['Địa Chỉ']||''), 'Nhóm KH': 'Khách Lẻ', 'Nợ Đầu Kỳ': 0, 'Đã Thu Nợ': 0, 'Tổng Nợ Thực Tế': 0, 'Tổng đơn hàng': 0, 'Tổng mua': 0 }); }
    });
    return list;
}

function showCustomerSuggest(inputEl, isEditMode, boxIdOverride) {
    let valClean = cleanPhone(inputEl.value); let valRaw = String(inputEl.value).toLowerCase().trim();
    let boxId = boxIdOverride || (isEditMode ? 'cusSuggestEdit' : 'cusSuggestAdd'); 
    let menu = document.getElementById(boxId); if(!menu) return;
    if(!valRaw) { menu.style.display = 'none'; return; }
    
    let list = buildCustomerList().filter(c => {
        let matchPhone = valClean ? cleanPhone(c['Điện thoại']).includes(valClean) : false; let matchName = String(c['Tên khách hàng']||'').toLowerCase().includes(valRaw);
        return matchPhone || matchName;
    }).slice(0, 5);

    if(list.length === 0) { menu.style.display = 'none'; return; }
    
    let html = list.map(c => {
        let phone = cleanPhone(c['Điện thoại']); let stats = calcCustomerStats(phone); let cType = c['Nhóm KH'] || 'Khách Lẻ'; 
        let debtVal = Number(stats.currentDebt) || 0; let noStr = (debtVal > 0) ? `<span class="debt-badge">Nợ cũ: ${formatMoney(debtVal)}</span>` : '';
        let safeName = String(c['Tên khách hàng']||'').replace(/'/g,"\\'"); let safeAddress = String(c['Địa Chỉ']||'').replace(/'/g,"\\'");
        
        return `<div class="suggest-item" onmousedown="selectCustomer('${safeName}', '${phone}', '${safeAddress}', ${debtVal}, '${cType}', ${isEditMode}, '${boxId}')">
            <b>${c['Tên khách hàng']||'---'}</b> - <span style="color:#3b82f6;">${phone}</span> [${cType}] ${noStr}<br>
            <small style="opacity:0.7;">${c['Địa Chỉ']||''}</small>
        </div>`;
    }).join('');
    menu.innerHTML = html; menu.style.display = 'block';
}

function selectCustomer(name, phone, address, oldDebt, cusType, isEditMode, boxId) {
    if(isEditMode) {
        let en = document.getElementById('eoName'); if(en) en.value = name; let ep = document.getElementById('eoPhone'); if(ep) ep.value = phone;
        let ea = document.getElementById('eoAddress'); if(ea) ea.value = address; let eod = document.getElementById('eoOldDebt'); if(eod) eod.value = oldDebt;
        let ctSel = document.getElementById('eoCustomerType'); if(ctSel) { ctSel.value = cusType; changePriceType(true); } updateOrderSummary(true);
    } else {
        let cn = document.getElementById('cName'); if(cn) cn.value = name; let cp = document.getElementById('cPhone'); if(cp) cp.value = phone;
        let ca = document.getElementById('cAddress'); if(ca) ca.value = address; let cod = document.getElementById('cOldDebt'); if(cod) cod.value = oldDebt;
        let ctSel = document.getElementById('cCustomerType'); if(ctSel) { ctSel.value = cusType; changePriceType(false); } updateOrderSummary(false); saveDraftLocal();
    }
    let box = document.getElementById(boxId); if(box) box.style.display = 'none';
}

function renderOrderItemsList(isEditMode) {
    let html = '';
    currentOrderItems.forEach((i, idx) => {
       if(i.giaGoc === undefined) i.giaGoc = i.giaBan;
       html += `<div style="padding:10px; border-bottom:1px dashed #e2e8f0; font-size:13px;" id="${isEditMode?'eoItem_':'item_'}${i.maSP}">
         <div style="display:flex; justify-content:space-between; margin-bottom:8px;"><b style="color:#3b82f6;">${i.maSP} - ${i.tenSP}</b><button class="action-btn red" style="width:auto;padding:2px 8px;" onclick="removeOrderItem(${idx}, ${isEditMode})">X</button></div>
         <div style="display:flex; gap:8px; align-items:center;">
            <div style="flex:1"><label style="font-size:10px;opacity:0.7;">SL</label><input type="number" class="item-edit-input" value="${i.soLuong}" onchange="updateItem(${idx}, 'qty', this.value, ${isEditMode})"/></div>
            <div style="flex:2"><label style="font-size:10px;opacity:0.7;">Đơn giá</label><input type="number" class="item-edit-input" value="${i.giaBan}" oninput="updateItem(${idx}, 'price', this.value, ${isEditMode})"/></div>
            <div style="flex:1"><label style="font-size:10px;opacity:0.7;">% CK</label><input type="number" class="item-edit-input" value="${i.ckPercent||''}" placeholder="%" oninput="updateItem(${idx}, 'discount', this.value, ${isEditMode})"/></div>
         </div>
         <div style="text-align:right; font-weight:bold; color:#f87171; margin-top:6px;">= ${formatMoney(i.thanhTien)}</div>
       </div>`;
    });
    if(isEditMode) { let el = document.getElementById("eoItemsList"); if(el) el.innerHTML = html || '<i style="opacity:0.6;font-size:12px;">Đơn hàng rỗng.</i>'; }
    else { let el = document.getElementById("tempOrderItems"); if(el) el.innerHTML = html; }
    updateOrderSummary(isEditMode); 
}

function updateItem(idx, field, val, isEditMode) {
    let item = currentOrderItems[idx]; val = Number(val);
    if(field === 'qty') { 
        let p = ALL_PRODUCTS.find(x => x['Mã SP'] == item.maSP);
        if(p) {
            let validStock = (Number(p[getKeyByKeyword(p, 'tồn kho')])||0) - (Number(p[getKeyByKeyword(p, 'đang đặt')])||0);
            if (val > validStock) { alert(`❌ Kho không đủ! Chỉ còn lại ${validStock} sản phẩm khả dụng.`); val = validStock; }
            let pTypeEl = document.getElementById(isEditMode ? "eoCustomerType" : "cCustomerType"); let pType = pTypeEl ? pTypeEl.value : 'Khách Lẻ';
            let priceInfo = getProductPriceInfo(p, val, pType); item.giaBan = priceInfo.price; item.ckPercent = priceInfo.appliedKm || '';
        }
        item.soLuong = val > 0 ? val : 1; 
    } 
    else if (field === 'price') { item.giaBan = val >= 0 ? val : 0; item.ckPercent = ''; } 
    else if (field === 'discount') { item.ckPercent = val; item.giaBan = smartRound(item.giaGoc * (1 - val/100)); } 
    item.thanhTien = item.soLuong * item.giaBan; renderOrderItemsList(isEditMode);
}

function removeOrderItem(idx, isEditMode) { currentOrderItems.splice(idx, 1); renderOrderItemsList(isEditMode); }

function updateOrderSummary(isEditMode) {
    let discId = isEditMode ? "eoDiscount" : "cDiscount"; let sumId = isEditMode ? "eoSummary" : "addOrderSummary";
    let paidId = isEditMode ? "eoPaid" : "cPaid"; let oldDebtId = isEditMode ? "eoOldDebt" : "cOldDebt";

    let dEl = document.getElementById(discId); let disc = dEl ? Number(dEl.value) : 0; 
    let paidEl = document.getElementById(paidId); let paid = paidEl ? Number(paidEl.value) : 0;
    let odEl = document.getElementById(oldDebtId); let oldDebt = odEl ? Number(odEl.value) : 0;
    let sumDiv = document.getElementById(sumId); if(!sumDiv) return;
    
    if(currentOrderItems.length === 0) { sumDiv.style.display = 'none'; return; }
    
    let rawTotal = currentOrderItems.reduce((sum, item) => sum + item.thanhTien, 0);
    let finalTotal = disc > 0 ? smartRound(rawTotal * (1 - disc/100)) : rawTotal;
    let discVal = rawTotal - finalTotal;
    let tongCong = finalTotal + oldDebt; let debt = tongCong - paid;
    
    let html = `<div class="summary-row"><span>Tổng tiền hàng:</span> <span>${formatMoney(rawTotal)}</span></div>`;
    if(discVal > 0) html += `<div class="summary-row discount"><span>Đã giảm giá hóa đơn (${disc}%):</span> <span>-${formatMoney(discVal)}</span></div>`;
    
    html += `<div class="summary-row final"><span>Thành tiền đơn này:</span> <span>${formatMoney(finalTotal)}</span></div>`;
    
    if(oldDebt > 0) html += `<div class="summary-row" style="color:#ef4444; font-weight:bold; margin-top:5px;"><span>Nợ cũ:</span> <span>${formatMoney(oldDebt)}</span></div>`;
    html += `<div class="summary-row tong-cong"><span>TỔNG PHẢI THU:</span> <span>${formatMoney(tongCong)}</span></div>`;
    html += `<div style="display:flex; justify-content:space-between; align-items:center; margin-top:10px; padding-top:10px; border-top:1px dashed #444;">`;
    html += `<div style="flex:1;"><span style="font-size:12px;opacity:0.8;">Khách thanh toán:</span><br/><b style="color:#3b82f6; font-size:16px;">${formatMoney(paid)}</b></div>`;
    html += `<div style="flex:1; text-align:right;"><span style="font-size:12px;opacity:0.8;">Còn nợ:</span><br/><b style="color:#f59e0b; font-size:16px;">${formatMoney(debt)}</b></div></div>`;
    sumDiv.innerHTML = html; sumDiv.style.display = 'block';
    if(!isEditMode) saveDraftLocal();
}

function autoFillPaid(type, isEditMode = false) {
    if (currentOrderItems.length === 0) return alert("Vui lòng thêm sản phẩm vào đơn trước!");
    let dEl = document.getElementById(isEditMode ? "eoDiscount" : "cDiscount"); let disc = dEl ? (Number(dEl.value) || 0) : 0;
    let rawTotal = currentOrderItems.reduce((sum, item) => sum + item.thanhTien, 0);
    let finalTotal = disc > 0 ? smartRound(rawTotal * (1 - disc/100)) : rawTotal;
    let amountToFill = 0;
    if (type === 'current') { amountToFill = finalTotal; } else if (type === 'all') { let odEl = document.getElementById(isEditMode ? "eoOldDebt" : "cOldDebt"); let oldDebt = odEl ? (Number(odEl.value) || 0) : 0; amountToFill = finalTotal + oldDebt; }
    let paidInput = document.getElementById(isEditMode ? "eoPaid" : "cPaid");
    if (paidInput) { paidInput.value = amountToFill; updateOrderSummary(isEditMode); if(!isEditMode) saveDraftLocal(); }
}

function renderAddFormUI() { 
    let pTypeEl = document.getElementById('cCustomerType'); let pType = pTypeEl ? pTypeEl.value : 'Khách Lẻ';
    let opts = ALL_PRODUCTS.map(p => {
        let validStock = (Number(p[getKeyByKeyword(p, 'tồn kho')])||0) - (Number(p[getKeyByKeyword(p, 'đang đặt')])||0); let priceInfo = getProductPriceInfo(p, 1, pType);
        let textStr = `${p['Tên SP']} | Giá: ${formatMoney(priceInfo.price)} | Tồn: ${validStock}`;
        if (validStock <= 0) return `<option value="${p['Mã SP']}" disabled>❌ HẾT HÀNG - ${textStr}</option>`; return `<option value="${p['Mã SP']}">${textStr}</option>`;
    }).join('');
    let dl = document.getElementById("productDatalist"); if(dl) dl.innerHTML = opts; renderOrderItemsList(false);
}

function addTempItemToOrder(isEditMode) {
    let inputId = isEditMode ? "productInputEdit" : "productInputAdd"; let prodEl = document.getElementById(inputId); let valId = prodEl ? String(prodEl.value).trim().toUpperCase() : ''; 
    let qtyEl = document.getElementById(isEditMode ? "eoQty" : "qty"); let qty = qtyEl ? (Number(qtyEl.value) || 1) : 1;
    let pTypeEl = document.getElementById(isEditMode ? "eoCustomerType" : "cCustomerType"); let pType = pTypeEl ? pTypeEl.value : 'Khách Lẻ';
    if(!valId) return;
    let p = ALL_PRODUCTS.find(x => String(x['Mã SP']).toUpperCase() === valId || String(x['Tên SP']).toUpperCase() === valId); 
    if(!p) return alert("Không tìm thấy Sản phẩm với mã hoặc tên này!");

    let priceInfo = getProductPriceInfo(p, qty, pType); let validStock = (Number(p[getKeyByKeyword(p, 'tồn kho')])||0) - (Number(p[getKeyByKeyword(p, 'đang đặt')])||0);
    let existing = currentOrderItems.find(i => i.maSP == p['Mã SP']); let currentTempQty = existing ? existing.soLuong : 0;
    if (currentTempQty + qty > validStock) return alert(`❌ Vượt quá số lượng trong kho! \nTồn kho khả dụng: ${validStock} \nBạn đã chọn: ${currentTempQty}`);

    if(existing) { 
        existing.soLuong += qty; let np = getProductPriceInfo(p, existing.soLuong, pType);
        existing.giaBan = np.price; existing.ckPercent = np.appliedKm || ''; existing.thanhTien = existing.soLuong * existing.giaBan; 
    } else { currentOrderItems.push({ maSP: p['Mã SP'], tenSP: p['Tên SP'], soLuong: qty, giaGoc: priceInfo.basePrice, giaBan: priceInfo.price, ckPercent: priceInfo.appliedKm || '', thanhTien: priceInfo.price * qty }); }
    
    if(prodEl) prodEl.value = ''; if(qtyEl) qtyEl.value = 1; renderOrderItemsList(isEditMode);
    setTimeout(() => { let rowId = isEditMode ? 'eoItem_'+p['Mã SP'] : 'item_'+p['Mã SP']; let rowEl = document.getElementById(rowId); if(rowEl) { rowEl.style.backgroundColor = '#d1fae5'; setTimeout(() => rowEl.style.backgroundColor = 'transparent', 500); } }, 50);
}

function handleAddOrder(orderStatus = 'Chờ xử lý') {
    if(currentOrderItems.length === 0) return alert("Đơn hàng chưa có sản phẩm nào!");
    let nEl = document.getElementById("cName"); let cName = nEl ? nEl.value : ''; let pEl = document.getElementById("cPhone"); let cPhoneClean = cleanPhone(pEl ? pEl.value : '');
    if(orderStatus !== 'Nháp' && !cName) return alert("Vui lòng điền Tên khách hàng!");

    let dEl = document.getElementById("cDiscount"); let discountPct = dEl ? (Number(dEl.value) || 0) : 0;
    let paidEl = document.getElementById("cPaid"); let paid = paidEl ? (Number(paidEl.value) || 0) : 0;
    let odEl = document.getElementById("cOldDebt"); let oldDebt = odEl ? (Number(odEl.value) || 0) : 0;

    let rawTotal = currentOrderItems.reduce((sum, item) => sum + item.thanhTien, 0); let totalItems = currentOrderItems.reduce((sum, item) => sum + Number(item.soLuong), 0);
    let finalTotal = discountPct > 0 ? smartRound(rawTotal * (1 - discountPct/100)) : rawTotal; let tongCong = finalTotal + oldDebt; let debt = tongCong - paid;

    let mockId = (orderStatus === 'Nháp' ? "NHAP_" : "DH_") + Date.now().toString().slice(-5); let createTime = new Date().toLocaleString('vi-VN'); 
    let aEl = document.getElementById("cAddress"); let noEl = document.getElementById("cNote");
    let selT = document.getElementById('cCustomerType'); let cusType = selT ? selT.value : 'Khách Lẻ'; let loaiDon = "APP - " + cusType;

    // Chỉ đẩy đúng các trường này lên Sheet (Không có Công nợ, không có Loại rác)
    let newOrder = { 
        "Mã Đơn": mockId, "Thời Gian": createTime, "Tên Khách Hàng": cName || 'Đơn Nháp', "SDT": cPhoneClean, 
        "Địa Chỉ": aEl ? aEl.value : '', "Ghi Chú": noEl ? noEl.value : '', "Tổng SP": totalItems, "Tổng Tiền": rawTotal, 
        "Chiết Khấu %": discountPct, "Thành Tiền Sau Chiết Khấu": finalTotal, "Chi Tiết JSON": JSON.stringify(currentOrderItems), 
        "Trạng Thái": orderStatus, "Khách Thanh Toán": paid, "Còn Nợ": debt, "Loại Đơn": loaiDon 
    };

    ALL_ORDERS.unshift(newOrder); localStorage.setItem('ALL_ORDERS', JSON.stringify(ALL_ORDERS));
    
    if(orderStatus !== 'Nháp') {
        currentOrderItems.forEach(item => { let p = ALL_PRODUCTS.find(x => x['Mã SP'] == item.maSP); if(p) { let keyDangDat = getKeyByKeyword(p, 'đang đặt') || 'Đang đặt'; p[keyDangDat] = (Number(p[keyDangDat]) || 0) + item.soLuong; addQueueItem('updateProduct', p); } });
        localStorage.setItem('ALL_PRODUCTS', JSON.stringify(ALL_PRODUCTS));
        
        if (cPhoneClean) {
            let cusIdx = ALL_CUSTOMERS.findIndex(c => cleanPhone(c['Điện thoại']) === cPhoneClean);
            if(cusIdx === -1) { 
                let cus = { "Mã khách hàng": generateCustomerId(), "Tên khách hàng": cName, "Điện thoại": cPhoneClean, "Địa Chỉ": aEl ? aEl.value : '', "Nhóm KH": cusType, "Nợ Đầu Kỳ": 0, "Đã Thu Nợ": 0, "Tổng Nợ Thực Tế": 0, "Tổng đơn hàng": 0, "Tổng mua": 0 };
                ALL_CUSTOMERS.push(cus); addQueueItem('updateCustomer', cus);
            } else {
                let cus = ALL_CUSTOMERS[cusIdx]; let changed = false;
                if(!cus['Tên khách hàng'] && cName) { cus['Tên khách hàng'] = cName; changed = true; }
                if(!cus['Địa Chỉ'] && aEl.value) { cus['Địa Chỉ'] = aEl.value; changed = true; }
                if(cus['Nhóm KH'] !== cusType) { cus['Nhóm KH'] = cusType; changed = true; }
                
                // Đảm bảo xóa key rác bị kẹt trong máy tính (nếu có) trước khi đẩy
                delete cus['Công nợ']; 
                delete cus['Loại'];

                if(changed) addQueueItem('updateCustomer', cus);
            }
            localStorage.setItem('ALL_CUSTOMERS', JSON.stringify(ALL_CUSTOMERS));
        }
    }
    
    addQueueItem('addOrder', newOrder); if (cPhoneClean && orderStatus !== 'Nháp') syncCustomerStatsToSheet(cPhoneClean);
    localStorage.removeItem('draftOrderData'); 
    if(nEl) nEl.value = ''; if(pEl) pEl.value = ''; if(aEl) aEl.value = ''; if(noEl) noEl.value = ''; if(dEl) dEl.value = ''; if(paidEl) paidEl.value = ''; if(odEl) odEl.value = 0; 
    let sumEl = document.getElementById("addOrderSummary"); if(sumEl) sumEl.style.display = 'none';
    currentOrderItems = []; renderAddFormUI(); if(currentPage === 'dashboard') renderAdvancedDashboard(); if(currentPage === 'orders') renderOrdersData();
}
