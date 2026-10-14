// ===== StockSense - Logic cho các trang mở rộng =====
(function(){
  var SS = window.SS || {};
  var DB = SS.DB || {products:[],locations:[],tasks:[],alerts:[],movements:[],users:[],requests:[]};
  var ROLE_LABEL = {admin:'Quản trị viên',supervisor:'Giám sát kho',worker:'Nhân viên kho',planner:'Điều phối nhập hàng'};
  var LABEL_ROLE = {'Quản trị viên':'admin','Giám sát kho':'supervisor','Nhân viên kho':'worker','Điều phối nhập hàng':'planner'};

  function $(id){return document.getElementById(id);}
  function icon(path,size){
    if(SS.icon) return SS.icon(path,size);
    return '<svg width="'+(size||18)+'" height="'+(size||18)+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="'+path+'"/></svg>';
  }
  function badge(text,color){
    if(SS.badge) return SS.badge(text,color);
    return '<span class="badge" style="background:#64748b1a;color:#64748b;">'+text+'</span>';
  }
  // ---- Toast ----
  function toast(msg){
    var t = document.createElement('div');
    t.className='toast';
    t.innerHTML='<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span>'+msg+'</span>';
    document.body.appendChild(t);
    requestAnimationFrame(function(){t.classList.add('show');});
    setTimeout(function(){t.classList.remove('show');setTimeout(function(){t.remove();},300);},2200);
  }
  // ---- Session / auth ----
  function getCurrentUser(){
    try{var s=sessionStorage.getItem('ss_user');return s?JSON.parse(s):null;}catch(e){return null;}
  }
  function setCurrentUser(u){
    try{sessionStorage.setItem('ss_user',JSON.stringify(u));}catch(e){}
  }
  function requireAuth(){
    var u=getCurrentUser();
    if(!u){window.location.href='index.html';return null;}
    return u;
  }
  function logout(){
    try{sessionStorage.removeItem('ss_user');}catch(e){}
    window.location.href='index.html';
  }
  // ---- Settings store ----
  var DEFAULT_SETTINGS = {
    twoFactor:false, killOnClose:false, sessionTimeout:'30',
    emailAlerts:true, pushAlerts:true, lowStockSound:false, autoRead:false,
    lang:'vi', compact:false, currency:'VND',
    defaultMinStock:50, defaultSort:'name'
  };
  function loadSettings(){
    try{var s=localStorage.getItem('ss_settings');if(s){var o=JSON.parse(s)||{};var out={};for(var k in DEFAULT_SETTINGS)out[k]=(o[k]!==undefined)?o[k]:DEFAULT_SETTINGS[k];return out;}}catch(e){}
    return JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
  }
  function saveSettings(s){
    try{localStorage.setItem('ss_settings',JSON.stringify(s));}catch(e){}
  }
  // ---- Read notifications store ----
  function getReadNotifs(){
    try{var s=localStorage.getItem('ss_read_notifs');return s?JSON.parse(s)||[]:[];}catch(e){return [];}
  }
  function addReadNotif(id){
    var r=getReadNotifs();
    if(r.indexOf(id)<0){r.push(id);try{localStorage.setItem('ss_read_notifs',JSON.stringify(r));}catch(e){}}
  }
  function markAllRead(){
    var ids=buildNotifs().map(function(n){return n.id;});
    try{localStorage.setItem('ss_read_notifs',JSON.stringify(ids));}catch(e){}
  }
  // ---- Build notification list from mock DB ----
  function buildNotifs(){
    var list=[];
    var ICON_ALERT='M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z M12 9v4 M12 17h.01';
    var ICON_TASK='M9 11l3 3L22 4 M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11';
    var ICON_REQ='M9 11l3 3L22 4 M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11';
    var ICON_SYS='M12 2v4 M12 18v4 M4.93 4.93l2.83 2.83 M16.24 16.24l2.83 2.83 M2 12h4 M18 12h4';
    DB.alerts.forEach(function(a){
      var c = a.level==='Nguy cấp'?'#dc2626':(a.level==='Cao'?'#d97706':'#2563eb');
      list.push({id:'al-'+a.id,cat:'Cảnh báo',title:a.name+' — '+a.type,desc:'Hiện tại '+a.current+' đơn vị · ngưỡng tối thiểu '+a.min+'. Cần bổ sung gấp.',time:'Hôm nay',icon:ICON_ALERT,color:c});
    });
    DB.tasks.forEach(function(t){
      var c = t.priority==='Cao'?'#dc2626':(t.priority==='Trung bình'?'#d97706':'#059669');
      list.push({id:'task-'+t.id,cat:'Nhiệm vụ',title:t.type+' tại '+t.loc,desc:'Người thực hiện: '+t.assignee+' · Ưu tiên '+t.priority+' · Hạn '+t.due,time:t.due,icon:ICON_TASK,color:c});
    });
    DB.requests.forEach(function(r){
      list.push({id:'req-'+r.id,cat:'Yêu cầu',title:r.type+' — '+r.by,desc:r.detail+' · Trạng thái: '+r.status,time:r.time,icon:ICON_REQ,color:'#2563eb'});
    });
    DB.movements.forEach(function(m){
      list.push({id:'mv-'+m.id,cat:'Hệ thống',title:'Di chuyển hàng '+m.sku,desc:m.from+' → '+m.to+' · '+m.qty+' đơn vị · thực hiện bởi '+m.user,time:m.time,icon:ICON_SYS,color:'#64748b'});
    });
    // Thông báo các rủi ro đã được khắc phục (đã đọc, màu xanh)
    if(SS.getResolvedNotifs){
      SS.getResolvedNotifs().forEach(function(r){
        list.push({id:'res-'+r.sku+'-'+r.time,cat:'Hệ thống',title:'Đã khắc phục nguy cơ: '+r.name,desc:'SKU '+r.sku+' đã được bổ sung hàng, không còn nguy cơ thiếu hàng.',time:r.time,icon:'M20 6L9 17l-5-5',color:'#059669',unread:false});
      });
    }
    var read=getReadNotifs();
    list.forEach(function(n){n.unread = read.indexOf(n.id)<0;});
    // chưa đọc lên đầu
    list.sort(function(a,b){return (a.unread===b.unread)?0:(a.unread?-1:1);});
    return list;
  }
  function unreadCount(){
    return buildNotifs().filter(function(n){return n.unread;}).length;
  }
  function updateBellBadge(){
    ['notifBell','subBell'].forEach(function(bid){
      var b=$(bid); if(!b) return;
      var c=unreadCount();
      var old=b.querySelector('.badge-dot'); if(old)old.remove();
      if(c>0){var d=document.createElement('span');d.className='badge-dot';d.textContent=c>9?'9+':c;b.appendChild(d);}
    });
  }

  // ================== TRANG REGISTER ==================
  var registerForm = $('registerForm');
  if(registerForm){
    var f={
      name:$('regName'), email:$('regEmail'), pw:$('regPw'), pw2:$('regPw2'), role:$('regRole')
    };
    function err(id,msg){var e=$(id);if(msg){e.querySelector('span').textContent=msg;e.classList.add('show');}else e.classList.remove('show');}
    function inpErr(el,on){el.classList.toggle('err',!!on);}
    function hideG(){var g=$('regGlobal');g.className='global-msg';}
    function showG(msg,type){var g=$('regGlobal');$('regGlobalText').textContent=msg;g.className='global-msg '+(type||'err');}
    ['name','email','pw','pw2','role'].forEach(function(k){
      f[k].addEventListener('input',function(){inpErr(f[k],false);err(k+'Err','');hideG();});
      f[k].addEventListener('change',function(){inpErr(f[k],false);err(k+'Err','');hideG();});
    });
    document.querySelectorAll('.toggle-pw').forEach(function(b){
      b.addEventListener('click',function(){
        var t=b.getAttribute('data-target');var el=$(t);
        el.type = el.type==='password'?'text':'password';
      });
    });
    // thanh độ mạnh mật khẩu
    f.pw.addEventListener('input',function(){
      var v=f.pw.value, s=0;
      if(v.length>=6)s++; if(v.length>=10)s++; if(/[A-Z]/.test(v))s++; if(/[0-9]/.test(v))s++; if(/[^A-Za-z0-9]/.test(v))s++;
      var bar=$('pwBar'), w=['0%','20%','40%','60%','80%','100%'][Math.min(s,5)], col=['#cbd5e1','#dc2626','#d97706','#f59e0b','#059669','#059669'][Math.min(s,5)];
      bar.style.width=w;bar.style.background=col;
    });
    registerForm.addEventListener('submit',function(e){
      e.preventDefault(); hideG();
      var name=f.name.value.trim(), email=f.email.value.trim().toLowerCase(), pw=f.pw.value, pw2=f.pw2.value, role=f.role.value;
      var ok=true, emailRe=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if(!name){inpErr(f.name,true);err('nameErr','Vui lòng nhập họ tên');ok=false;}
      else if(name.length<2){inpErr(f.name,true);err('nameErr','Họ tên quá ngắn');ok=false;}
      if(!email){inpErr(f.email,true);err('emailErr','Vui lòng nhập email');ok=false;}
      else if(!emailRe.test(email)){inpErr(f.email,true);err('emailErr','Email không đúng định dạng');ok=false;}
      if(!pw){inpErr(f.pw,true);err('pwErr','Vui lòng nhập mật khẩu');ok=false;}
      else if(pw.length<6){inpErr(f.pw,true);err('pwErr','Mật khẩu phải có ít nhất 6 ký tự');ok=false;}
      if(pw2!==pw){inpErr(f.pw2,true);err('pw2Err','Mật khẩu xác nhận không khớp');ok=false;}
      if(!role){inpErr(f.role,true);err('roleErr','Vui lòng chọn vai trò');ok=false;}
      if(!ok)return;
      if(SS.getAllAccounts && SS.getAllAccounts()[email]){
        showG('Email này đã được đăng ký. Vui lòng dùng email khác hoặc đăng nhập.');
        inpErr(f.email,true);return;
      }
      var btn=$('regBtn'),txt=$('regBtnText');
      btn.disabled=true;txt.innerHTML='<span class="spin"></span> Đang tạo tài khoản...';
      setTimeout(function(){
        if(SS.saveExtraAccount){
          SS.saveExtraAccount(email,{pw:pw,role:role,name:name,roleLabel:ROLE_LABEL[role]||role,email:email});
        }
        showG('Tạo tài khoản thành công! Đang chuyển đến trang đăng nhập...','ok');
        setTimeout(function(){window.location.href='index.html';},1400);
      },900);
    });
  }

  // ================== TRANG FORGOT PASSWORD (2 bước) ==================
  if($('forgotStep1')){
    var fpEmail=$('fpEmail'), resetEmail=null;
    function showG2(id,msg,type){var g=$(id);$(id+'Text').textContent=msg;g.className='global-msg '+(type||'err');}
    $('fpForm1').addEventListener('submit',function(e){
      e.preventDefault();
      var email=fpEmail.value.trim().toLowerCase();
      var emailRe=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if(!email||!emailRe.test(email)){fpEmail.classList.add('err');showG2('fpGlobal1','Vui lòng nhập email hợp lệ.');return;}
      var all=SS.getAllAccounts?SS.getAllAccounts():{};
      if(!all[email]){fpEmail.classList.add('err');showG2('fpGlobal1','Không tìm thấy tài khoản với email này.');return;}
      resetEmail=email;
      $('forgotStep1').style.display='none';
      $('forgotStep2').style.display='block';
      $('fpEmailShow').textContent=email;
      $('stepBar1').classList.add('active');$('stepBar2').classList.add('active');
    });
    document.querySelectorAll('.toggle-pw').forEach(function(b){
      b.addEventListener('click',function(){var el=$(b.getAttribute('data-target'));el.type=el.type==='password'?'text':'password';});
    });
    $('fpForm2').addEventListener('submit',function(e){
      e.preventDefault();
      var np=$('fpNewPw').value, np2=$('fpNewPw2').value;
      var ok=true;
      if(!np||np.length<6){$('fpNewPw').classList.add('err');showG2('fpGlobal2','Mật khẩu mới phải có ít nhất 6 ký tự.');ok=false;}
      if(np!==np2){$('fpNewPw2').classList.add('err');showG2('fpGlobal2','Mật khẩu xác nhận không khớp.');ok=false;}
      if(!ok)return;
      var all=SS.getAllAccounts?SS.getAllAccounts():{};
      var acc=all[resetEmail];
      if(acc && SS.saveExtraAccount){
        SS.saveExtraAccount(resetEmail,{pw:np,role:acc.role,name:acc.name,roleLabel:acc.roleLabel});
      }
      $('forgotStep2').style.display='none';
      $('forgotDone').style.display='block';
    });
  }

  // ================== Dashboard: cập nhật badge chuông ==================
  if($('notifBell')){ updateBellBadge(); }

  // ================== SHELL cho trang con (profile / settings / notifications) ==================
  var PAGE = document.body.getAttribute('data-page');
  var subApp = $('subApp');
  if(PAGE && subApp){
    var user = requireAuth();
    if(!user){ /* đã redirect */ } else {
      var PAGE_META = {
        profile:['Hồ sơ cá nhân','Quản lý thông tin và bảo mật tài khoản'],
        settings:['Cài đặt','Tùy chỉnh tài khoản, thông báo và hệ thống'],
        notifications:['Thông báo','Cảnh báo tồn kho, nhiệm vụ và hoạt động hệ thống']
      };
      var ACC_NAV = [
        {id:'profile',label:'Hồ sơ cá nhân',href:'profile.html',icon:'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z'},
        {id:'notifications',label:'Thông báo',href:'notifications.html',icon:'M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 0 1-3.46 0'},
        {id:'settings',label:'Cài đặt',href:'settings.html',icon:'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z'}
      ];
      function renderShell(){
        var navItems = (SS.NAV && SS.NAV[user.role])?SS.NAV[user.role]:[];
        var navHtml = navItems.map(function(it){
          return '<a class="nav-item" href="dashboard.html">'+icon(it.icon)+'<span>'+it.label+'</span></a>';
        }).join('');
        var accHtml = '<div class="sub-nav-sec">Tài khoản</div>' + ACC_NAV.map(function(a){
          return '<a class="nav-item'+(a.id===PAGE?' active':'')+'" href="'+a.href+'">'+icon(a.icon)+'<span>'+a.label+'</span></a>';
        }).join('');
        var meta = PAGE_META[PAGE]||['',''];
        var uc = unreadCount();
        subApp.innerHTML =
          '<div class="sub-layout">'+
            '<aside class="sub-sidebar">'+
              '<div class="sub-sidebar-logo">'+
                '<svg width="32" height="32" viewBox="0 0 56 56" fill="none"><path d="M28 6L48 16V40L28 50L8 40V16L28 6Z" stroke="#1e3a8a" stroke-width="3" fill="#eff6ff"/><rect x="18" y="30" width="8" height="8" rx="1.5" fill="#2563eb"/><rect x="28" y="34" width="8" height="8" rx="1.5" fill="#3b82f6"/></svg>'+
                '<div><div class="name">StockSense</div><div class="sub">Điều hành tồn kho</div></div>'+
              '</div>'+
              '<div class="sub-nav">'+navHtml+accHtml+'</div>'+
              '<div class="sub-ai-box"><div class="t">AI Assistant</div><div class="d">3 tính năng AI sẵn sàng</div><a href="dashboard.html">Mở AI Panel</a></div>'+
            '</aside>'+
            '<main class="sub-main">'+
              '<div class="sub-topbar">'+
                '<div><h2>'+meta[0]+'</h2><p>'+meta[1]+'</p></div>'+
                '<div class="sub-topbar-right">'+
                  '<a class="icon-btn" href="notifications.html" id="subBell" title="Thông báo">'+icon('M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 0 1-3.46 0',18)+(uc>0?'<span class="badge-dot">'+(uc>9?'9+':uc)+'</span>':'')+'</a>'+
                  '<a class="icon-btn" href="settings.html" title="Cài đặt">'+icon('M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z',18)+'</a>'+
                  '<div class="sub-user-info"><div class="n" id="subUserName">'+user.name+'</div><div class="r">'+user.roleLabel+'</div></div>'+
                  '<a class="sub-avatar" href="profile.html" title="Hồ sơ">'+(user.name?user.name.charAt(0).toUpperCase():'U')+'</a>'+
                  '<button class="logout-btn" id="subLogout" style="padding:8px 14px;background:#fff;border:1px solid var(--border);border-radius:8px;font-size:13px;font-weight:500;color:var(--muted);cursor:pointer;display:flex;align-items:center;gap:6px;font-family:Sora,sans-serif;transition:all .15s;">'+icon('M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9',14)+' Đăng xuất</button>'+
                '</div>'+
              '</div>'+
              '<div class="sub-content" id="subContent"></div>'+
            '</main>'+
          '</div>';
        $('subLogout').addEventListener('click',logout);
      }
      renderShell();
      var subContent = $('subContent');

      // ---------- PROFILE ----------
      if(PAGE==='profile'){
        function renderProfile(){
          var tasksDone = DB.tasks.filter(function(t){return t.status==='Hoàn thành';}).length;
          subContent.innerHTML =
            '<div class="stack">'+
              '<div class="card" style="display:flex;align-items:center;gap:20px;flex-wrap:wrap;">'+
                '<div class="avatar-lg">'+(user.name?user.name.charAt(0).toUpperCase():'U')+'</div>'+
                '<div style="flex:1;min-width:200px;">'+
                  '<h1 style="font-size:22px;font-weight:700;margin:0 0 6px;" id="pfNameDisplay">'+user.name+'</h1>'+
                  '<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:8px;">'+badge(user.roleLabel,user.roleLabel)+'</div>'+
                  '<div style="font-size:13px;color:var(--muted);">'+user.email+' · Tham gia tháng 10/2026</div>'+
                '</div>'+
                '<div style="display:flex;gap:24px;text-align:center;">'+
                  '<div><div style="font-size:22px;font-weight:700;color:var(--accent);">'+DB.tasks.length+'</div><div style="font-size:11px;color:var(--muted);">Nhiệm vụ</div></div>'+
                  '<div><div style="font-size:22px;font-weight:700;color:var(--success);">'+tasksDone+'</div><div style="font-size:11px;color:var(--muted);">Hoàn thành</div></div>'+
                  '<div><div style="font-size:22px;font-weight:700;color:var(--accent2);">'+DB.movements.length+'</div><div style="font-size:11px;color:var(--muted);">Di chuyển</div></div>'+
                '</div>'+
              '</div>'+
              '<div class="grid-2">'+
                '<div class="card">'+
                  '<h3 class="card-title"><span class="ico">'+icon('M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z',16)+'</span>Thông tin cá nhân</h3>'+
                  '<p class="card-sub">Cập nhật thông tin liên hệ của bạn</p>'+
                  '<form id="pfForm">'+
                    '<div class="field-row"><label class="field-label">Họ và tên</label><div class="field-wrap"><span class="field-icon">'+icon('M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z',18)+'</span><input class="inp" id="pfName" value="'+user.name+'"></div></div>'+
                    '<div class="field-row"><label class="field-label">Email</label><div class="field-wrap"><span class="field-icon">'+icon('M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2Z M22 6l-10 7L2 6',18)+'</span><input class="inp" value="'+user.email+'" disabled style="background:#f8fafc;color:var(--muted);"></div></div>'+
                    '<div class="field-row"><label class="field-label">Số điện thoại</label><div class="field-wrap"><span class="field-icon">'+icon('M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z',18)+'</span><input class="inp" id="pfPhone" placeholder="09xx xxx xxx" value="'+(user.phone||'')+'"></div></div>'+
                    '<div class="field-row"><label class="field-label">Bộ phận</label><div class="field-wrap"><span class="field-icon">'+icon('M3 21h18 M5 21V7l8-4v18 M19 21V11l-6-4',18)+'</span><select class="inp select-inp" id="pfDept"><option>Kho hàng</option><option>Quản lý vận hành</option><option>Mua hàng</option><option>Công nghệ thông tin</option></select><span class="select-arrow">'+icon('M6 9l6 6 6-6',16)+'</span></div></div>'+
                    '<div class="field-row"><label class="field-label">Vai trò</label><div class="field-wrap"><span class="field-icon">'+icon('M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7Z',18)+'</span><input class="inp" value="'+user.roleLabel+'" disabled style="background:#f8fafc;color:var(--muted);"></div></div>'+
                    '<button type="submit" class="btn btn-primary" style="width:100%;" id="pfSave"><span id="pfSaveText">Lưu thay đổi</span></button>'+
                  '</form>'+
                '</div>'+
                '<div class="stack">'+
                  '<div class="card">'+
                    '<h3 class="card-title"><span class="ico">'+icon('M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z',16)+'</span>Đổi mật khẩu</h3>'+
                    '<p class="card-sub">Đảm bảo tài khoản luôn được bảo vệ</p>'+
                    '<form id="pfPwForm">'+
                      '<div class="field-row"><label class="field-label">Mật khẩu hiện tại</label><div class="field-wrap"><span class="field-icon">'+icon('M3 11h18v10H3z M7 11V7a5 5 0 0 1 10 0v4',18)+'</span><input type="password" class="inp" id="pfOldPw" placeholder="Nhập mật khẩu hiện tại"><button type="button" class="toggle-pw" data-target="pfOldPw">'+icon('M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z M12 12m-3 0a3 3 0 1 0 6 0 3 3 0 1 0-6 0',18)+'</button></div></div>'+
                      '<div class="field-row"><label class="field-label">Mật khẩu mới</label><div class="field-wrap"><span class="field-icon">'+icon('M3 11h18v10H3z M7 11V7a5 5 0 0 1 10 0v4',18)+'</span><input type="password" class="inp" id="pfNewPw" placeholder="Tối thiểu 6 ký tự"><button type="button" class="toggle-pw" data-target="pfNewPw">'+icon('M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z M12 12m-3 0a3 3 0 1 0 6 0 3 3 0 1 0-6 0',18)+'</button></div></div>'+
                      '<div class="field-row"><label class="field-label">Xác nhận mật khẩu mới</label><div class="field-wrap"><span class="field-icon">'+icon('M3 11h18v10H3z M7 11V7a5 5 0 0 1 10 0v4',18)+'</span><input type="password" class="inp" id="pfNewPw2" placeholder="Nhập lại mật khẩu mới"></div></div>'+
                      '<div id="pfPwMsg" class="global-msg"></div>'+
                      '<button type="submit" class="btn btn-primary" style="width:100%;">Cập nhật mật khẩu</button>'+
                    '</form>'+
                  '</div>'+
                  '<div class="card">'+
                    '<h3 class="card-title"><span class="ico">'+icon('M12 8v4l3 3 M12 22a10 10 0 1 1 0-20 10 10 0 0 1 0 20Z',16)+'</span>Hoạt động gần đây</h3>'+
                    '<p class="card-sub">5 thao tác gần nhất trên hệ thống</p>'+
                    (DB.movements.slice(0,3).map(function(m){
                      return '<div class="kv"><span class="k">'+m.sku+' · '+m.from+' → '+m.to+'</span><span class="v" style="font-weight:500;font-size:12px;">'+m.time+'</span></div>';
                    }).join(''))+
                  '</div>'+
                '</div>'+
              '</div>'+
            '</div>';
          // toggle password visibility
          subContent.querySelectorAll('.toggle-pw').forEach(function(b){
            b.addEventListener('click',function(){var el=$(b.getAttribute('data-target'));if(el)el.type=el.type==='password'?'text':'password';});
          });
          // save profile
          $('pfForm').addEventListener('submit',function(e){
            e.preventDefault();
            var name=$('pfName').value.trim();
            if(!name||name.length<2){toast('Họ tên không hợp lệ');return;}
            var btn=$('pfSave'),txt=$('pfSaveText');
            btn.disabled=true;txt.innerHTML='<span class="spin"></span> Đang lưu...';
            setTimeout(function(){
              var em=(user.email||'').toLowerCase().trim();
              var all=SS.getAllAccounts?SS.getAllAccounts():{};
              var acc=em?all[em]:null;
              var merged={pw:(acc?acc.pw:'123456'),role:user.role,name:name,roleLabel:user.roleLabel,phone:$('pfPhone').value.trim(),dept:$('pfDept').value,email:em||user.email};
              if(em && SS.saveExtraAccount){ try{SS.saveExtraAccount(em, merged);}catch(e){} }
              user.name=name; user.phone=merged.phone; user.dept=merged.dept; if(em)user.email=em;
              setCurrentUser(user);
              var initial=name?name.charAt(0).toUpperCase():'U';
              $('pfNameDisplay').textContent=name;
              var subName=$('subUserName'); if(subName)subName.textContent=name;
              var avTop=document.querySelector('.sub-avatar'); if(avTop)avTop.textContent=initial;
              var avBig=document.querySelector('.avatar-lg'); if(avBig)avBig.textContent=initial;
              btn.disabled=false;txt.textContent='Lưu thay đổi';
              toast('Đã cập nhật thông tin cá nhân');
            },600);
          });
          // change password
          $('pfPwForm').addEventListener('submit',function(e){
            e.preventDefault();
            var msg=$('pfPwMsg'); msg.className='global-msg';
            var old=$('pfOldPw').value, np=$('pfNewPw').value, np2=$('pfNewPw2').value;
            var all=SS.getAllAccounts?SS.getAllAccounts():{};
            var acc=all[user.email];
            if(!acc || acc.pw!==old){msg.className='global-msg err';msg.textContent='Mật khẩu hiện tại không đúng.';return;}
            if(!np||np.length<6){msg.className='global-msg err';msg.textContent='Mật khẩu mới phải có ít nhất 6 ký tự.';return;}
            if(np!==np2){msg.className='global-msg err';msg.textContent='Mật khẩu xác nhận không khớp.';return;}
            var em=(user.email||'').toLowerCase().trim();
            if(em && SS.saveExtraAccount){ try{SS.saveExtraAccount(em,{pw:np,role:user.role,name:user.name,roleLabel:user.roleLabel,phone:user.phone,dept:user.dept,email:em});}catch(e){} }
            $('pfOldPw').value='';$('pfNewPw').value='';$('pfNewPw2').value='';
            msg.className='global-msg ok';msg.textContent='Đổi mật khẩu thành công.';
            toast('Mật khẩu đã được cập nhật');
          });
        }
        renderProfile();
      }

      // ---------- SETTINGS ----------
      if(PAGE==='settings'){
        var S = loadSettings();
        function sw(key,label,desc){
          return '<div class="setting-row"><div><div class="t">'+label+'</div><div class="d">'+desc+'</div></div><label class="switch"><input type="checkbox" data-key="'+key+'" '+(S[key]?'checked':'')+'><span class="slider"></span></label></div>';
        }
        function sel(key,label,desc,options){
          var opts=options.map(function(o){return '<option value="'+o.v+'" '+(S[key]===o.v?'selected':'')+'>'+o.t+'</option>';}).join('');
          return '<div class="setting-row"><div><div class="t">'+label+'</div><div class="d">'+desc+'</div></div><div class="field-wrap" style="width:180px;"><select class="inp select-inp" data-key="'+key+'">'+opts+'</select><span class="select-arrow">'+icon('M6 9l6 6 6-6',16)+'</span></div></div>';
        }
        subContent.innerHTML =
          '<div class="stack">'+
            '<div class="card">'+
              '<h3 class="card-title"><span class="ico">'+icon('M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z',16)+'</span>Bảo mật tài khoản</h3>'+
              '<p class="card-sub">Bảo vệ tài khoản và phiên đăng nhập</p>'+
              sw('twoFactor','Xác thực hai lớp (2FA)','Yêu cầu mã OTP qua email mỗi lần đăng nhập')+
              sw('killOnClose','Đăng xuất khi đóng trình duyệt','Tự động kết thúc phiên để bảo mật cao hơn')+
              sel('sessionTimeout','Thời gian phiên đăng nhập','Tự động đăng xuất sau khoảng thời gian không hoạt động',[{v:'15',t:'15 phút'},{v:'30',t:'30 phút'},{v:'60',t:'60 phút'},{v:'0',t:'Không bao giờ'}])+
            '</div>'+
            '<div class="card">'+
              '<h3 class="card-title"><span class="ico">'+icon('M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 0 1-3.46 0',16)+'</span>Thông báo</h3>'+
              '<p class="card-sub">Kênh nhận cảnh báo tồn kho và nhiệm vụ</p>'+
              sw('emailAlerts','Cảnh báo qua email','Gửi email khi sản phẩm dưới ngưỡng tồn kho')+
              sw('pushAlerts','Thông báo đẩy trình duyệt','Nhận thông báo ngay cả khi không mở StockSense')+
              sw('lowStockSound','Âm thanh cảnh báo','Phát âm thanh khi tồn kho xuống mức nguy cấp')+
              sw('autoRead','Tự động đánh dấu đã đọc','Ẩn badge thông báo sau khi xem danh sách')+
            '</div>'+
            '<div class="card">'+
              '<h3 class="card-title"><span class="ico">'+icon('M12 19l7-7 3 3-7 7-3-3z M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z M2 2l7.586 7.586 M11 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z',16)+'</span>Giao diện & khu vực</h3>'+
              '<p class="card-sub">Ngôn ngữ, đơn vị và hiển thị bảng dữ liệu</p>'+
              sel('lang','Ngôn ngữ','Ngôn ngữ hiển thị giao diện',[{v:'vi',t:'Tiếng Việt'},{v:'en',t:'English'}])+
              sel('currency','Đơn vị tiền tệ','Định dạng giá trị sản phẩm và đơn hàng',[{v:'VND',t:'VND (₫)'},{v:'USD',t:'USD ($)'},{v:'EUR',t:'EUR (€)'}])+
              sel('defaultSort','Sắp xếp bảng mặc định','Thứ tự hiển thị danh sách sản phẩm',[{v:'name',t:'Theo tên A→Z'},{v:'qty',t:'Theo số lượng tăng dần'},{v:'qtydesc',t:'Theo số lượng giảm dần'},{v:'sku',t:'Theo mã SKU'}])+
              sw('compact','Giao diện gọn','Giảm khoảng cách để hiển thị nhiều dữ liệu hơn')+
            '</div>'+
            '<div class="card" style="border-color:rgba(220,38,38,.3);">'+
              '<h3 class="card-title" style="color:var(--danger);"><span class="ico" style="background:var(--danger-soft);color:var(--danger);">'+icon('M12 9v4 M12 17h.01 M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z',16)+'</span>Khu vực nguy hiểm</h3>'+
              '<p class="card-sub">Các thao tác không thể hoàn tác</p>'+
              '<div style="display:flex;gap:10px;flex-wrap:wrap;">'+
                '<button class="btn btn-ghost" id="btnKillSessions">Đăng xuất tất cả thiết bị</button>'+
                '<button class="btn btn-danger" id="btnDeleteAccount">Xóa tài khoản</button>'+
              '</div>'+
            '</div>'+
          '</div>';
        subContent.querySelectorAll('input[data-key], select[data-key]').forEach(function(el){
          el.addEventListener('change',function(){
            var k=el.getAttribute('data-key');
            S[k] = el.type==='checkbox' ? el.checked : el.value;
            saveSettings(S);
            toast('Đã lưu cài đặt');
          });
        });
        $('btnKillSessions').addEventListener('click',function(){
          toast('Đã đăng xuất tất cả thiết bị khác');
        });
        $('btnDeleteAccount').addEventListener('click',function(){
          if(!confirm('Bạn có chắc muốn xóa tài khoản '+user.email+'? Hành động này không thể hoàn tác.')) return;
          // chỉ xóa được tài khoản tự đăng ký (extra), tài khoản demo không thể xóa
          var all=SS.getAllAccounts?SS.getAllAccounts():{};
          var isDemo = SS.ACCOUNTS && SS.ACCOUNTS[user.email];
          if(isDemo){toast('Tài khoản demo không thể xóa');return;}
          if(SS.removeExtraAccount) SS.removeExtraAccount(user.email);
          logout();
        });
      }

      // ---------- NOTIFICATIONS ----------
      if(PAGE==='notifications'){
        var currentFilter='all';
        function renderNotifs(){
          var all=buildNotifs();
          var list = currentFilter==='all'?all
            : currentFilter==='unread'?all.filter(function(n){return n.unread;})
            : currentFilter==='Cảnh báo'?all.filter(function(n){return n.cat==='Cảnh báo';})
            : currentFilter==='Nhiệm vụ'?all.filter(function(n){return n.cat==='Nhiệm vụ';})
            : all.filter(function(n){return n.cat==='Hệ thống'||n.cat==='Yêu cầu';});
          var uc=all.filter(function(n){return n.unread;}).length;
          var tabs=[['all','Tất cả ('+all.length+')'],['unread','Chưa đọc ('+uc+')'],['Cảnh báo','Cảnh báo'],['Nhiệm vụ','Nhiệm vụ'],['Hệ thống','Hệ thống']];
          subContent.innerHTML =
            '<div class="card">'+
              '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:14px;">'+
                '<div class="tabs" style="margin-bottom:0;">'+
                  tabs.map(function(t){return '<div class="tab'+(currentFilter===t[0]?' active':'')+'" data-f="'+t[0]+'">'+t[1]+'</div>';}).join('')+
                '</div>'+
                '<button class="btn btn-ghost" id="markAll" style="padding:8px 14px;font-size:12.5px;">'+icon('M20 6L9 17l-5-5',14)+' Đánh dấu tất cả đã đọc</button>'+
              '</div>'+
              (list.length===0
                ? '<div style="text-align:center;padding:50px 20px;color:var(--muted);"><div style="font-size:40px;margin-bottom:12px;">'+icon('M22 11.08V12a10 10 0 1 1-5.93-9.14 M22 4L12 14.01l-3-3',40)+'</div><div style="font-weight:600;color:var(--text);margin-bottom:4px;">Không có thông báo</div><div style="font-size:13px;">Bạn đã cập nhật tất cả thông báo mới nhất.</div></div>'
                : list.map(function(n){
                    return '<div class="notif-item'+(n.unread?' unread':'')+'" data-id="'+n.id+'">'+
                      '<div class="notif-icon" style="background:'+n.color+'1a;color:'+n.color+';">'+icon(n.icon,18)+'</div>'+
                      '<div class="notif-body">'+
                        '<div class="notif-title">'+n.title+(n.unread?' <span class="badge" style="background:var(--accent-soft);color:var(--accent);margin-left:6px;">Mới</span>':'')+'</div>'+
                        '<p class="notif-desc">'+n.desc+'</p>'+
                        '<div class="notif-time">'+badge(n.cat,n.cat)+' · '+n.time+'</div>'+
                      '</div>'+
                      (n.unread?'<span class="notif-dot"></span>':'')+
                    '</div>';
                  }).join(''))+
            '</div>';
          subContent.querySelectorAll('.tab').forEach(function(t){
            t.addEventListener('click',function(){currentFilter=t.getAttribute('data-f');renderNotifs();});
          });
          subContent.querySelectorAll('.notif-item').forEach(function(it){
            it.addEventListener('click',function(){
              addReadNotif(it.getAttribute('data-id'));
              renderNotifs();
              updateBellBadge();
            });
          });
          $('markAll').addEventListener('click',function(){
            markAllRead(); renderNotifs(); updateBellBadge(); toast('Đã đánh dấu tất cả đã đọc');
          });
        }
        function S_autoRead(){var s=loadSettings();return !!s.autoRead;}
        renderNotifs();
      }
    }
  }
})();
