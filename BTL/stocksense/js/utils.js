/* utils.js — CHỨC NĂNG: Các hàm tiện ích dùng chung (icon, badge, định dạng số, toast) */
(function(){
  'use strict';
  window.SS = window.SS || {};

  function icon(path, size){
    return '<svg width="'+(size||18)+'" height="'+(size||18)+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="'+path+'"/></svg>';
  }
  function badge(text, color){
    var map = {Cao:'#dc2626', Thấp:'#059669', 'Trung bình':'#d97706', 'Nguy cấp':'#dc2626',
      'Hoạt động':'#059669', 'Đang làm':'#2563eb', 'Chờ duyệt':'#d97706', 'Hoàn thành':'#059669',
      'Thấp hơn ngưỡng':'#dc2626', 'Lưu trữ bất thường':'#d97706', 'Đã duyệt':'#059669', 'Từ chối':'#dc2626'};
    var c = map[color] || '#64748b';
    return '<span class="badge" style="background:'+c+'1a;color:'+c+';">'+text+'</span>';
  }
  function fmt(n){ return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g,'.'); }
  function $(sel){ return document.querySelector(sel); }

  // Thông báo toast góc dưới phải
  function toast(msg){
    var old = document.querySelector('.toast');
    if(old) old.remove();
    var t = document.createElement('div');
    t.className = 'toast show';
    t.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> '+msg;
    document.body.appendChild(t);
    setTimeout(function(){ t.classList.remove('show'); setTimeout(function(){ t.remove(); }, 300); }, 2200);
  }

  window.SS.icon = icon;
  window.SS.badge = badge;
  window.SS.fmt = fmt;
  window.SS.$ = $;
  window.SS.toast = toast;
})();
