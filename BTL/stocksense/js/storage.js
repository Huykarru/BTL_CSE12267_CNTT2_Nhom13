/* storage.js — CHỨC NĂNG: Lưu trữ bền vững (localStorage): sản phẩm, tài khoản thêm, thông báo đã khắc phục, cài đặt */
(function(){
  'use strict';
  window.SS = window.SS || {};
  var DB = window.SS.DB, ACCOUNTS = window.SS.ACCOUNTS;

  // --- Tài khoản: gộp demo + tự đăng ký ---
  function getAllAccounts(){
    var extra = {};
    try{ var s = localStorage.getItem('ss_extra_accounts'); if(s) extra = JSON.parse(s) || {}; }catch(e){}
    var out = {};
    for(var k in ACCOUNTS) out[k] = ACCOUNTS[k];
    for(var e in extra)  out[e] = extra[e];
    return out;
  }
  function saveExtraAccount(email, data){
    try{
      var extra = {};
      var s = localStorage.getItem('ss_extra_accounts');
      if(s) extra = JSON.parse(s) || {};
      extra[String(email).toLowerCase().trim()] = data;
      localStorage.setItem('ss_extra_accounts', JSON.stringify(extra));
    }catch(e){}
  }
  function removeExtraAccount(email){
    try{
      var extra = {};
      var s = localStorage.getItem('ss_extra_accounts');
      if(s) extra = JSON.parse(s) || {};
      delete extra[String(email).toLowerCase().trim()];
      localStorage.setItem('ss_extra_accounts', JSON.stringify(extra));
    }catch(e){}
  }

  // --- Tồn kho động (sau khi AI khắc phục rủi ro) ---
  function loadProducts(){
    try{
      var s = localStorage.getItem('ss_products');
      if(s){
        var saved = JSON.parse(s) || [];
        saved.forEach(function(sp){
          var p = DB.products.find(function(x){ return x.id===sp.id; });
          if(p){ p.qty = sp.qty; p.min = sp.min; }
        });
      }
    }catch(e){}
  }
  function saveProducts(){
    try{
      var arr = DB.products.map(function(p){ return {id:p.id, qty:p.qty, min:p.min}; });
      localStorage.setItem('ss_products', JSON.stringify(arr));
    }catch(e){}
  }

  // --- Cảnh báo: dựng lại theo tồn kho thực tế ---
  function recomputeAlerts(){
    DB.alerts = DB.products.filter(function(p){ return p.qty < p.min; }).map(function(p){
      var ratio = p.qty / p.min;
      var level = ratio < 0.3 ? 'Nguy cấp' : ratio < 0.6 ? 'Cao' : 'Trung bình';
      return {id:'AL-'+p.id, sku:p.id, name:p.name, qty:p.qty, min:p.min, level:level};
    });
  }

  // --- Thông báo "đã khắc phục rủi ro" ---
  function getResolvedNotifs(){
    try{ var s = localStorage.getItem('ss_resolved_notifs'); return s ? JSON.parse(s) : []; }catch(e){ return []; }
  }
  function addResolvedNotif(sku, name){
    try{
      var arr = getResolvedNotifs();
      arr.unshift({sku:sku, name:name, time:new Date().toISOString()});
      if(arr.length > 10) arr = arr.slice(0, 10);
      localStorage.setItem('ss_resolved_notifs', JSON.stringify(arr));
    }catch(e){}
  }

  // Đồng bộ tên admin: bảng người dùng lấy tên từ tài khoản đăng nhập
  try{
    var allAcc = getAllAccounts();
    var adm = allAcc['admin@stocksense.vn'];
    if(adm){
      var u = DB.users.find(function(x){ return x.email==='admin@stocksense.vn'; });
      if(u) u.name = adm.name;
      DB.tasks.forEach(function(t){ if(t.assignee==='Phạm Văn D') t.assignee = adm.name; });
      DB.movements.forEach(function(m){ if(m.user==='Phạm Văn D') m.user = adm.name; });
    }
  }catch(e){}

  loadProducts();
  recomputeAlerts();

  window.SS.getAllAccounts = getAllAccounts;
  window.SS.saveExtraAccount = saveExtraAccount;
  window.SS.removeExtraAccount = removeExtraAccount;
  window.SS.loadProducts = loadProducts;
  window.SS.saveProducts = saveProducts;
  window.SS.recomputeAlerts = recomputeAlerts;
  window.SS.getResolvedNotifs = getResolvedNotifs;
  window.SS.addResolvedNotif = addResolvedNotif;
})();
