<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE html>
<html b:version='2' class='v2' expr:dir='data:blog.languageDirection' xmlns='http://www.w3.org/1999/xhtml' xmlns:b='http://www.google.com/2005/gml/b' xmlns:data='http://www.google.com/2005/gml/data' xmlns:expr='http://www.google.com/2005/gml/expr'>

<head>
<b:include data='blog' name='all-head-content'/>
<meta content='width=device-width, initial-scale=1, maximum-scale=1' name='viewport'/>
<title>Trường An Store - ERP PRO V31</title>

<script src='https://cdn.jsdelivr.net/npm/chart.js@3.9.1/dist/chart.min.js' type='text/javascript'></script>

<b:skin><![CDATA[
/* =========================================
   1. CORE UI VÀ HEADER 
========================================= */
body { margin:0; font-family:-apple-system,BlinkMacSystemFont,sans-serif; background:#f4f6fb; color:#333; padding-bottom:70px; padding-top:60px; transition: background 0.3s, color 0.3s; }
* { box-sizing: border-box; }

.header { background:linear-gradient(135deg,#0070f4,#00c6ff); color:#fff; padding:10px 15px; display:flex; justify-content:space-between; align-items:center; position:fixed; top:0; left:0; width:100%; z-index:999; box-shadow:0 2px 10px rgba(0,0,0,0.15); transition: background 0.3s;}
.header-title { font-weight:bold; font-size:18px; white-space:nowrap; letter-spacing: 1px;}
.header-btns { display:flex; gap:8px; align-items:center; }
.icon-btn { background:rgba(255,255,255,0.2); border:none; color:#fff; padding:8px 10px; border-radius:8px; cursor:pointer; font-size:14px; display:flex; align-items:center; gap:5px; position:relative; transition:0.2s; white-space:nowrap; font-weight:600;}
.icon-btn:hover { background:rgba(255,255,255,0.3); }
.badge { position:absolute; top:-5px; right:-5px; background:#ef4444; color:#fff; font-size:10px; padding:2px 5px; border-radius:10px; font-weight:bold; }

.nav { display:flex; justify-content:space-around; background:#fff; padding:12px 0; position:fixed; bottom:0; width:100%; box-shadow:0 -2px 10px rgba(0,0,0,0.1); z-index:998; transition: background 0.3s, box-shadow 0.3s;}
.nav div { font-size:22px; cursor:pointer; padding:5px 15px; border-radius:10px; transition:0.2s; text-align:center; flex:1; color:#555; }
.nav div:hover { background:#f0f4f8; }
.nav div.active { color:#0070f4; font-weight:bold; }

.section { padding:15px; width:100%; max-width:100%; margin:0 auto; }
.view-section { display:none; } 

#loadingUI { position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(255,255,255,0.95); z-index:9999; display:flex; justify-content:center; align-items:center; font-size:18px; font-weight:bold; color:#0070f4; flex-direction:column; gap:15px; }
.spinner { width: 50px; height: 50px; border: 5px solid #e0e0e0; border-top-color: #0070f4; border-radius: 50%; animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* =========================================
   2. BỘ LỌC TÌM KIẾM
========================================= */
.tab-search-bar { width:100%; padding:12px 15px; border-radius:8px; border:1px solid #ddd; outline:none; font-size:14px; background:#fff; margin-bottom: 15px; transition:0.2s;}
.tab-search-bar:focus { border-color:#0070f4; box-shadow:0 0 0 2px rgba(0,112,244,0.1); }

/* =========================================
   3. UI THẺ VÀ BẢNG THÔNG MINH
========================================= */
.dashboard-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 20px; }
.dashboard-metric { min-height: 140px; display: flex; flex-direction: column; justify-content: center; padding: 20px; text-align: center; overflow: hidden; background:#fff; border-radius:12px; box-shadow:0 2px 8px rgba(0,0,0,0.06); transition: background 0.3s, border-color 0.3s;}
.chart-container { height: 280px; position: relative; width: 100%; background:#fff; border-radius:12px; box-shadow:0 2px 8px rgba(0,0,0,0.06); padding:20px; transition: background 0.3s, border-color 0.3s;}

.data-grid { display:grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap:15px; }
.card { background:#fff; padding:15px; border-radius:12px; box-shadow:0 2px 8px rgba(0,0,0,0.06); display:flex; flex-direction:column; border:1px solid #f0f0f0; position:relative; transition: background 0.3s, border-color 0.3s; }
.card-img-top { width:100%; height:200px; object-fit:contain; border-radius:8px; margin-bottom:12px; border:1px solid #eee; cursor:pointer; background:#fafafa; order:-1; }
.card-header { font-size:15px; font-weight:bold; color:#0070f4; border-bottom:1px dashed #eee; padding-bottom:8px; margin-bottom:10px; display:flex; justify-content:space-between; align-items:center;}
.card-row { display:flex; justify-content:space-between; margin-bottom:6px; font-size:14px; }
.card-row .lbl { color:#666; font-size:13px; min-width: 80px;}
.card-row .val { font-weight:500; text-align:right; max-width:65%; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;}

.btn-edit-tiny { position:absolute; top:10px; left:10px; background:rgba(255,255,255,0.9); border:1px solid #eee; border-radius:50%; width:32px; height:32px; display:flex; justify-content:center; align-items:center; cursor:pointer; font-size:14px; z-index:10; box-shadow:0 2px 5px rgba(0,0,0,0.1); transition:0.2s; color:#0070f4; }
.btn-edit-tiny:hover { background:#0070f4; color:#fff; border-color:#0070f4; }

/* FIX BẢNG & TỶ LỆ CỘT */
.table-responsive { width:100%; background:#fff; border-radius:10px; border:1px solid #f0f0f0; transition: background 0.3s; overflow-x: auto; -webkit-overflow-scrolling: touch; }
table { width:100%; border-collapse:collapse; table-layout: fixed; min-width: 900px;}

th, td { padding: 12px 10px; text-align: left; vertical-align: middle; box-sizing: border-box; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;}
th { background:#4285f4; color:#fff; font-weight:600; font-size:13px; border:none; position:relative; }
td { border-bottom:1px solid #eee; font-size:13px; }
tr:hover { background:#f8fafc; }

th.text-center, td.text-center { text-align: center; }
th.text-right, td.text-right { text-align: right; }
th.text-left, td.text-left { text-align: left; }

th.col-check, td.col-check { width: 40px; text-align: center; }
th.col-action, td.col-action { width: 120px; text-align: center; }
td.actions { white-space: nowrap; overflow: visible; display:flex; gap:5px; align-items:center; justify-content:center; border-bottom:none; padding-bottom:0;}

.col-id { width: 110px; }
.col-phone { width: 120px; }
.col-money { width: 120px; text-align: right; }

.th-cus-id { width: 90px; }
.th-cus-name { width: auto; min-width: 200px; } 
.th-cus-phone { width: 130px; }
.th-cus-group { width: 100px; text-align: center; }
.th-cus-debt { width: 120px; text-align: right; }
.th-cus-order { width: 60px; text-align: center; }
.th-cus-spent { width: 120px; text-align: right; }
.th-cus-action { width: 130px; text-align: center; }

.resizer { position: absolute; top: 0; right: 0; width: 5px; cursor: col-resize; user-select: none; z-index: 1; height: 100%; }
.resizer:hover, .resizing { border-right: 2px solid #fff; background: rgba(255,255,255,0.2); }

.editable-cell { cursor:text; border:1px dashed transparent; padding:4px 8px !important; border-radius:4px; transition:0.2s; }
.editable-cell:focus { background:inherit; border-color:#0070f4; outline:none; box-shadow:0 0 0 2px rgba(0,112,244,0.1); }

.cat-cell-inline { cursor:pointer; font-weight:500; transition:0.2s; }
.cat-cell-inline:hover { background:#f0fdfa; }
.cat-badge { background: #e0f2fe; color: #0369a1; padding: 4px 8px; border-radius: 6px; font-size: 11px; margin-right: 4px; display: inline-block; border: 1px solid #bae6fd; font-weight:bold; }
.cat-badge.si { background: #fce7f3; color: #be185d; border-color:#fbcfe8; } 
.out-of-stock-id { color: #ef4444 !important; font-weight: bold; background: #fee2e2; padding: 2px 6px; border-radius: 4px;}

@media (max-width: 768px) { th, td { padding: 10px 8px; font-size: 12px; } .hide-on-mobile { display:none; } table { min-width: auto; table-layout: auto; display:block; } .resizer { display:none; } }

/* =========================================
   4. CÔNG CỤ VÀ MENU CHUNG
========================================= */
.sub-toolbar { display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; background:#fff; padding:10px 15px; border-radius:10px; flex-wrap:wrap; gap:10px; box-shadow:0 1px 4px rgba(0,0,0,0.05); transition:background 0.3s; }
.view-toggle { display:flex; background:#f0f2f5; border-radius:20px; overflow:hidden; padding:3px; }
.view-toggle button { padding:6px 15px; border:none; background:transparent; cursor:pointer; font-size:13px; border-radius:18px; font-weight:600; color:#555;}
.view-toggle button.active { background:#0070f4; color:#fff; }

.cat-filter-bar { display:flex; gap:8px; overflow-x:auto; padding-bottom:10px; margin-bottom:5px; }
.cat-tag { padding:6px 15px; border-radius:20px; background:#fff; border:1px solid #ddd; font-size:13px; cursor:pointer; white-space:nowrap; transition:0.2s; color:#555; font-weight:500;}
.cat-tag.active { background:#0070f4; color:#fff; border-color:#0070f4; }

button.action-btn { padding:8px 10px; border:none; border-radius:6px; color:#fff; cursor:pointer; font-weight:bold; font-size:12px; transition:0.2s; display:inline-flex; align-items:center; justify-content:center;}
button.action-btn:disabled { background:#d1d5db !important; cursor:not-allowed !important; opacity:0.6; }
.green { background:#10b981 } .red { background:#ef4444 } .blue { background:#0070f4 } .gray { background:#64748b } .orange { background:#f59e0b }

input.form-inp, select.form-inp, textarea.form-inp { width:100%; padding:10px 15px; margin-top:4px; margin-bottom:10px; border-radius:8px; border:1px solid #ddd; font-size:13px; outline:none; transition:0.2s; background:#fff; color:inherit;}
input.form-inp:focus, textarea.form-inp:focus { border-color:#0070f4; box-shadow:0 0 0 2px rgba(0,112,244,0.1); }
.price-text { color:#d32f2f; font-weight:bold; }
.inline-km-inp { width:65px; padding:4px 8px; border:1px solid #ccc; border-radius:4px; text-align:center; font-size:12px; outline:none; transition:0.2s; color:inherit;}

.dropdown { position:relative; }
.dropdown-content { display:none; position:absolute; right:0; top:45px; background:#fff; min-width:220px; box-shadow:0 8px 25px rgba(0,0,0,0.2); border-radius:12px; z-index:1001; max-height:60vh; overflow-y:auto; border:1px solid #eee; padding:5px 0;}
.dropdown-content.show { display:block; }
.dropdown-content label { display:flex; align-items:center; gap:10px; padding:10px 15px; cursor:pointer; font-size:14px; border-bottom:1px solid #eee; margin:0; color:inherit !important;}

.chk-box, .chk-order-box { width:18px; height:18px; cursor:pointer; accent-color:#0070f4;}
.bulk-bar { display:none; background:#e0f2fe; padding:15px; border-radius:12px; margin-bottom:15px; flex-direction:column; border:1px solid #bae6fd; }
.bulk-grid { display:grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap:10px; width:100%; }

/* MODALS */
.modal { display:none; position:fixed; z-index:2000; left:0; top:0; width:100%; height:100%; background:rgba(0,0,0,0.6); align-items:center; justify-content:center; padding:15px; backdrop-filter: blur(2px);}
.modal-content { background:#fff; padding:25px; border-radius:15px; width:100%; max-width:650px; max-height:85vh; overflow-y:auto; position:relative; box-shadow: 0 10px 30px rgba(0,0,0,0.3); transition: background 0.3s;}
.close-btn { position:absolute; right:15px; top:15px; font-size:20px; cursor:pointer; background:#f0f2f5; border:none; width:35px; height:35px; border-radius:50%; z-index:2005; display:flex; align-items:center; justify-content:center; color:#333; transition:0.2s;}
.close-btn:hover { background:#fee2e2; color:#ef4444; }

.auto-calc-box { background:#f0fdf4; padding:12px; border-radius:8px; margin-bottom:15px; border:1px solid #bbf7d0; display:flex; flex-wrap:wrap; gap:10px; }
.vip-badge { background:#f59e0b; color:#fff; font-size:10px; padding:2px 6px; border-radius:10px; margin-left:5px; font-weight:bold; vertical-align:middle; box-shadow:0 1px 3px rgba(245,158,11,0.4); }
.summary-box { margin-bottom:15px; padding:15px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; }
.summary-row { display:flex; justify-content:space-between; font-size:13px; margin-bottom:5px;}
.summary-row.discount { color:#059669; }
.summary-row.final { font-weight:bold; font-size:16px; color:#d32f2f; margin-top:8px; border-top:1px dashed #cbd5e1; padding-top:8px;}
.summary-row.tong-cong { font-weight:bold; font-size:20px; color:#10b981; background:#d1fae5; padding:8px; border-radius:6px; margin-top:8px;}

.item-edit-input { width: 100%; padding: 6px; border: 1px solid #ccc; border-radius: 4px; font-size: 13px; text-align: center; outline: none; transition: 0.2s; background:#fff; color:inherit;}
.item-edit-input:focus { border-color: #0070f4; box-shadow: 0 0 0 2px rgba(0,112,244,0.1); }
.form-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 15px; }
.form-grid-full { grid-column: span 2; }

/* ORDER DETAILS UI */
.order-detail-box { background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:12px; margin-bottom:15px; color:inherit; }
.order-detail-note { background:#fef2f2; border-left:4px solid #ef4444; padding:8px 12px; margin-bottom:15px; font-size:13px; color:#b91c1c; }
.order-item-row { display:flex; justify-content:space-between; margin-bottom:8px; border-bottom:1px dashed #f0f0f0; padding-bottom:8px; }

/* GỢI Ý KHÁCH HÀNG */
.suggest-box { position:absolute; background:#fff; width:100%; border:1px solid #0070f4; border-top:none; border-radius:0 0 8px 8px; z-index:3000; box-shadow:0 4px 15px rgba(0,112,244,0.2); display:none; max-height:200px; overflow-y:auto; top:100%; left:0;}
.suggest-item { padding:10px 15px; border-bottom:1px dashed #eee; cursor:pointer; font-size:13px; transition:0.2s; color:#333;}
.suggest-item:hover { background:#f0fdfa; padding-left:20px; }
.debt-badge { background:#fee2e2; color:#ef4444; font-size:10px; padding:2px 6px; border-radius:10px; margin-left:5px; font-weight:bold; }

/* UI CUSTOMER CARD MỚI */
.cus-card { display:flex; flex-direction:column; background:#fff; padding:15px; border-radius:12px; box-shadow:0 2px 8px rgba(0,0,0,0.06); border:1px solid #f0f0f0; transition:0.3s; position:relative; }
.cus-card-header { display:flex; align-items:center; gap:12px; margin-bottom:15px; padding-bottom:12px; border-bottom:1px dashed #eee; }
.cus-avt { width:45px; height:45px; border-radius:50%; background:linear-gradient(135deg,#0070f4,#00c6ff); color:#fff; display:flex; justify-content:center; align-items:center; font-size:20px; font-weight:bold; text-transform:uppercase; flex-shrink:0;}
.cus-avt-small { width:24px; height:24px; border-radius:50%; background:#0070f4; color:#fff; display:flex; justify-content:center; align-items:center; font-size:12px; font-weight:bold; flex-shrink:0; }
.cus-info { flex:1; overflow:hidden; }
.cus-info h4 { margin:0 0 4px 0; font-size:15px; color:#333; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; cursor:pointer; transition:0.2s;}
.cus-info h4:hover { color:#0070f4; text-decoration:underline; }
.cus-info span { font-size:13px; color:#666; display:flex; align-items:center; gap:5px; }
.cus-stats { display:grid; grid-template-columns: 1fr 1fr; gap:10px; background:#f8fafc; padding:10px; border-radius:8px; font-size:12px;}
.cus-stats div { display:flex; flex-direction:column; }
.cus-stats strong { font-size:14px; margin-top:3px; }

/* RETURN UI ELEMENTS */
.return-zone-box { background:#fef2f2; padding:15px; border-radius:8px; border:1px solid #fecaca; margin-bottom:15px; transition:0.3s; }
.return-list-box { min-height:100px; max-height:250px; overflow-y:auto; border:1px solid #ccc; border-radius:8px; padding:10px; margin-bottom:15px; background:#fff; transition:0.3s; }
.return-total-box { display:flex; justify-content:space-between; align-items:center; background:#f8fafc; padding:15px; border-radius:8px; border:1px solid #e2e8f0; margin-bottom:15px; transition:0.3s; }

/* CSS MÀN HÌNH ĐĂNG NHẬP BẢO MẬT */
#loginOverlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: #0f172a; z-index: 10000; display: flex; align-items: center; justify-content: center; flex-direction: column; }
.login-box { background: #1e293b; padding: 30px; border-radius: 15px; width: 90%; max-width: 350px; text-align: center; box-shadow: 0 10px 25px rgba(0,0,0,0.5); border: 1px solid #334155; }

/* =========================================
   5. DARK THEME GLOBAL
========================================= */
body.dark-theme { background: #0f172a; color: #f8fafc; }
body.dark-theme .header { background: #1e293b; border-bottom:1px solid #334155; box-shadow:none;}
body.dark-theme .nav { background: #1e293b; border-top: 1px solid #334155; box-shadow: none; }
body.dark-theme .nav div { color:#cbd5e1; }
body.dark-theme .nav div.active { color:#38bdf8; }
body.dark-theme .nav div:hover { background:#334155; }

body.dark-theme .card, body.dark-theme .cus-card, body.dark-theme .modal-content, body.dark-theme .sub-toolbar, body.dark-theme .table-responsive, body.dark-theme .chart-container, body.dark-theme .dashboard-metric { background: #1e293b; border:1px solid #334155; color: #f8fafc; box-shadow:0 4px 6px -1px rgba(0,0,0,0.1);}
body.dark-theme input.form-inp, body.dark-theme select.form-inp, body.dark-theme textarea.form-inp, body.dark-theme .tab-search-bar, body.dark-theme .item-edit-input, body.dark-theme .inline-km-inp { background: #334155; color: #f8fafc; border-color: #475569; }

body.dark-theme table { color: #f8fafc; border-color: #334155; }
body.dark-theme th { background: #1e3a8a; border-color: #334155; color:#cbd5e1; }
body.dark-theme td { border-color: #334155; }
body.dark-theme tr:hover { background: #334155; }

body.dark-theme .card-header { color:#38bdf8; border-color:#334155; }
body.dark-theme .card-row .lbl { color:#cbd5e1; }
body.dark-theme .cus-card-header { border-color:#334155; }
body.dark-theme .cus-info h4 { color:#f8fafc; }
body.dark-theme .cus-info span { color:#94a3b8; }
body.dark-theme .cus-stats { background: #0f172a; }

body.dark-theme .suggest-box, body.dark-theme .dropdown-content { background: #1e293b; border-color: #475569; color:#f8fafc; }
body.dark-theme .suggest-item, body.dark-theme .dropdown-content label { border-color:#334155; color:#f8fafc; }
body.dark-theme .suggest-item:hover, body.dark-theme .cat-cell-inline:hover { background: #38bdf8; color:#fff;}
body.dark-theme .view-toggle { background: #334155; }
body.dark-theme .view-toggle button { color: #cbd5e1; }
body.dark-theme .view-toggle button.active { background: #38bdf8; color: #fff; }
body.dark-theme .cat-tag { background: #334155; border-color: #475569; color: #f8fafc; }
body.dark-theme .cat-tag.active { background: #38bdf8; border-color: #38bdf8; color: #fff; }
body.dark-theme .summary-box, body.dark-theme .auto-calc-box { background: #0f172a; border-color: #334155; }
body.dark-theme .summary-row { color: #f8fafc; }
body.dark-theme .summary-row.discount { color: #34d399; }
body.dark-theme .summary-row.final { color: #f87171; border-color: #475569; }
body.dark-theme .summary-row.tong-cong { color: #10b981; background: #064e3b; border-color: #064e3b; }
body.dark-theme .close-btn { background: #334155; color:#f8fafc;}
body.dark-theme .close-btn:hover { background: #ef4444; color:#fff;}
body.dark-theme #loadingUI { background: rgba(15,23,42,0.95); color: #38bdf8; }
body.dark-theme .price-text { color:#f87171; }
body.dark-theme .bulk-bar { background: #1e293b; border-color: #3b82f6; }
body.dark-theme .cat-badge.si { background: #4c1d95; color: #fbcfe8; border-color:#831843; } 

/* ORDER DETAILS UI DARK MODE */
body.dark-theme .order-detail-box { background: #1e293b; border-color: #334155; color: #f8fafc; }
body.dark-theme .order-detail-note { background: #450a0a; border-color: #7f1d1d; color: #fca5a5; }
body.dark-theme .order-item-row { border-color: #334155; }

/* RETURN UI DARK MODE */
body.dark-theme .return-zone-box { background: #450a0a; border-color: #7f1d1d; }
body.dark-theme .return-zone-box label { color: #fca5a5 !important; }
body.dark-theme #returnSearchInfo { color: #cbd5e1 !important; }
body.dark-theme .return-list-box { background: #0f172a; border-color: #334155; color: #f8fafc; }
body.dark-theme .return-total-box { background: #0f172a; border-color: #334155; color: #f8fafc; }
body.dark-theme #returnTotalDisplay { color: #f87171; }
/* CSS cho bảng cảnh báo gộp trùng lặp */
.dup-group { border: 1px solid #ccc; border-radius: 8px; padding: 15px; margin-bottom: 15px; background: #fff; transition: background 0.3s, border-color 0.3s; }
.dup-group-list { margin: 10px 0; padding-left: 10px; border-left: 2px solid #ddd; transition: border-color 0.3s; }

/* Dark mode cho bảng gộp trùng lặp */
body.dark-theme .dup-group { background: #334155; border-color: #475569; color: #f8fafc; }
body.dark-theme .dup-group-list { border-color: #475569; }
]]></b:skin>
</head>

<body>
  <b:section id='main' showaddelement='yes'>
    <b:widget id='HTML1' locked='false' title='Smart POS' type='HTML' version='1'>
      <b:widget-settings>
        <b:widget-setting name='content'/>
      </b:widget-settings>
      <b:includable id='main'>

        <div id='loginOverlay' style='display:none;'>
          <div class='login-box'>
            <h2 style='color:#38bdf8; margin-bottom:20px;'>HỆ THỐNG NỘI BỘ</h2>
            <input class='form-inp' id='username' placeholder='Tên đăng nhập' type='text'></input>
            <input class='form-inp' id='password' placeholder='Mật khẩu' type='password'></input>
            <button class='action-btn blue' id='btnLogin' onclick='handleLogin()' style='width:100%; padding:12px; margin-top:10px;'>ĐĂNG NHẬP</button>
            <p style='color:#64748b; font-size:12px; margin-top:15px;'>Vui lòng liên hệ Admin để cấp quyền.</p>
          </div>
        </div>
        
        <div id='loadingUI'>
            <div class='spinner'></div>
            <div id='loadingText'>Đang kết nối hệ thống...</div>
        </div>

        <div class='header'>
          <div class='header-title'>TRƯỜNG AN STORE</div>
          <div class='header-btns'>
             <button class='icon-btn' onclick='hardResetCache()' title='Sửa lỗi kẹt dữ liệu' style='background:#64748b; color:#fff;'>🧹 Sửa Lỗi</button>
             <button class='icon-btn' onclick='openReturnModal()' style='background:#ef4444; color:#fff;' title='Trả hàng nhanh'>🔄 Trả Hàng</button>
             <button class='icon-btn' onclick='syncData(true)' title='Tải dữ liệu mới nhất từ Sheet'>&#11015;&#65039; Tải Về</button>
             <button class='icon-btn' id='syncBtnUI' onclick='pushSyncQueue()' title='Đẩy dữ liệu hiện tại lên Sheet'>&#11014;&#65039; Đẩy Lên</button>
             <button class='icon-btn' id='themeBtn' onclick='toggleTheme()' title='Đổi giao diện'>🌙</button>
             <button class='icon-btn' onclick='handleLogout()' title='Đăng xuất' style='background:#f59e0b; color:#fff;'>🚪</button>
             <span class='badge' id='syncBadge' style='display:none'>0</span>
          </div>
        </div>
        
        <div class='section' id='app'>
           <div class='view-section' id='view-dashboard'>
              <div class='sub-toolbar'>
                 <b style='font-size:16px;'>📊 TỔNG QUAN</b>
                 <select class='form-inp' id='dashTimeFilter' onchange='renderAdvancedDashboard()' style='width:auto; margin:0; padding:6px; font-weight:bold; color:#0070f4; border-color:#0070f4;'>
                    <option value='today'>Hôm nay</option><option value='yesterday'>Hôm qua</option><option selected='selected' value='7days'>7 Ngày qua</option>
                    <option value='month'>Tháng này</option><option value='lastmonth'>Tháng trước</option><option value='all'>Tất cả</option>
                 </select>
              </div>
              <div class='dashboard-grid'>
                 <div class='dashboard-metric'>
                    <span style='font-size:30px;'>💰</span><br/>
                    <span style='font-weight:600; font-size:13px; opacity:0.8;'>DOANH THU THỰC</span><br/>
                    <span id='dashRev' style='font-size:24px; font-weight:bold; color:#3b82f6; display:block; margin-top:8px;'>0 đ</span>
                    <span id='dashRevCompare' style='font-size:12px; color:#10b981; margin-top:5px; display:inline-block;'>+0%</span>
                 </div>
                 <div class='dashboard-metric'>
                    <span style='font-size:30px;'>📈</span><br/>
                    <span style='font-weight:600; font-size:13px; opacity:0.8;'>LỢI NHUẬN TẠM TÍNH</span><br/>
                    <span id='dashProfit' style='font-size:24px; font-weight:bold; color:#10b981; display:block; margin-top:8px;'>0 đ</span>
                    <span id='dashMargin' style='font-size:12px; opacity:0.8; margin-top:5px;'>Biên lãi: 0%</span>
                 </div>
                 <div class='dashboard-metric'>
                    <span style='font-size:30px;'>📉</span><br/>
                    <span style='font-weight:600; font-size:13px; opacity:0.8;'>CHI PHÍ VỐN</span><br/>
                    <span id='dashCost' style='font-size:24px; font-weight:bold; color:#ef4444; display:block; margin-top:8px;'>0 đ</span>
                 </div>
                 <div class='dashboard-metric'>
                    <span style='font-size:30px;'>📦</span><br/>
                    <span style='font-weight:600; font-size:13px; opacity:0.8;'>ĐƠN HÀNG / SP BÁN</span><br/>
                    <span id='dashItems' style='font-size:24px; font-weight:bold; color:#f59e0b; display:block; margin-top:8px;'>0 / 0</span>
                 </div>
              </div>
              <div class='chart-container'>
                 <h3 id='chartTitle' style='margin-top:0; margin-bottom:10px; font-size:15px;'>Biểu đồ Doanh thu</h3>
                 <div style='position:relative; height:calc(100% - 30px); width:100%;'>
                    <canvas id='revenueChart'></canvas>
                 </div>
              </div>
              <div style='display:flex; flex-wrap:wrap; gap:15px; margin-top:20px;'>
                 <div class='card' style='flex:1; min-width:300px;'><h3 style='margin-top:0; font-size:15px; border-bottom:1px dashed #eee; padding-bottom:10px;'>🏆 Top 10 Sản Phẩm Bán Chạy</h3><div id='topProductsTable'></div></div>
                 <div class='card' style='flex:1; min-width:300px;'><h3 style='margin-top:0; font-size:15px; border-bottom:1px dashed #eee; padding-bottom:10px;'>💎 Top 10 Khách VIP</h3><div id='topCustomersTable'></div></div>
              </div>
           </div>

           <div class='view-section' id='view-products'>
              <input class='tab-search-bar' id='searchProducts' onkeyup='renderProductsData(true)' placeholder='🔍 Tìm Tên hoặc Mã Sản phẩm...' type='text'></input>
              <div class='sub-toolbar'>
                <div style='display:flex; gap:10px; align-items:center; flex-wrap:wrap;'>
                    <b style='font-size:16px;'>📦 KHO HÀNG (<span id='prodCountDisplay' style='color:#0070f4;'>0</span>)</b>
                    <button class='action-btn green' onclick='openAddProductModal()'>+ Thêm SP</button>
                    <button class='action-btn orange' id='btnCheckDup' onclick='checkDuplicatesFromSheet()'>🔄 Check Trùng</button>
                    <div class='dropdown'>
                        <button class='icon-btn' onclick='toggleDropdown(event, &quot;colMenuProducts&quot;)' style='background:var(--btn-bg, #e2e8f0); color:var(--btn-col, #333); font-size:12px;'>&#9881;&#65039; Cột hiển thị</button>
                        <div class='dropdown-content' id='colMenuProducts' onclick='event.stopPropagation()'></div>
                    </div>
                </div>
                <div class='view-toggle'>
                  <button class='vbtn active' onclick='setViewMode(&apos;card&apos;)'>Thẻ</button><button class='vbtn' onclick='setViewMode(&apos;table&apos;)'>Bảng</button>
                </div>
              </div>
              <div class='cat-filter-bar' id='catFilterBar'></div>
              
              <div class='bulk-bar' id='bulkEditBar'>
                 <div style='display:flex; justify-content:space-between; width:100%; border-bottom:1px solid #ccc; padding-bottom:10px; margin-bottom:10px; flex-wrap:wrap; gap:10px;'>
                    <b style='color:inherit;font-size:14px; display:flex; align-items:center;'>&#9999;&#65039; Sửa nhanh (<span id='selCount' style='color:#0070f4;font-weight:bold; margin:0 4px;'>0</span> SP đang chọn)</b>
                    <div style='display:flex; gap:10px;'>
                        <button class='action-btn red' onclick='deleteSelectedProducts()' style='padding:6px 15px;'>🗑&#65039; Xóa SP Đã Chọn</button>
                        <button class='action-btn blue' onclick='applyBulkEdit()' style='padding:6px 15px;'>💾 Lưu Áp Dụng</button>
                    </div>
                 </div>
                 <div style='font-size:12px; opacity:0.8; margin-bottom:10px;'>Chỉ điền vào ô bạn muốn thay đổi. Các ô để trống sẽ giữ nguyên.</div>
                 <div class='bulk-grid' id='bulkFormGrid'></div>
              </div>
              <div id='productsList'></div>
           </div>

           <div class='view-section' id='view-orders'>
              <div class='sub-toolbar'>
                <div style='display:flex; gap:10px; align-items:center;'>
                    <b style='font-size:16px;'>🧾 ĐƠN HÀNG (<span id='orderCountDisplay' style='color:#0070f4;'>0</span>)</b>
                    <div class='dropdown'>
                        <button class='icon-btn' onclick='toggleDropdown(event, &quot;colMenuOrders&quot;)' style='background:var(--btn-bg, #e2e8f0); color:var(--btn-col, #333); font-size:12px;'>&#9881;&#65039; Cột</button>
                        <div class='dropdown-content' id='colMenuOrders' onclick='event.stopPropagation()'></div>
                    </div>
                </div>
                <div style='display:flex; gap:10px; align-items:center;'>
                    <select class='form-inp' id='orderStatusFilter' onchange='renderOrdersData(true)' style='width:auto; margin:0; padding:4px 8px; font-weight:600; font-size:12px;'>
                        <option value='ALL'>Lọc: Tất cả</option>
                        <option value='Nháp'>Nháp</option>
                        <option value='Chờ xử lý'>Chờ xử lý</option>
                        <option value='Đã giao'>Đã giao</option>
                        <option value='Đã hủy'>Đã hủy</option>
                        <option value='Đã hoàn trả'>Đã hoàn trả</option>
                    </select>
                    <div class='view-toggle'>
                      <button class='vbtn active' onclick='setViewMode(&apos;card&apos;)'>Thẻ</button><button class='vbtn' onclick='setViewMode(&apos;table&apos;)'>Bảng</button>
                    </div>
                </div>
              </div>
              <div style='display:flex; gap:10px; margin-bottom:15px;'>
                 <input class='tab-search-bar' id='searchOrders' onkeyup='renderOrdersData(true)' placeholder='🔍 Tìm SĐT, Tên khách, Mã đơn...' style='margin-bottom:0; flex:1;' type='text'></input>
              </div>
              <div id='ordersList'></div>
           </div>

           <div class='view-section' id='view-customers'>
              <div class='sub-toolbar'>
                  <div style='display:flex; gap:10px; align-items:center;'>
                      <b style='font-size:16px;'>👥 KHÁCH HÀNG</b>
                      <button class='action-btn blue' onclick='openCustomerModal()'>+ Thêm Mới</button>
                  </div>
                  <div class='view-toggle'>
                      <button class='vbtn active' onclick='setViewMode(&apos;card&apos;)'>Thẻ</button><button class='vbtn' onclick='setViewMode(&apos;table&apos;)'>Bảng</button>
                  </div>
              </div>
              <div style='display:flex; gap:10px; margin-bottom:15px;'>
                  <input class='tab-search-bar' id='searchCustomers' onkeyup='renderCustomersData(true)' placeholder='🔍 Tìm Mã KH, Tên, Số điện thoại...' style='margin-bottom:0; flex:1;' type='text'></input>
              </div>
              <div id='customersList'></div>
           </div>

           <div class='view-section' id='view-add'>
              <div class='card' style='display:block; max-width:700px; margin:0 auto; padding:25px; border:none; box-shadow:none; background:transparent;'>
                <h3 style='margin-top:0;text-align:center;color:#0070f4;padding-bottom:10px;'>TẠO ĐƠN HÀNG MỚI</h3>
                
                <div style='position:relative; display:flex; gap:10px; flex-wrap:wrap; margin-bottom:10px; align-items:center;'>
                    <select class='form-inp' id='cCustomerType' onchange='changePriceType(false); saveDraftLocal()' style='flex:1; margin:0; padding:10px; font-weight:bold; color:#0070f4;'>
                        <option value='Khách Lẻ'>💰 Giá Lẻ</option>
                        <option value='Khách Sỉ'>🏢 Giá Sỉ</option>
                    </select>
                    <input class='form-inp' id='cPhone' onblur='setTimeout(()=&gt;closeSuggest(&quot;cusSuggestAdd&quot;), 200)' onchange='saveDraftLocal()' onkeyup='showCustomerSuggest(this, false, &apos;cusSuggestAdd&apos;); saveDraftLocal();' placeholder='SĐT (Gõ để tìm)' style='flex:1; margin:0;' type='tel'></input>
                    <input class='form-inp' id='cName' onblur='setTimeout(()=&gt;closeSuggest(&quot;cusSuggestAdd&quot;), 200)' onchange='saveDraftLocal()' onkeyup='showCustomerSuggest(this, false, &apos;cusSuggestAdd&apos;); saveDraftLocal();' placeholder='Tên khách hàng *' style='flex:2; margin:0;' type='text'></input>
                    <div class='suggest-box' id='cusSuggestAdd'></div>
                </div>
                
                <input class='form-inp' id='cAddress' onchange='saveDraftLocal()' onkeyup='saveDraftLocal()' placeholder='Địa chỉ giao hàng' type='text'></input>
                <input id='cOldDebt' type='hidden' value='0'></input>
                
                <label style='font-size:13px; font-weight:bold; color:inherit; margin-top:10px; display:block;'>Tìm VÀ Thêm sản phẩm (Gõ Tên/Mã rồi nhấn Enter):</label>
                <div style='display:flex; gap:10px; margin-bottom:10px;'>
                    <input class='form-inp' id='productInputAdd' list='productDatalist' onkeypress='if(event.key===&apos;Enter&apos;) { addTempItemToOrder(false); return false; }' placeholder='Gõ tìm SP...' style='flex:2; margin:0;' type='text'></input>
                    <datalist id='productDatalist'></datalist>

                    <input class='form-inp' id='qty' min='1' onkeypress='if(event.key===&apos;Enter&apos;) { addTempItemToOrder(false); return false; }' placeholder='Số lượng' style='flex:1; margin:0;' type='number' value='1'></input>
                    <button class='action-btn gray' onclick='addTempItemToOrder(false)' style='margin:0;'>+ Thêm</button>
                </div>

                <div id='tempOrderItems' style='margin-bottom:15px;'></div>

                <div style='display:flex; gap:15px; flex-wrap:wrap; margin-bottom:10px;'>
                    <div style='flex:1;'><label style='font-size:12px;opacity:0.8;'>% Giảm giá Hóa đơn</label><input class='form-inp' id='cDiscount' oninput='updateOrderSummary(false); saveDraftLocal();' placeholder='VD: 5' type='number'></input></div>
                    <div style='flex:1;'>
                        <label style='font-size:12px;color:#3b82f6;font-weight:bold;'>Khách trả trước</label>
                        <div style='display:flex; gap:5px; margin-top:2px; margin-bottom:5px;'>
                           <button class='action-btn gray' onclick='autoFillPaid(&apos;current&apos;, false)' style='padding:2px 5px; font-size:10px;'>Tiền đơn này</button>
                           <button class='action-btn gray' onclick='autoFillPaid(&apos;all&apos;, false)' style='padding:2px 5px; font-size:10px;'>Tất toán</button>
                        </div>
                        <input class='form-inp' id='cPaid' oninput='updateOrderSummary(false); saveDraftLocal();' placeholder='Nhập số tiền...' style='margin-top:0;' type='number'></input>
                    </div>
                </div>

                <div class='summary-box' id='addOrderSummary' style='display:none;'></div>
                <textarea class='form-inp' id='cNote' onchange='saveDraftLocal()' onkeyup='saveDraftLocal()' placeholder='Ghi chú thêm...' rows='2'></textarea>
                
                <div style='display:flex; gap:10px; margin-top:10px;'>
                    <button class='action-btn gray' onclick='clearDraftLocal()' style='padding:14px; font-size:14px; flex:1;'>🗑&#65039; Bỏ nháp</button>
                    <button class='action-btn orange' onclick='handleAddOrder(&apos;Nháp&apos;)' style='padding:14px; font-size:14px; flex:1;'>💾 LƯU NHÁP</button>
                    <button class='action-btn blue' onclick='handleAddOrder(&apos;Chờ xử lý&apos;)' style='padding:14px; font-size:14px; flex:2;'>XÁC NHẬN TẠO ĐƠN</button>
                </div>
              </div>
           </div>
        </div>

        <div class='nav'>
          <div id='nav-dashboard' onclick='showPage(&quot;dashboard&quot;)' title='Tổng quan'>🏠</div>
          <div id='nav-products' onclick='showPage(&quot;products&quot;)' title='Kho hàng'>📦</div>
          <div id='nav-orders' onclick='showPage(&quot;orders&quot;)' title='Đơn hàng'>🧾</div>
          <div id='nav-customers' onclick='showPage(&quot;customers&quot;)' title='Khách hàng'>👥</div>
          <div id='nav-add' onclick='showPage(&quot;add&quot;)' title='Tạo đơn'>&#10133;</div>
        </div>

        <div class='dropdown-content' id='inlineCatMenu' onclick='event.stopPropagation()' style='position:fixed; z-index:9999; box-shadow:0 10px 30px rgba(0,0,0,0.3); max-width:90%; width:300px;'></div>

        <div class='modal' id='addSpModal'>
          <div class='modal-content'>
            <button class='close-btn' onclick='closeModal(&quot;addSpModal&quot;)'>&#10006;</button>
            <h2 style='margin-top:0; color:#10b981; font-size:18px;'>THÊM SẢN PHẨM VÀO KHO</h2>
            <div class='form-grid-2'>
                <div class='form-grid-full'><label style='font-size:12px;opacity:0.8;'>Mã SP (Quét mã vạch) *</label><input class='form-inp' id='apId' type='text'></input></div>
                <div class='form-grid-full'><label style='font-size:12px;opacity:0.8;'>Tên Sản Phẩm *</label><input class='form-inp' id='apName' type='text'></input></div>
                <div><label style='font-size:12px;opacity:0.8;'>Tồn kho nhập vào</label><input class='form-inp' id='apStock' type='number' value='0'></input></div>
                <div>
                    <label style='font-size:12px;opacity:0.8;'>Loại - N</label>
                    <input class='form-inp' id='apCat' list='catDatalist' placeholder='Gõ để chọn hoặc tạo mới' type='text'></input>
                </div>
                <div><label style='font-size:12px;opacity:0.8;'>Giá Gốc (Nhập)</label><input class='form-inp' id='apCost' type='number' value='0'></input></div>
                <div><label style='font-size:12px;opacity:0.8;'>Giá Sỉ (Nhập)</label><input class='form-inp' id='apWholesale' type='number' value='0'></input></div>
                <div class='form-grid-full'><label style='font-size:12px;color:#10b981;font-weight:bold;'>Giá Bán Lẻ</label><input class='form-inp' id='apRetail' type='number' value='0'></input></div>
            </div>
            <button class='action-btn green' onclick='saveNewProduct()' style='padding:12px; width:100%; margin-top:15px;'>LƯU VÀO KHO</button>
          </div>
        </div>

        <div class='modal' id='dupModal'>
          <div class='modal-content'>
            <button class='close-btn' onclick='closeModal(&quot;dupModal&quot;)'>&#10006;</button>
            <h2 style='margin-top:0; color:#ef4444; font-size:18px;'>CẢNH BÁO TRÙNG MÃ KHO</h2>
            <p style='font-size:13px; opacity:0.8;'>Hệ thống phát hiện các mã sản phẩm sau đang bị trùng lặp. Vui lòng xử lý để đảm bảo dữ liệu chính xác:</p>
            <div id='dupModalBody' style='max-height:400px; overflow-y:auto;'></div>
          </div>
        </div>

        <div class='modal' id='syncLogModal'>
          <div class='modal-content' style='max-width:400px;'>
            <button class='close-btn' onclick='closeModal(&quot;syncLogModal&quot;)'>&#10006;</button>
            <h2 style='margin-top:0; color:#3b82f6; font-size:16px; border-bottom:1px solid #eee; padding-bottom:10px;'>📜 LỊCH SỬ ĐỒNG BỘ</h2>
            <div id='syncLogBody' style='max-height: 400px; overflow-y:auto;'></div>
          </div>
        </div>

        <div class='modal' id='customerModal'>
          <div class='modal-content'>
            <button class='close-btn' onclick='closeModal(&quot;customerModal&quot;)'>&#10006;</button>
            <h2 id='cusModalTitle' style='margin-top:0; color:#3b82f6; font-size:18px;'>THÔNG TIN KHÁCH HÀNG</h2>
            <input id='cusOldPhone' type='hidden'></input>
            <label style='font-size:12px; opacity:0.8;'>Số điện thoại (Bắt buộc) *</label>
            <input class='form-inp' id='cusEditPhone' placeholder='Nhập SĐT...' type='tel'></input>
            <label style='font-size:12px; opacity:0.8;'>Tên Khách Hàng</label>
            <input class='form-inp' id='cusEditName' placeholder='Nhập Tên...' type='text'></input>
            <label style='font-size:12px; opacity:0.8;'>Nhóm Khách Hàng</label>
            <select class='form-inp' id='cusEditType'>
                <option value='Khách Lẻ'>Khách Lẻ</option>
                <option value='Khách Sỉ'>Khách Sỉ</option>
            </select>
            <label style='font-size:12px; opacity:0.8;'>Địa chỉ</label>
            <input class='form-inp' id='cusEditAddress' placeholder='Nhập Địa chỉ...' type='text'></input>
            <label style='font-size:12px; opacity:0.8;'>Nợ Đầu Kỳ (Chỉ nhập 1 lần)</label>
            <input class='form-inp' id='cusEditDebt' placeholder='Nhập số tiền nợ...' type='number'></input>
            <button class='action-btn blue' onclick='saveCustomer()' style='padding:12px; width:100%; margin-top:10px;'>LƯU LẠI</button>
          </div>
        </div>

        <div class='modal' id='payDebtModal'>
          <div class='modal-content' style='max-width:400px;'>
            <button class='close-btn' onclick='closeModal(&quot;payDebtModal&quot;)'>&#10006;</button>
            <h2 id='payDebtTitle' style='margin-top:0; color:#10b981; font-size:18px; border-bottom:1px solid #eee; padding-bottom:10px;'>💸 THANH TOÁN NỢ</h2>
            <input id='payDebtPhone' type='hidden'></input>
            <input id='payDebtIsRefund' type='hidden' value='0'></input>
            <div style='margin-bottom:15px; font-size:14px;'>
                Khách hàng: <b id='payDebtName' style='color:#3b82f6;'>---</b><br/>
                <span id='payDebtLabel'>Tổng nợ hiện tại:</span> <b id='payDebtCurrent' style='color:#ef4444; font-size:16px;'>0 đ</b>
            </div>
            <label id='payDebtInputLabel' style='font-size:12px; opacity:0.8; font-weight:bold; color:#10b981;'>Số tiền khách trả *</label>
            <input class='form-inp' id='payDebtAmount' placeholder='Nhập số tiền...' style='font-size:16px; font-weight:bold; color:#10b981;' type='number'></input>
            <button class='action-btn green' id='payDebtBtn' onclick='processPayDebt()' style='padding:12px; width:100%; margin-top:10px; font-size:14px;'>XÁC NHẬN THANH TOÁN</button>
          </div>
        </div>

        <div class='modal' id='orderModal'>
          <div class='modal-content'>
            <button class='close-btn' onclick='closeModal(&quot;orderModal&quot;)'>&#10006;</button>
            <h2 style='margin-top:0; color:#3b82f6; font-size:18px;'>CHI TIẾT ĐƠN HÀNG</h2>
            <div id='orderModalBody'></div>
          </div>
        </div>

        <div class='modal' id='editOrderModal'>
          <div class='modal-content'>
            <button class='close-btn' onclick='closeModal(&quot;editOrderModal&quot;)'>&#10006;</button>
            <h2 style='margin-top:0; color:#3b82f6; font-size:18px; border-bottom:1px solid #eee; padding-bottom:10px;'>&#9999;&#65039; SỬA ĐƠN HÀNG</h2>
            
            <div style='position:relative; display:flex; gap:10px; flex-wrap:wrap; margin-bottom:10px; align-items:center;'>
                <select class='form-inp' id='eoCustomerType' onchange='changePriceType(true)' style='flex:1; margin:0; padding:10px; font-weight:bold; color:#0070f4;'>
                    <option value='Khách Lẻ'>💰 Giá Lẻ</option>
                    <option value='Khách Sỉ'>🏢 Giá Sỉ</option>
                </select>
                <input class='form-inp' id='eoPhone' onblur='setTimeout(()=&gt;closeSuggest(&quot;cusSuggestEdit&quot;), 200)' onkeyup='showCustomerSuggest(this, true, &apos;cusSuggestEdit&apos;)' placeholder='SĐT Khách' style='flex:1; margin:0;' type='tel'></input>
                <input class='form-inp' id='eoName' onblur='setTimeout(()=&gt;closeSuggest(&quot;cusSuggestEdit&quot;), 200)' onkeyup='showCustomerSuggest(this, true, &apos;cusSuggestEdit&apos;)' placeholder='Tên khách hàng' style='flex:2; margin:0;' type='text'></input>
                <div class='suggest-box' id='cusSuggestEdit' style='top:42px; left:0; width:100%;'></div>
            </div>
            
            <input class='form-inp' id='eoAddress' placeholder='Địa chỉ' type='text'></input>
            <input id='eoOldDebt' type='hidden' value='0'></input>
            <textarea class='form-inp' id='eoNote' placeholder='Ghi chú...' rows='2'></textarea>
            
            <label style='font-size:13px; font-weight:bold; color:inherit; margin-top:5px; display:block;'>Thêm mặt hàng (Nhập mã/tên rồi Enter):</label>
            <div style='display:flex; gap:5px; margin-bottom:15px;'>
                <input class='form-inp' id='productInputEdit' list='productDatalist' onkeypress='if(event.key===&apos;Enter&apos;) { addTempItemToOrder(true); return false; }' placeholder='Gõ tìm SP...' style='flex:2; margin:0;' type='text'></input>
                <input class='form-inp' id='eoQty' min='1' onkeypress='if(event.key===&apos;Enter&apos;) { addTempItemToOrder(true); return false; }' placeholder='SL' style='flex:1; margin:0;' type='number' value='1'></input>
                <button class='action-btn gray' onclick='addTempItemToOrder(true)' style='margin:0;'>+ Thêm SP</button>
            </div>
            
            <label style='font-size:13px; font-weight:bold; color:inherit; display:block;'>Mặt hàng đang có trong đơn:</label>
            <div id='eoItemsList' style='padding:10px; border-radius:8px; border:1px solid #444; margin-bottom:10px; max-height:250px; overflow-y:auto;'></div>

            <div style='display:flex; gap:15px; flex-wrap:wrap; margin-bottom:10px;'>
                <div style='flex:1;'><label style='font-size:12px;opacity:0.8;'>% Giảm giá đơn</label><input class='form-inp' id='eoDiscount' oninput='updateOrderSummary(true)' placeholder='VD: 5' type='number'></input></div>
                <div style='flex:1;'>
                    <label style='font-size:12px;color:#3b82f6;font-weight:bold;'>Khách thanh toán</label>
                    <div style='display:flex; gap:5px; margin-top:2px; margin-bottom:5px;'>
                        <button class='action-btn gray' onclick='autoFillPaid(&apos;current&apos;, true)' style='padding:2px 5px; font-size:10px;'>Tiền đơn này</button>
                        <button class='action-btn gray' onclick='autoFillPaid(&apos;all&apos;, true)' style='padding:2px 5px; font-size:10px;'>Tất toán</button>
                    </div>
                    <input class='form-inp' id='eoPaid' oninput='updateOrderSummary(true)' placeholder='Nhập số tiền...' style='margin-top:0;' type='number'></input>
                </div>
            </div>

            <div class='summary-box' id='eoSummary'></div>
            <button class='action-btn green' onclick='saveEditOrder()' style='padding:12px; width:100%; font-size:15px;'>💾 LƯU ĐƠN HÀNG</button>
          </div>
        </div>

        <div class='modal' id='productModal'>
          <div class='modal-content'>
            <button class='close-btn' onclick='closeModal(&quot;productModal&quot;)'>&#10006;</button>
            <h2 style='margin-top:0; color:#3b82f6; font-size:18px; margin-bottom:10px;'>SỬA SẢN PHẨM</h2>
            
            <div class='auto-calc-box'>
               <div style='width:100%; font-size:12px; color:#10b981; font-weight:bold; margin-bottom:2px;'>💡 Tính giá bán (Làm tròn hàng trăm):</div>
               <input class='form-inp' id='smartLoiNhuan' oninput='autoCalcRealtimePrice()' placeholder='% Lãi (VD: 20)' type='number'></input>
               <input class='form-inp' id='smartKM' oninput='autoCalcRealtimePrice()' placeholder='% Giảm (VD: 10)' type='number'></input>
            </div>

            <div class='form-grid-2' id='productModalBody'></div>
            <button class='action-btn blue' onclick='saveEditProduct()' style='padding:12px; width:100%; margin-top:15px;'>LƯU LẠI</button>
          </div>
        </div>

        <div class='modal' id='imageModal'>
          <div class='modal-content img-zoom-content' style='padding:0; background:transparent; box-shadow:none;'>
            <button class='close-btn' onclick='closeModal(&quot;imageModal&quot;)'>&#10006;</button>
            <img id='previewImgSrc' src='' style='max-width:100%; border-radius:12px;'></img>
          </div>
        </div>

        <div class='modal' id='returnModal'>
          <div class='modal-content' style='max-width:700px;'>
            <button class='close-btn' onclick='closeModal(&quot;returnModal&quot;)'>&#10006;</button>
            <h2 style='margin-top:0; color:#ef4444; font-size:18px; border-bottom:1px solid #eee; padding-bottom:10px;'>🔄 TRUNG TÂM TRẢ HÀNG</h2>
            
            <div class='return-zone-box'>
                <label style='font-size:13px; font-weight:bold; color:#ef4444;'>Quét / Tìm (Mã Đơn, SĐT, Tên KH, Mã SP):</label>
                <div style='display:flex; gap:10px; margin-top:5px;'>
                    <input class='form-inp' id='returnSearchInput' onkeypress='if(event.key===&quot;Enter&quot;) searchReturnItem()' placeholder='VD: 098... hoặc DH_... hoặc Mã SP' style='margin:0; flex:1;' type='text'></input>
                    <button class='action-btn red' onclick='searchReturnItem()'>🔍 Tìm</button>
                </div>
                <div id='returnSearchInfo' style='font-size:12px; margin-top:5px; color:#555;'></div>
            </div>

            <label style='font-size:13px; font-weight:bold;'>Danh sách hàng hoàn trả:</label>
            <div class='return-list-box' id='returnCartList'>
                <i style='opacity:0.6; font-size:12px;'>Chưa có sản phẩm nào...</i>
            </div>

            <div class='return-total-box'>
                <span style='font-size:15px; font-weight:bold;'>TỔNG TIỀN HOÀN KHÁCH:</span>
                <span id='returnTotalDisplay' style='font-size:20px; font-weight:bold; color:#ef4444;'>0 đ</span>
            </div>
            
            <div style='display:flex; gap:10px;'>
                <textarea class='form-inp' id='returnNote' placeholder='Lý do trả hàng...' rows='1' style='margin:0; flex:2;'></textarea>
                <button class='action-btn red' onclick='processReturn()' style='flex:1; padding:12px; font-size:14px;'>XÁC NHẬN HOÀN TRẢ</button>
            </div>
          </div>
        </div>

        <script src='https://raw.githack.com/clickvaodoi-sketch/truongan-pos/refs/heads/main/module-core.js'></script>
        <script src='https://raw.githack.com/clickvaodoi-sketch/truongan-pos/refs/heads/main/module-dashboard.js'></script>
        <script src='https://raw.githack.com/clickvaodoi-sketch/truongan-pos/refs/heads/main/module-product.js'></script>
        <script src='https://raw.githack.com/clickvaodoi-sketch/truongan-pos/refs/heads/main/module-order.js'></script>
        <script src='https://raw.githack.com/clickvaodoi-sketch/truongan-pos/refs/heads/main/module-customer.js'></script>
        <script src='https://raw.githack.com/clickvaodoi-sketch/truongan-pos/refs/heads/main/module-return.js'></script>

        <script type='text/javascript'>
        //<![CDATA[
        function hardResetCache() {
            if(confirm("Hành động này sẽ XÓA BỘ NHỚ TẠM để tải lại dữ liệu mới nhất từ Sheet. Dùng để fix lỗi tạo cột lạ.\nXác nhận xóa?")) {
                localStorage.clear();
                location.reload();
            }
        }

        document.addEventListener('DOMContentLoaded', () => { 
            let ui = document.getElementById("loadingUI"); 
            if(ui) ui.style.display = "flex";
            if(localStorage.getItem('theme') === 'dark') toggleTheme();
            
            setTimeout(() => {
                if(typeof ALL_PRODUCTS === 'undefined') {
                    alert("Lỗi: Không tải được file module-core.js từ GitHub! Vui lòng kiểm tra lại link.");
                    if(ui) ui.style.display = "none";
                    return;
                }

                if(ALL_PRODUCTS.length > 0) { 
                    if(typeof buildSettingsMenu === 'function') buildSettingsMenu(); 
                    if(typeof buildBulkEditMenu === 'function') buildBulkEditMenu(); 
                    if(typeof initCategories === 'function') initCategories(); 
                    if(typeof calcVIPs === 'function') calcVIPs(); 
                    if(typeof renderAddFormUI === 'function') renderAddFormUI(); 
                    if(typeof showPage === 'function') showPage('dashboard'); 
                }
                
                if(typeof syncData === 'function') {
                    syncData(ALL_PRODUCTS.length === 0);
                } else {
                    if(ui) ui.style.display = "none";
                }
            }, 800);
        });
        //]]>
        </script>
      </b:includable>
    </b:widget>
  </b:section>
</body>
</html>
