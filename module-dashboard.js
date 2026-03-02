function drawChart(labels, data, chartTitleText) {
    let ct = document.getElementById('chartTitle'); if(ct) ct.innerText = chartTitleText;
    if(typeof Chart === 'undefined') { setTimeout(() => drawChart(labels, data, chartTitleText), 1000); return; }
    let ctx = document.getElementById('revenueChart'); if(!ctx) return;
    if(myChart && typeof myChart.destroy === 'function') myChart.destroy(); 
    myChart = new Chart(ctx.getContext('2d'), { type: 'line', data: { labels: labels, datasets: [{ label: 'Doanh thu', data: data, borderColor: '#0070f4', backgroundColor: 'rgba(0, 112, 244, 0.1)', borderWidth: 2, fill: true, tension: 0.3, pointBackgroundColor: '#fff' }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { callback: function(val) { return val.toLocaleString('vi-VN'); } } } } } });
}

function renderAdvancedDashboard() {
    try {
        let filterEl = document.getElementById("dashTimeFilter"); let filter = filterEl ? filterEl.value : '7days'; 
        let now = new Date(); let curStart, curEnd, prevStart, prevEnd; let startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        if (filter === 'today') { curStart = startOfToday; curEnd = now; prevStart = new Date(startOfToday.getTime() - 86400000); prevEnd = startOfToday; } 
        else if (filter === 'yesterday') { curStart = new Date(startOfToday.getTime() - 86400000); curEnd = startOfToday; prevStart = new Date(curStart.getTime() - 86400000); prevEnd = curStart; } 
        else if (filter === '7days') { curStart = new Date(startOfToday.getTime() - 6 * 86400000); curEnd = now; prevStart = new Date(curStart.getTime() - 7 * 86400000); prevEnd = curStart; } 
        else if (filter === 'month') { curStart = new Date(now.getFullYear(), now.getMonth(), 1); curEnd = now; prevStart = new Date(now.getFullYear(), now.getMonth() - 1, 1); prevEnd = curStart; } 
        else if (filter === 'lastmonth') { curStart = new Date(now.getFullYear(), now.getMonth() - 1, 1); curEnd = new Date(now.getFullYear(), now.getMonth(), 1); prevStart = new Date(now.getFullYear(), now.getMonth() - 2, 1); prevEnd = curStart; } 
        else { curStart = new Date(2000,0,1); curEnd = now; prevStart = new Date(2000,0,1); prevEnd = curStart; }

        let curRev = 0, curCost = 0, curItems = 0, curOrders = 0, prevRev = 0; let chartMap = {}; let prodStats = {}; let custStats = {};

        ALL_ORDERS.forEach(o => {
            if(String(o['Trạng Thái']).trim() === 'Đã hủy' || String(o['Trạng Thái']).trim() === 'Nháp') return;
            let orderDate = parseDateString(o['Thời Gian']); 
            let isCur = orderDate >= curStart && orderDate <= curEnd; let isPrev = orderDate >= prevStart && orderDate < prevEnd;
            let rev = Number(String(o['Thành Tiền Sau CK']||o['Tổng Tiền']||0).replace(/[^0-9\-]/g,""));
            
            if(isCur) { 
                curRev += rev; curOrders++; let dKey = orderDate.getDate() + '/' + (orderDate.getMonth() + 1); chartMap[dKey] = (chartMap[dKey] || 0) + rev;
                let custKey = cleanPhone(o['SDT']) + '|' + String(o['Tên Khách Hàng'] || 'Vô danh').trim();
                if(!custStats[custKey]) custStats[custKey] = {name: o['Tên Khách Hàng'], phone: cleanPhone(o['SDT']), rev: 0, orders: 0};
                custStats[custKey].rev += rev; custStats[custKey].orders++;
                if(o['Chi Tiết JSON']) {
                    try { JSON.parse(String(o['Chi Tiết JSON'])).forEach(item => {
                        curItems += Number(item.soLuong);
                        let pInfo = ALL_PRODUCTS.find(p => String(p['Mã SP']).trim() === String(item.maSP).trim());
                        if(pInfo) { let keyGoc = getKeyByKeyword(pInfo, 'gốc') || getKeyByKeyword(pInfo, 'nhập'); curCost += (Number(String(pInfo[keyGoc]||0).replace(/[^0-9]/g,"")) * item.soLuong); }
                        if(!prodStats[item.maSP]) prodStats[item.maSP] = {name: item.tenSP, qty: 0}; 
                        prodStats[item.maSP].qty += Number(item.soLuong);
                    });
                    } catch(e) {}
                }
            }
            if(isPrev) prevRev += rev;
        });

        let profit = curRev - curCost; let margin = curRev > 0 ? ((profit / curRev) * 100).toFixed(1) : 0;
        let eR = document.getElementById('dashRev'); if(eR) eR.innerText = formatMoney(curRev); 
        let eC = document.getElementById('dashCost'); if(eC) eC.innerText = formatMoney(curCost);
        let eP = document.getElementById('dashProfit'); if(eP) eP.innerText = formatMoney(profit); 
        let eI = document.getElementById('dashItems'); if(eI) eI.innerText = curOrders + " / " + curItems;
        let eM = document.getElementById('dashMargin'); if(eM) eM.innerText = "Biên lợi nhuận: " + margin + "%";

        let compEl = document.getElementById('dashRevCompare');
        if(compEl) {
            if(prevRev > 0) {
                let pct = (((curRev - prevRev) / prevRev) * 100).toFixed(1);
                if(pct >= 0) { compEl.innerText = `▲ Tăng ${pct}% so với kỳ trước`; compEl.style.color = "#10b981"; } else { compEl.innerText = `▼ Giảm ${Math.abs(pct)}%`; compEl.style.color = "#ef4444"; }
            } else if (curRev > 0) { compEl.innerText = `▲ Tăng 100%`; compEl.style.color = "#10b981"; } else { compEl.innerText = `Không có dữ liệu kỳ trước`; compEl.style.color = "inherit"; }
        }

        let labels = [], data = [];
        if(filter !== 'all') {
            let tempD = new Date(curStart); tempD.setHours(0,0,0,0); let endD = new Date(curEnd);
            while(tempD <= endD) { let key = tempD.getDate() + '/' + (tempD.getMonth() + 1); labels.push(key); data.push(chartMap[key] || 0); tempD.setDate(tempD.getDate() + 1); }
        } else { labels = Object.keys(chartMap); data = Object.values(chartMap); }
        drawChart(labels, data, "Biểu đồ Doanh thu " + (filter==='today'?'Hôm nay': (filter==='yesterday'?'Hôm qua':`(Từ ${curStart.getDate()}/${curStart.getMonth()+1} - ${curEnd.getDate()}/${curEnd.getMonth()+1})`)));

        let prodArr = Object.values(prodStats).sort((a,b) => b.qty - a.qty).slice(0, 10);
        let phtml = '<table style="width:100%; font-size:13px; border-collapse:collapse; table-layout:auto;">';
        prodArr.forEach((p, i) => { phtml += `<tr><td style="padding:10px 0; border-bottom:1px dashed #444;"><b>#${i+1}</b> ${p.name}</td><td style="text-align:right; color:#10b981; border-bottom:1px dashed #444;"><b>${p.qty}</b> sp</td></tr>`; });
        let tp = document.getElementById('topProductsTable'); if(tp) tp.innerHTML = phtml || '<div style="opacity:0.6;">Chưa có dữ liệu.</div>';

        let custArr = Object.values(custStats).sort((a,b) => b.rev - a.rev).slice(0, 10);
        let chtml = '<table style="width:100%; font-size:13px; border-collapse:collapse; table-layout:auto;">';
        custArr.forEach((c, i) => { chtml += `<tr><td style="padding:10px 0; border-bottom:1px dashed #444;"><b>#${i+1}</b> ${c.name}</td><td style="text-align:right; color:#3b82f6; border-bottom:1px dashed #444;"><b>${formatMoney(c.rev)}</b></td></tr>`; });
        let tc = document.getElementById('topCustomersTable'); if(tc) tc.innerHTML = chtml || '<div style="opacity:0.6;">Chưa có dữ liệu.</div>';
    } catch(err) { console.error("Lỗi Render Dashboard:", err); }
}