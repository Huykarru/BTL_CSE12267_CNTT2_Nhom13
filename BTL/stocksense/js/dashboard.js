/* dashboard.js — CHỨC NĂNG: Bảng điều khiển chính (render menu theo vai trò + KPI + bảng + AI) */
(function(){
  'use strict';
  var sidebar = document.getElementById('sidebar');
  if(!sidebar) return;   // không phải trang dashboard → dừng

  var SS = window.SS;
  var DB = SS.DB, NAV = SS.NAV, TITLES = SS.TITLES, icon = SS.icon, badge = SS.badge, fmt = SS.fmt;
  var navMenu = document.getElementById('navMenu');
  var content = document.getElementById('content');
  var pageTitle = document.getElementById('pageTitle');
  var currentTab = null;

  // Kiểm tra đăng nhập
  var user = null;
  try{ user = JSON.parse(sessionStorage.getItem('ss_user')); }catch(e){}
  if(!user){ window.location.href = 'login.html'; return; }
  var role = user.role || 'admin';

  // Đổ tên + avatar vào topbar
  var un = document.getElementById('userName'); if(un) un.textContent = user.name || 'Người dùng';
  var ur = document.getElementById('userRole'); if(ur) ur.textContent = user.roleLabel || SS.ROLE_MAP[role] || '';
  var av = document.getElementById('avatar');   if(av) av.textContent = (user.name||'?').charAt(0).toUpperCase();

  function renderNav(){
    var items = NAV[role] || NAV.admin;
    navMenu.innerHTML = items.map(function(it){
      return '<a class="nav-item'+(it.id===currentTab?' active':'')+'" data-tab="'+it.id+'">'+icon(it.icon)+' '+it.label+'</a>';
    }).join('');
    navMenu.querySelectorAll('.nav-item').forEach(function(el){
      el.addEventListener('click', function(){ switchTab(el.getAttribute('data-tab')); });
    });
  }

  function kpiCard(label, val, sub, color){
    return '<div class="card" style="text-align:center;"><div style="font-size:12px;color:#64748b;font-weight:600;">'+label+'</div>'+
      '<div style="font-size:30px;font-weight:800;color:'+color+';margin:6px 0;">'+val+'</div>'+
      '<div style="font-size:11.5px;color:#64748b;">'+sub+'</div></div>';
  }

  function renderContent(tab){
    pageTitle.textContent = TITLES[tab] || tab;
    var html = '';
    if(tab === 'dashboard'){
      var low = DB.products.filter(function(p){return p.qty<p.min;}).length;
      var doing = DB.tasks.filter(function(t){return t.status==='Đang làm';}).length;
      var totalVal = DB.products.reduce(function(s,p){return s+p.qty*p.price;},0);
      html = '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:14px;margin-bottom:20px;">'+
        kpiCard('Tổng SKU', DB.products.length, 'sản phẩm đang quản lý', '#0f172a')+
        kpiCard('Cảnh báo thiếu hàng', low, low>0? 'cần bổ sung ngay':'đã an toàn', low>0?'#dc2626':'#059669')+
        kpiCard('Nhiệm vụ đang làm', doing, 'nhân viên đang thực hiện', '#2563eb')+
        kpiCard('Giá trị tồn kho', fmt(Math.round(totalVal/1000000))+' triệu', 'tổng giá trị kho', '#059669')+
        '</div>';
      html += '<div class="card"><div class="card-title">Tồn kho theo sản phẩm</div><div style="margin-top:14px;">';
      DB.products.forEach(function(p){
        var pct = Math.min(100, Math.round(p.qty/Math.max(p.min*2,1)*100));
        var color = p.qty < p.min ? '#dc2626' : '#2563eb';
        html += '<div style="margin-bottom:12px;"><div style="display:flex;justify-content:space-between;font-size:12.5px;margin-bottom:4px;"><span style="font-weight:600;">'+p.name+'</span><span style="color:#64748b;">'+p.qty+' / ngưỡng '+p.min+'</span></div>'+
          '<div style="height:8px;background:#e2e8f0;border-radius:4px;overflow:hidden;"><div style="width:'+pct+'%;height:100%;background:'+color+';border-radius:4px;"></div></div></div>';
      });
      html += '</div></div>';
    }
    else if(tab === 'products'){
      html = '<div class="card"><div class="card-title">Danh sách sản phẩm</div><table style="width:100%;border-collapse:collapse;margin-top:14px;font-size:13px;">'+
        '<tr style="text-align:left;color:#64748b;font-size:12px;border-bottom:1px solid #e2e8f0;"><th style="padding:8px;">MÃ</th><th>TÊN SẢN PHẨM</th><th>TỒN KHO</th><th>NGƯỠNG</th><th>TRẠNG THÁI</th></tr>'+
        DB.products.map(function(p){
          var st = p.qty < p.min ? badge('Thấp hơn ngưỡng','Thấp hơn ngưỡng') : badge('An toàn','Hoạt động');
          return '<tr class="tbl-row" style="border-bottom:1px solid #f1f5f9;"><td style="padding:10px 8px;font-weight:600;">'+p.id+'</td><td>'+p.name+'</td><td>'+p.qty+'</td><td>'+p.min+'</td><td>'+st+'</td></tr>';
        }).join('')+'</table></div>';
    }
    else if(tab === 'users'){
      html = '<div class="card"><div class="card-title">Danh sách người dùng</div><table style="width:100%;border-collapse:collapse;margin-top:14px;font-size:13px;">'+
        '<tr style="text-align:left;color:#64748b;font-size:12px;border-bottom:1px solid #e2e8f0;"><th style="padding:8px;">MÃ</th><th>HỌ TÊN</th><th>EMAIL</th><th>VAI TRÒ</th><th>TRẠNG THÁI</th></tr>'+
        DB.users.map(function(u){
          return '<tr class="tbl-row" style="border-bottom:1px solid #f1f5f9;"><td style="padding:10px 8px;font-weight:600;">'+u.id+'</td><td>'+u.name+'</td><td>'+u.email+'</td><td>'+u.role+'</td><td>'+badge(u.status,'Hoạt động')+'</td></tr>';
        }).join('')+'</table></div>';
    }
    else if(tab === 'requests'){
      html = '<div class="card"><div class="card-title">Yêu cầu chờ duyệt</div><div style="margin-top:14px;">'+
        DB.requests.map(function(r){
          return '<div style="display:flex;align-items:center;justify-content:space-between;padding:12px 0;border-bottom:1px solid #f1f5f9;"><div><div style="font-weight:600;font-size:13.5px;">'+r.type+' — '+r.detail+'</div><div style="font-size:12px;color:#64748b;margin-top:3px;">Người tạo: '+r.by+'</div></div>'+badge(r.status, r.status)+'</div>';
        }).join('')+'</div></div>';
    }
    else if(tab === 'ai'){
      var btnStyle = 'background:#2563eb;color:#fff;border:none;border-radius:8px;padding:8px 16px;font-size:13px;font-weight:600;cursor:pointer;';
      html = '<div class="card" style="margin-bottom:14px;"><div class="card-title"><span class="ico">'+icon('M12 2a7 7 0 0 1 7 7c0 2.5-1.5 4.5-3 6v3H8v-3c-1.5-1.5-3-3.5-3-6a7 7 0 0 1 7-7z')+'</span>AI-1 · Stockout Risk <span style="font-size:11px;color:#64748b;font-weight:500;">(phân tích động, có nút Khắc phục)</span></div>'+
        '<button onclick="SS.runAI(\'ai1\',this)" style="'+btnStyle+'">Phân tích nguy cơ thiếu hàng</button><div id="out_ai1" style="margin-top:14px;"></div></div>'+
        '<div class="card" style="margin-bottom:14px;"><div class="card-title">AI-2 · Location Anomaly</div><button onclick="SS.runAI(\'ai2\',this)" style="'+btnStyle+'">Quét vị trí bất thường</button><div id="out_ai2" style="margin-top:14px;"></div></div>'+
        '<div class="card"><div class="card-title">AI-3 · Variance Assistant</div><button onclick="SS.runAI(\'ai3\',this)" style="'+btnStyle+'">Phân tích chênh lệch</button><div id="out_ai3" style="margin-top:14px;"></div></div>';
    }
    else {
      html = '<div class="card"><div class="card-title">'+(TITLES[tab]||tab)+'</div><div style="color:#64748b;font-size:13.5px;margin-top:10px;">Nội dung đang được phát triển — xem tab Bảng điều khiển / Sản phẩm / Người dùng / AI Assistant.</div></div>';
    }
    content.innerHTML = html;
  }

  window.switchTab = function(tab){
    currentTab = tab;
    renderNav();
    renderContent(tab);
  };
  window.SS.renderContent = renderContent;
  Object.defineProperty(window.SS, 'currentTab', { get:function(){ return currentTab; } });

  // Khởi động: tab đầu tiên theo vai trò
  currentTab = (NAV[role] || NAV.admin)[0].id;
  renderNav();
  renderContent(currentTab);
})();
