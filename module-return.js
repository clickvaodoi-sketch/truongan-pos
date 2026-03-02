let returnCart = []; let returnTypeContext = ''; 

function openReturnModal() {
    returnCart = []; document.getElementById('returnSearchInput').value = ''; document.getElementById('returnNote').value = '';
    document.getElementById('returnSearchInfo').innerHTML = ''; renderReturnCart(); document.getElementById('returnModal').style.display = 'flex';
}

function searchReturnItem() {
    let input = String(document.getElementById('returnSearchInput').value).trim().toLowerCase(); if(!input) return;
    let infoEl = document.getElementById('returnSearchInfo'); let inputPhoneClean = cleanPhone(input);
    let order = ALL_ORDERS.find(o => String(o['Mã Đơn']).toLowerCase() === input || String(o['Mã Đơn']).toLowerCase().includes(input));
    
    if(!order) {
        let matchedOrders = ALL_ORDERS.filter(o => (inputPhoneClean && cleanPhone(o['SDT']) === inputPhoneClean) || String(o['Tên Khách Hàng']).toLowerCase().includes(input));
        matchedOrders = matchedOrders.filter(o => String(o['Trạng Thái']) !== 'Đã hủy' && String(o['Trạng Thái']) !== 'Nháp');
        if(matchedOrders.length > 0) { matchedOrders.sort((a,b) => parseDateString(b['Thời Gian']).getTime() - parseDateString(a['Thời Gian']).getTime()); order = matchedOrders[0]; }
    }

    if(order) {
        if(String(order['Trạng Thái']) === 'Đã hủy') { infoEl.innerHTML = `<span style="color:red;">❌ Đơn ${order['Mã Đơn']} đã hủy!</span>`; return; }
        infoEl.innerHTML = `<span style="color:#10b981;">✔️ Tìm thấy đơn gần nhất: <b>${order['Mã Đơn']}</b> - Khách: ${order['Tên Khách Hàng']}</span>`;
        returnTypeContext = 'ORDER'; returnCart = []; 
        if(order['Chi Tiết JSON']) {
            try {
                JSON.parse(order['Chi Tiết JSON']).forEach(i => {
                    if(i.soLuong > 0) returnCart.push({ maSP: i.maSP, tenSP: i.tenSP, soLuongMax: i.soLuong, soLuongTra: i.soLuong, giaHoanTien: i.giaBan, isLockedPrice: true });
                });
            } catch(e) {}
        }
    } else {
        let p = ALL_PRODUCTS.find(x => String(x['Mã SP']).toLowerCase() === input || String(x['Tên SP']).toLowerCase().includes(input));
        if(!p) { infoEl.innerHTML = `<span style="color:red;">❌ Không tìm thấy thông tin phù hợp!</span>`; return; }
        infoEl.innerHTML = `<span style="color:#3b82f6;">⚡ Chế độ trả hàng lẻ (SP: ${p['Tên SP']})</span>`;
        returnTypeContext = 'QUICK';
        let keyLe = getKeyByKeyword(p, 'lẻ') || getKeyByKeyword(p, 'bán'); let giaGoiY = Number(String(p[keyLe]||0).replace(/[^0-9]/g,""));
        let exist = returnCart.find(i => i.maSP === p['Mã SP']);
        if(exist) { exist.soLuongTra += 1; } else { returnCart.push({ maSP: p['Mã SP'], tenSP: p['Tên SP'], soLuongMax: 9999, soLuongTra: 1, giaHoanTien: giaGoiY, isLockedPrice: false }); }
    }
    document.getElementById('returnSearchInput').value = ''; renderReturnCart();
}

function renderReturnCart() {
    let html = ''; let totalRefund = 0;
    returnCart.forEach((i, idx) => {
        let thanhTien = i.soLuongTra * i.giaHoanTien; totalRefund += thanhTien;
        html += `<div style="display:flex; justify-content:space-between; align-items:center; padding:8px 0; border-bottom:1px dashed #eee; color:inherit;">
            <div style="flex:2;"><b>${i.maSP} - ${i.tenSP}</b>${i.isLockedPrice ? `<br><small style="color:#10b981;">(Giá gốc: ${formatMoney(i.giaHoanTien)})</small>` : ''}</div>
            <div style="flex:1; display:flex; gap:5px; align-items:center;"><label style="font-size:10px; opacity:0.7;">SL Trả:</label><input type="number" class="item-edit-input" style="width:50px; border-color:#ef4444;" value="${i.soLuongTra}" min="1" max="${i.soLuongMax}" onchange="updateReturnItem(${idx}, 'qty', this.value)"/></div>
            <div style="flex:1.5; display:flex; gap:5px; align-items:center;"><label style="font-size:10px; opacity:0.7;">Giá hoàn:</label><input type="number" class="item-edit-input" style="width:80px;" value="${i.giaHoanTien}" ${i.isLockedPrice ? 'disabled title="Thu hồi theo đúng giá lúc mua"' : ''} oninput="updateReturnItem(${idx}, 'price', this.value)"/></div>
            <div style="flex:1; text-align:right; font-weight:bold; color:#ef4444;">${formatMoney(thanhTien)}</div>
            <button class="action-btn gray" style="padding:4px 8px; margin-left:10px;" onclick="removeReturnItem(${idx})">X</button>
        </div>`;
    });
    let listEl = document.getElementById('returnCartList'); if(listEl) listEl.innerHTML = html || '<i style="opacity:0.6; font-size:12px;">Chưa có sản phẩm nào...</i>';
    let totEl = document.getElementById('returnTotalDisplay'); if(totEl) totEl.innerText = formatMoney(totalRefund);
}

function updateReturnItem(idx, field, val) {
    val = Number(val);
    if(field === 'qty') { if(val > returnCart[idx].soLuongMax) { alert('Vượt quá số lượng mua trong đơn gốc!'); val = returnCart[idx].soLuongMax; } returnCart[idx].soLuongTra = val > 0 ? val : 1; } 
    else if(field === 'price') { returnCart[idx].giaHoanTien = val >= 0 ? val : 0; }
    renderReturnCart();
}

function removeReturnItem(idx) { returnCart.splice(idx, 1); renderReturnCart(); }

function processReturn() {
    if(returnCart.length === 0) return alert("Chưa có sản phẩm nào để trả!");
    if(!confirm("Xác nhận hoàn trả kho và tạo biên lai hoàn tiền?")) return;
    let totalRefund = 0; let returnItemsForOrder = [];
    returnCart.forEach(i => {
        let p = ALL_PRODUCTS.find(x => x['Mã SP'] === i.maSP);
        if(p) { let keyTonKho = getKeyByKeyword(p, 'tồn kho') || 'Tồn kho'; p[keyTonKho] = (Number(p[keyTonKho]) || 0) + i.soLuongTra; addQueueItem('updateProduct', p); }
        totalRefund += (i.soLuongTra * i.giaHoanTien);
        returnItemsForOrder.push({ maSP: i.maSP, tenSP: i.tenSP, soLuong: -Math.abs(i.soLuongTra), giaBan: i.giaHoanTien, thanhTien: -Math.abs(i.soLuongTra * i.giaHoanTien) });
    });
    localStorage.setItem('ALL_PRODUCTS', JSON.stringify(ALL_PRODUCTS));
    let mockId = "RET_" + Date.now().toString().slice(-5); let note = document.getElementById('returnNote').value || (returnTypeContext === 'ORDER' ? 'Hoàn trả từ đơn gốc' : 'Trả hàng nhanh');
    let newNegativeOrder = { "Mã Đơn": mockId, "Thời Gian": new Date().toLocaleString('vi-VN'), "Tên Khách Hàng": "Khách Trả Hàng", "SDT": "", "Địa Chỉ": "", "Ghi Chú": note, "Tổng SP": -returnItemsForOrder.reduce((sum, i) => sum + Math.abs(i.soLuong), 0), "Tổng Tiền": -totalRefund, "Chiết Khấu %": 0, "Thành Tiền Sau CK": -totalRefund, "Chi Tiết JSON": JSON.stringify(returnItemsForOrder), "Trạng Thái": "Đã hoàn trả", "Khách Thanh Toán": -totalRefund, "Còn Nợ": 0, "Loại Đơn": "Hoàn Trả" };
    ALL_ORDERS.unshift(newNegativeOrder); localStorage.setItem('ALL_ORDERS', JSON.stringify(ALL_ORDERS)); addQueueItem('addOrder', newNegativeOrder);
    closeModal('returnModal'); if(currentPage === 'dashboard') renderAdvancedDashboard(); if(currentPage === 'orders') renderOrdersData(); if(currentPage === 'products') renderProductsData(); returnCart = [];
}