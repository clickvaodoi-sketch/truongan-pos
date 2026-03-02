function calcCustomerStats(phone) {
    let cPhoneClean = cleanPhone(phone);
    let stats = { totalOrders: 0, totalSpent: 0, currentDebt: 0 };
    if(!cPhoneClean) return stats;

    let cus = ALL_CUSTOMERS.find(c => cleanPhone(c['Điện thoại']) === cPhoneClean);
    let baseDebt = cus ? (Number(cus['Nợ Đầu Kỳ']) || 0) : 0; 
    let daThu = cus ? (Number(cus['Đã Thu Nợ']) || 0) : 0;
    
    let orderDebt = 0;
    ALL_ORDERS.forEach(o => {
        let st = String(o['Trạng Thái']).trim();
        if(cleanPhone(o['SDT']) === cPhoneClean && st !== 'Đã hủy' && st !== 'Nháp' && st !== 'Đã hoàn trả') {
            stats.totalOrders++;
            stats.totalSpent += Number(String(o['Thành Tiền Sau Chiết Khấu']||o['Tổng Tiền']||0).replace(/[^0-9\-]/g,""));
            orderDebt += Number(String(o['Còn Nợ']||0).replace(/[^0-9\-]/g,""));
        }
    });
    
    stats.currentDebt = baseDebt + orderDebt - daThu;
    return stats;
}

function getRealtimeCustomerDebt(phone) { return calcCustomerStats(phone).currentDebt; }

function syncCustomerStatsToSheet(phone) {
    let cPhoneClean = cleanPhone(phone); if(!cPhoneClean) return;
    let cus = ALL_CUSTOMERS.find(c => cleanPhone(c['Điện thoại']) === cPhoneClean); if(!cus) return;
    let stats = calcCustomerStats(cPhoneClean);
    cus['Tổng mua'] = stats.totalSpent; cus['Tổng đơn hàng'] = stats.totalOrders;
    cus['Tổng Nợ Thực Tế'] = stats.currentDebt;
    
    delete cus['Công nợ']; delete cus['Loại'];

    localStorage.setItem('ALL_CUSTOMERS', JSON.stringify(ALL_CUSTOMERS)); addQueueItem('updateCustomer', cus);
}

// Hàm chuyển sang Tab Đơn hàng và LỌC TOÀN BỘ ĐƠN CỦA KHÁCH ĐÓ
function viewCustomerOrders(phone) {
    showPage('orders'); 
    let searchInput = document.getElementById('searchOrders');
    if(searchInput) { searchInput.value = phone; renderOrdersData(true); }
}

function renderCustomersData(resetLimit = false) {
    try {
        if(resetLimit) limitCus = 50;
        let sEl = document.getElementById("searchCustomers"); let s = sEl ? String(sEl.value).toLowerCase().trim() : '';
        let filtered = buildCustomerList();
        
        if(s) {
            filtered = filtered.filter(c => {
                let name = String(c['Tên khách hàng'] || c['Tên KH'] || '').toLowerCase(); let phone = cleanPhone(c['Điện thoại']); let cusId = String(c['Mã khách hàng'] || '').toLowerCase(); 
                return name.includes(s) || phone.includes(s) || cusId.includes(s);
            });
        }

        // Cập nhật bộ đếm Số lượng khách hàng
        let cCountEl = document.getElementById('customerCountDisplay');
        if(cCountEl) cCountEl.innerText = filtered.length;

        let totalDeptGlobal = 0; let totalSalesGlobal = 0; let totalOrdersGlobal = 0;
        
        filtered.forEach(c => {
            let phone = cleanPhone(c['Điện thoại']); let stats = calcCustomerStats(phone);
            c.dynamicStats = stats; totalDeptGlobal += stats.currentDebt; totalSalesGlobal += stats.totalSpent; totalOrdersGlobal += stats.totalOrders;
        });

        let sliced = filtered.slice(0, limitCus);

        let html = viewMode === 'table' ? `<div class="table-responsive"><table>
            <thead>
                <tr>
                    <th class="th-cus-id" title="Mã KH">Mã KH</th>
                    <th class="th-cus-name" title="Tên khách hàng">Tên KH</th>
                    <th class="th-cus-phone" title="Điện thoại">Liên hệ</th>
                    <th style="width: auto; min-width: 150px;" title="Địa chỉ">Địa chỉ</th>
                    <th class="th-cus-group text-center" title="Nhóm KH">Nhóm KH</th>
                    <th class="th-cus-debt text-right" title="Tổng Nợ Thực Tế">Tổng Nợ Thực Tế</th>
                    <th class="th-cus-order text-center" title="Tổng đơn hàng">Đơn</th>
                    <th class="th-cus-spent text-right" title="Tổng mua">Tổng mua</th>
                    <th class="th-cus-action text-center">Tác vụ</th>
                </tr>
                <tr style="font-weight:bold; font-size:14px; opacity:0.8;">
                    <td colspan="5">TỔNG CỘNG</td>
                    <td class="text-right" style="color:#ef4444;">${formatMoney(totalDeptGlobal)}</td>
                    <td class="text-center">${totalOrdersGlobal}</td>
                    <td class="text-right" style="color:#10b981;">${formatMoney(totalSalesGlobal)}</td>
                    <td></td>
                </tr>
            </thead>
            <tbody>` : `<div class="data-grid">
                <div class="summary-box" style="grid-column: 1 / -1; margin-bottom: 0;">
                    <div class="summary-row"><span>Tổng Công Nợ:</span> <b style="color:#ef4444; font-size:16px;">${formatMoney(totalDeptGlobal)}</b></div>
                    <div class="summary-row" style="margin-top:10px; border-top:1px dashed #ccc; padding-top:10px;"><span>Tổng Doanh Thu:</span> <b style="color:#10b981; font-size:16px;">${formatMoney(totalSalesGlobal)}</b></div>
                </div>`;

        sliced.forEach(c => {
            try {
                let phone = cleanPhone(c['Điện thoại']); let noHienTai = c.dynamicStats.currentDebt; 
                let tongBan = c.dynamicStats.totalSpent; let tongDon = c.dynamicStats.totalOrders;
                
                // HIỂN THỊ LINK FACEBOOK
                let fbIcon = c['Link FB'] ? `<a href="${c['Link FB']}" target="_blank" style="color:#1877f2; text-decoration:none; font-size:16px; margin-left:5px;" title="Mở Facebook">📘</a>` : '';
                let callLinks = phone ? `<a href="tel:${phone}" style="color:#3b82f6; text-decoration:none; font-size:16px;" title="Gọi điện">📞</a> <a href="https://zalo.me/${phone}" target="_blank" style="color:#10b981; text-decoration:none; font-size:16px; margin-left:5px;" title="Nhắn Zalo">💬</a> ${fbIcon}` : '';
                
                let cName = String(c['Tên khách hàng'] || c['Tên KH'] || '---'); let cNameTitle = cName.replace(/"/g, '&quot;');
                let cAddr = String(c['Địa Chỉ'] || ''); let nhom = c['Nhóm KH'] || 'Khách Lẻ';
                let badgeClass = nhom.includes('Sỉ') ? 'si' : ''; let avt = cName !== '---' ? cName.charAt(0).toUpperCase() : '👤';
                
                let actionBtnHtml = tongDon > 0 
                    ? `<button class="action-btn orange" style="padding:4px 8px;" title="Khách có đơn, ngừng giao dịch" onclick="alert('Khách hàng này đã có lịch sử giao dịch nên không thể xóa để bảo toàn dữ liệu tài chính.')">🛑</button>`
                    : `<button class="action-btn red" style="padding:4px 8px;" title="Xóa khách hàng" onclick="deleteCustomer('${phone}')">🗑️</button>`;

                if(viewMode === 'table') {
                    html += `<tr>
                        <td class="th-cus-id" title="${c['Mã khách hàng']}">${c['Mã khách hàng']}</td>
                        <td class="th-cus-name" title="${cNameTitle}"><div style="display:flex; align-items:center; gap:8px;">
                            <div style="width:24px; height:24px; border-radius:50%; background:#0070f4; color:#fff; display:flex; justify-content:center; align-items:center; font-size:12px; font-weight:bold; flex-shrink:0;">${avt}</div>
                            <b style="color:#3b82f6; cursor:pointer;" onclick="viewCustomerOrders('${phone}')" title="Xem tất cả đơn của khách này">${cName}</b>
                        </div></td>
                        <td class="th-cus-phone" title="${phone}">${phone} ${callLinks}</td>
                        <td style="width: auto; min-width: 150px;" title="${cAddr}">${cAddr}</td>
                        <td class="th-cus-group text-center" title="${nhom}"><span class="cat-badge ${badgeClass}">${nhom}</span></td>
                        <td class="th-cus-debt text-right" style="font-weight:bold; ${noHienTai !== 0 ? (noHienTai > 0 ? 'color:#ef4444;' : 'color:#10b981;') : 'opacity:0.6;'}" title="${formatMoney(noHienTai)}">${formatMoney(noHienTai)}</td>
                        <td class="th-cus-order text-center" title="${tongDon}">${tongDon}</td>
                        <td class="th-cus-spent text-right" style="font-weight:bold;" title="${formatMoney(tongBan)}">${formatMoney(tongBan)}</td>
                        <td class="th-cus-action actions">
                            <button class="action-btn gray" style="padding:4px 8px;" title="Sửa thông tin" onclick="openCustomerModal('${phone}')">✏️</button>
                            <button class="action-btn green" style="padding:4px 8px;" title="Thanh toán nợ / Hoàn tiền" onclick="openPayDebtModal('${phone}')">💰</button>
                            ${actionBtnHtml}
                        </td>
                    </tr>`;
                } else {
                    html += `<div class="cus-card">
                        <div class="cus-card-header">
                            <div class="cus-avt">${avt}</div>
                            <div class="cus-info">
                                <h4 onclick="viewCustomerOrders('${phone}')" title="Xem tất cả đơn của khách này">${cName}</h4>
                                <span>${phone} ${callLinks}</span>
                                ${cAddr ? `<span style="margin-top:2px;">📍 ${cAddr}</span>` : ''}
                            </div>
                            <span class="cat-badge ${badgeClass}">${nhom}</span>
                        </div>
                        <div class="cus-stats">
                            <div><span style="color:#64748b;">Công nợ</span> <strong style="${noHienTai !== 0 ? (noHienTai > 0 ? 'color:#ef4444;' : 'color:#10b981;') : 'color:#333; opacity:0.6;'};">${formatMoney(noHienTai)}</strong></div>
                            <div style="text-align:right;"><span style="color:#64748b;">Tổng mua (${tongDon})</span> <strong style="color:#10b981;">${formatMoney(tongBan)}</strong></div>
                        </div>
                        <div style="display:flex; gap:5px; margin-top:15px;">
                            <button class="action-btn gray" style="flex:1;" onclick="openCustomerModal('${phone}')">✏️ Sửa</button>
                            <button class="action-btn green" style="flex:1.5;" onclick="openPayDebtModal('${phone}')">💰 ${noHienTai < 0 ? 'Hoàn tiền' : 'Thu nợ'}</button>
                            ${tongDon > 0 ? `<button class="action-btn orange" style="flex:1;" onclick="alert('Khách có giao dịch không thể xóa.')">🛑 Ngừng GD</button>` : `<button class="action-btn red" style="flex:1;" onclick="deleteCustomer('${phone}')">🗑️ Xóa</button>`}
                        </div>
                    </div>`;
                }
            } catch (ex) { console.error(ex) }
        });
        if(viewMode === 'table') html += `</tbody></table></div>`; else html += `</div>`;
        
        if(filtered.length > limitCus) { html += `<div style="text-align:center; padding:15px; clear:both;"><button class="action-btn blue" onclick="loadMore('cus')" style="padding:10px 20px;">⬇️ Xem thêm dữ liệu</button></div>`; }
        let cl = document.getElementById("customersList"); if(cl) cl.innerHTML = html;
        if(viewMode === 'table' && typeof initResizableColumns === 'function') initResizableColumns();
    } catch(err) { console.error("Lỗi vẽ Khách Hàng", err); }
}

function openCustomerModal(phone = '') {
    let mTitle = document.getElementById('cusModalTitle'); if(mTitle) mTitle.innerText = phone ? 'SỬA KHÁCH HÀNG' : 'THÊM KHÁCH HÀNG MỚI';
    let op = document.getElementById('cusOldPhone'); let ep = document.getElementById('cusEditPhone');
    let en = document.getElementById('cusEditName'); let ea = document.getElementById('cusEditAddress');
    let ed = document.getElementById('cusEditDebt'); let et = document.getElementById('cusEditType');
    let eFB = document.getElementById('cusEditFB'); // Thêm biến Edit FB
    
    if(phone) {
        let cus = ALL_CUSTOMERS.find(c => cleanPhone(c['Điện thoại']) === cleanPhone(phone));
        if(cus) {
            if(op) op.value = phone; if(ep) ep.value = phone; if(en) en.value = cus['Tên khách hàng'] || cus['Tên KH'] || '';
            if(ea) ea.value = cus['Địa Chỉ'] || ''; if(ed) ed.value = cus['Nợ Đầu Kỳ'] || 0;
            if(et) et.value = cus['Nhóm KH'] || 'Khách Lẻ';
            if(eFB) eFB.value = cus['Link FB'] || '';
        }
    } else {
        if(op) op.value = ''; if(ep) ep.value = ''; if(en) en.value = ''; if(ea) ea.value = ''; if(ed) ed.value = ''; if(et) et.value = 'Khách Lẻ'; if(eFB) eFB.value = '';
    }
    let cm = document.getElementById('customerModal'); if(cm) cm.style.display = 'flex';
}

function saveCustomer() {
    let oP = document.getElementById('cusOldPhone'); let oldPhone = cleanPhone(oP ? oP.value : '');
    let eP = document.getElementById('cusEditPhone'); let phone = cleanPhone(eP ? eP.value : '');
    if(!phone) return alert("Vui lòng nhập số điện thoại (chỉ nhập số)!");

    let eN = document.getElementById('cusEditName'); let eA = document.getElementById('cusEditAddress'); let eD = document.getElementById('cusEditDebt');
    let eT = document.getElementById('cusEditType'); let eFB = document.getElementById('cusEditFB');
    let inputDebt = eD ? (Number(eD.value) || 0) : 0;
    
    let newCus = {
        "Mã khách hàng": "", "Tên khách hàng": eN ? eN.value : '', "Điện thoại": phone, "Địa Chỉ": eA ? eA.value : '',
        "Nhóm KH": eT ? eT.value : 'Khách Lẻ', 
        "Nợ Đầu Kỳ": inputDebt, "Đã Thu Nợ": 0, "Tổng Nợ Thực Tế": inputDebt, 
        "Tổng đơn hàng": 0, "Tổng mua": 0, "Link FB": eFB ? eFB.value : ''
    };

    if(oldPhone) {
        let idx = ALL_CUSTOMERS.findIndex(c => cleanPhone(c['Điện thoại']) === oldPhone);
        if(idx > -1) { 
            newCus["Mã khách hàng"] = ALL_CUSTOMERS[idx]["Mã khách hàng"]; 
            newCus["Tổng mua"] = ALL_CUSTOMERS[idx]["Tổng mua"] || 0;
            newCus["Tổng đơn hàng"] = ALL_CUSTOMERS[idx]["Tổng đơn hàng"] || 0;
            newCus["Đã Thu Nợ"] = ALL_CUSTOMERS[idx]["Đã Thu Nợ"] || 0;
            ALL_CUSTOMERS[idx] = newCus; 
        }
    } else {
        let exists = ALL_CUSTOMERS.find(c => cleanPhone(c['Điện thoại']) === phone);
        if(exists) {
            if(confirm("Khách hàng với SĐT này đã tồn tại! Hệ thống sẽ cập nhật thông tin mới nhất vào khách này.")) {
                 newCus["Mã khách hàng"] = exists["Mã khách hàng"]; newCus["Tổng mua"] = exists["Tổng mua"] || 0;
                 newCus["Tổng đơn hàng"] = exists["Tổng đơn hàng"] || 0; newCus["Đã Thu Nợ"] = exists["Đã Thu Nợ"] || 0;
                 Object.assign(exists, newCus);
            } else return;
        } else {
            newCus["Mã khách hàng"] = generateCustomerId(); ALL_CUSTOMERS.push(newCus);
        }
    }

    syncCustomerStatsToSheet(phone); closeModal('customerModal'); renderCustomersData();
}

function openPayDebtModal(phone) {
    let cus = ALL_CUSTOMERS.find(c => cleanPhone(c['Điện thoại']) === cleanPhone(phone)); if(!cus) return;
    let stats = calcCustomerStats(phone);
    document.getElementById('payDebtPhone').value = cleanPhone(phone);
    document.getElementById('payDebtName').innerText = cus['Tên khách hàng'] || cus['Tên KH'] || phone;
    
    let isRefund = stats.currentDebt < 0;
    document.getElementById('payDebtIsRefund').value = isRefund ? '1' : '0';
    
    if(isRefund) {
        document.getElementById('payDebtTitle').innerText = '💸 HOÀN TIỀN LẠI CHO KHÁCH';
        document.getElementById('payDebtLabel').innerText = 'Shop đang nợ khách (Số dư):';
        document.getElementById('payDebtInputLabel').innerText = 'Số tiền hoàn trả lại khách *';
        document.getElementById('payDebtBtn').innerText = 'XÁC NHẬN ĐÃ TRẢ TIỀN KHÁCH';
    } else {
        document.getElementById('payDebtTitle').innerText = '💸 THANH TOÁN THU NỢ';
        document.getElementById('payDebtLabel').innerText = 'Tổng nợ hiện tại (Khách nợ):';
        document.getElementById('payDebtInputLabel').innerText = 'Số tiền khách trả *';
        document.getElementById('payDebtBtn').innerText = 'XÁC NHẬN ĐÃ THU TIỀN';
    }
    
    document.getElementById('payDebtCurrent').innerText = formatMoney(Math.abs(stats.currentDebt));
    document.getElementById('payDebtAmount').value = '';
    document.getElementById('payDebtModal').style.display = 'flex';
}

function processPayDebt() {
    let phone = document.getElementById('payDebtPhone').value;
    let amount = Number(document.getElementById('payDebtAmount').value);
    let isRefund = document.getElementById('payDebtIsRefund').value === '1';
    if(!amount || amount <= 0) return alert("Vui lòng nhập số tiền hợp lệ!");
    
    let cus = ALL_CUSTOMERS.find(c => cleanPhone(c['Điện thoại']) === phone); if(!cus) return;
    
    let msg = isRefund ? `Xác nhận bạn đã TRẢ LẠI ${formatMoney(amount)} cho khách hàng này?` : `Xác nhận THU NỢ: ${formatMoney(amount)} của khách hàng này?`;
    if(!confirm(msg)) return;

    if(isRefund) { cus['Đã Thu Nợ'] = (Number(cus['Đã Thu Nợ']) || 0) - amount; } 
    else { cus['Đã Thu Nợ'] = (Number(cus['Đã Thu Nợ']) || 0) + amount; }
    
    syncCustomerStatsToSheet(phone); closeModal('payDebtModal'); 
    renderCustomersData(); alert("✅ Thanh toán nợ thành công!");
}

function deleteCustomer(phone) {
    let stats = calcCustomerStats(phone);
    if(stats.totalOrders > 0) return alert("Không thể xóa khách hàng đã có lịch sử đơn hàng!");
    if(!confirm("Xác nhận xóa khách hàng này?")) return;
    ALL_CUSTOMERS = ALL_CUSTOMERS.filter(c => cleanPhone(c['Điện thoại']) !== cleanPhone(phone));
    localStorage.setItem('ALL_CUSTOMERS', JSON.stringify(ALL_CUSTOMERS));
    addQueueItem('deleteCustomer', { phone: phone }); renderCustomersData();
}
