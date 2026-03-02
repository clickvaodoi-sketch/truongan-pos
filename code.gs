const SHEET_ID = '1sQtuh32Leh3SKB2k3l4D3vXUQyZSMCYdWlaqB-i2DLM';

function doGet(e) {
  const type = e.parameter.type;
  if (type === "dashboard") return json({ totalOrders: 0, totalRevenue: 0 });
  if (type === "products") return json(getSheetData(getSafeSheet(['SanPham', 'Sản Phẩm', 'SẢN PHẨM'])));
  if (type === "orders") return json(getSheetData(getSafeSheet(['DonHang', 'Đơn Hàng', 'ĐƠN HÀNG'])).reverse());
  if (type === "customers") return json(getSheetData(getSafeSheet(['KhachHang', 'Khách Hàng', 'KHÁCH HÀNG'])));
  return json({ error: "Tham số không hợp lệ" });
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    if (data.action === "syncBatch") return json(processBatch(data.queue));
    return json({ success: false });
  } catch(err) { return json({ success: false, error: err.message }); }
}

function processBatch(queue) {
  let results = [];
  queue.forEach(item => {
    try {
      if (item.action === "addOrder") addOrder(item.data);
      else if (item.action === "updateStatus") updateStatus(item.data.id, item.data.status);
      else if (item.action === "deleteOrder") deleteOrder(item.data.id);
      else if (item.action === "updateOrder") updateOrder(item.data); 
      else if (item.action === "updateProduct") updateProduct(item.data); 
      else if (item.action === "deleteProduct") deleteProduct(item.data['Mã SP']); 
      else if (item.action === "updateCustomer") updateCustomer(item.data); 
      else if (item.action === "deleteCustomer") deleteCustomer(item.data.phone); 
      results.push({id: item.id, status: 'success'});
    } catch(err) { results.push({id: item.id, status: 'error', error: err.message}); }
  });
  return { success: true, results: results };
}

function getSafeSheet(names) {
  let ss = SpreadsheetApp.openById(SHEET_ID);
  for (let n of names) { let sh = ss.getSheetByName(n); if (sh) return sh; }
  return ss.insertSheet(names[0]);
}

function autoCreateCols(sheet, neededCols) {
  let lastCol = sheet.getLastColumn();
  let headers = [];
  if (lastCol === 0) { 
    sheet.getRange(1, 1, 1, neededCols.length).setValues([neededCols]).setFontWeight("bold").setBackground("#f3f4f6");
    return neededCols;
  }
  headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  neededCols.forEach(col => {
    if (!headers.some(h => String(h).trim().toLowerCase() === String(col).trim().toLowerCase())) {
      sheet.insertColumnAfter(headers.length);
      sheet.getRange(1, headers.length + 1).setValue(col).setFontWeight("bold").setBackground("#f3f4f6");
      headers.push(col); 
    }
  });
  return headers; 
}

function addOrder(data) {
  const sheet = getSafeSheet(['DonHang', 'Đơn Hàng', 'ĐƠN HÀNG']);
  // CHUẨN HÓA TÊN CỘT TRÁNH ĐẺ CỘT LẠ
  const headers = autoCreateCols(sheet, ["Mã Đơn", "Thời Gian", "Tên Khách Hàng", "SDT", "Địa Chỉ", "Ghi Chú", "Tổng SP", "Tổng Tiền", "Chiết Khấu %", "Thành Tiền Sau Chiết Khấu", "Chi Tiết JSON", "Trạng Thái", "Khách Thanh Toán", "Còn Nợ", "Loại Đơn"]); 
  let newRow = new Array(headers.length).fill("");
  headers.forEach((h, i) => {
    let val = data[String(h).trim()];
    if (val !== undefined) { if (String(h).trim().toLowerCase() === 'sdt' && val) val = "'" + val; newRow[i] = val; }
  });
  sheet.appendRow(newRow);
}

function updateOrder(data) {
  const sheet = getSafeSheet(['DonHang', 'Đơn Hàng', 'ĐƠN HÀNG']);
  // CHUẨN HÓA TÊN CỘT TRÁNH ĐẺ CỘT LẠ
  const headers = autoCreateCols(sheet, ["Mã Đơn", "Thời Gian", "Tên Khách Hàng", "SDT", "Địa Chỉ", "Ghi Chú", "Tổng SP", "Tổng Tiền", "Chiết Khấu %", "Thành Tiền Sau Chiết Khấu", "Chi Tiết JSON", "Trạng Thái", "Khách Thanh Toán", "Còn Nợ", "Loại Đơn"]);
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return; 
  let idCol = headers.findIndex(h => String(h).trim().toLowerCase() === 'mã đơn');
  for (let i = 1; i < values.length; i++) {
    if (String(values[i][idCol]) === String(data['Mã Đơn'])) {
      headers.forEach((h, cIdx) => { 
        let val = data[h]; if (String(h).trim().toLowerCase() === 'sdt' && val) val = "'" + val;
        if (val !== undefined) sheet.getRange(i + 1, cIdx + 1).setValue(val); 
      }); break;
    }
  }
}

function updateCustomer(data) {
  const sheet = getSafeSheet(['KhachHang', 'Khách Hàng', 'KHÁCH HÀNG']);
  // CHUẨN HÓA TÊN CỘT THEO THUẬT TOÁN MỚI
  const headers = autoCreateCols(sheet, ["Mã khách hàng", "Tên khách hàng", "Điện thoại", "Địa Chỉ", "Nhóm KH", "Nợ Đầu Kỳ", "Đã Thu Nợ", "Tổng Nợ Thực Tế", "Tổng đơn hàng", "Tổng mua"]);
  let values = sheet.getDataRange().getValues();
  if (values.length === 0) values = [headers];
  let phoneCol = headers.findIndex(h => String(h).trim().toLowerCase() === 'điện thoại' || String(h).trim().toLowerCase() === 'sdt');
  let found = false;
  
  for (let i = 1; i < values.length; i++) {
    if (String(values[i][phoneCol]).replace(/'/g, "").trim() === String(data['Điện thoại'] || data['SDT']).replace(/'/g, "").trim()) {
      headers.forEach((h, cIdx) => { 
        let val = data[h] !== undefined ? data[h] : data[String(h).replace(/điện thoại/i, 'SDT')];
        if (String(h).trim().toLowerCase().includes('điện thoại') && val) val = "'" + val;
        if (val !== undefined) sheet.getRange(i + 1, cIdx + 1).setValue(val); 
      }); found = true; break;
    }
  }
  if (!found) {
    let newRow = new Array(headers.length).fill("");
    headers.forEach((h, i) => { 
        let val = data[h] !== undefined ? data[h] : data[String(h).replace(/điện thoại/i, 'SDT')];
        if (String(h).trim().toLowerCase().includes('điện thoại') && val) val = "'" + val;
        if (val !== undefined) newRow[i] = val; 
    }); sheet.appendRow(newRow);
  }
}

function updateProduct(data) {
  const sheet = getSafeSheet(['SanPham', 'Sản Phẩm', 'SẢN PHẨM']);
  // CHUẨN HÓA TÊN CỘT THEO YÊU CẦU MỚI (LOẠI - N)
  const headers = autoCreateCols(sheet, ["Mã SP", "Tên SP", "Loại - N", "Tồn kho", "Đang đặt", "Sỉ từ", "Giá bán sỉ", "Giá bán lẻ", "Giá gốc", "% Khuyến mãi", "Giá khuyến mãi"]);
  let values = sheet.getDataRange().getValues(); 
  if (values.length === 0) values = [headers];
  let idCol = headers.findIndex(h => String(h).trim().toLowerCase() === 'mã sp');
  let found = false;
  for (let i = 1; i < values.length; i++) {
    if (String(values[i][idCol]).trim().toUpperCase() === String(data['Mã SP']).trim().toUpperCase()) {
      headers.forEach((h, cIdx) => { if (data[h] !== undefined) sheet.getRange(i + 1, cIdx + 1).setValue(data[h]); });
      found = true; break;
    }
  }
  if(!found) {
     let newRow = new Array(headers.length).fill("");
     headers.forEach((h, i) => { if (data[h] !== undefined) newRow[i] = data[h]; });
     sheet.appendRow(newRow);
  }
}

function deleteProduct(id) {
  const sheet = getSafeSheet(['SanPham', 'Sản Phẩm', 'SẢN PHẨM']);
  const values = sheet.getDataRange().getValues();
  if(values.length < 2) return;
  let idCol = values[0].findIndex(h => String(h).trim().toLowerCase() === 'mã sp');
  for(let i = values.length - 1; i > 0; i--) { 
      if(String(values[i][idCol]).trim().toUpperCase() === String(id).trim().toUpperCase()) { 
          sheet.deleteRow(i + 1); 
          break; 
      } 
  }
}

function deleteCustomer(phone) {
  const sheet = getSafeSheet(['KhachHang', 'Khách Hàng', 'KHÁCH HÀNG']);
  const values = sheet.getDataRange().getValues();
  if(values.length < 2) return;
  let pCol = values[0].findIndex(h => String(h).trim().toLowerCase().includes('điện thoại') || String(h).trim().toLowerCase().includes('sdt'));
  for(let i=1; i<values.length; i++) { 
      if(String(values[i][pCol]).replace(/'/g, "").trim() === String(phone).replace(/'/g, "").trim()) { sheet.deleteRow(i+1); break; } 
  }
}

function updateStatus(id, status) {
  const sheet = getSafeSheet(['DonHang', 'Đơn Hàng', 'ĐƠN HÀNG']);
  const values = sheet.getDataRange().getValues(); 
  if(values.length === 0) return;
  let idCol = values[0].findIndex(h => String(h).trim().toLowerCase() === 'mã đơn');
  let sCol = values[0].findIndex(h => String(h).trim().toLowerCase() === 'trạng thái');
  for (let i = 1; i < values.length; i++) {
    if (String(values[i][idCol]) === String(id)) { sheet.getRange(i + 1, sCol + 1).setValue(status); break; }
  }
}

function deleteOrder(id) {
  const sheet = getSafeSheet(['DonHang', 'Đơn Hàng', 'ĐƠN HÀNG']);
  const values = sheet.getDataRange().getValues();
  if(values.length === 0) return;
  let idCol = values[0].findIndex(h => String(h).trim().toLowerCase() === 'mã đơn');
  for(let i = 1; i < values.length; i++) { if(String(values[i][idCol]) === String(id)) { sheet.deleteRow(i + 1); break; } }
}

function getSheetData(sheet) {
  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return []; 
  const headers = data[0];
  return data.slice(1).map(row => { 
      let obj = {}; 
      headers.forEach((h, j) => { 
          let val = (row[j] !== null && row[j] !== undefined) ? row[j] : ""; 
          if (String(h).trim().toLowerCase().includes('điện thoại') || String(h).trim().toLowerCase().includes('sdt')) {
             if(String(val).startsWith("'")) val = String(val).substring(1);
          }
          obj[h] = val;
      }); return obj; 
  });
}
function json(data){ return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON); }
