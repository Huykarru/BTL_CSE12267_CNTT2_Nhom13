// ===== StockSense - Toàn bộ logic =====
(function(){
  // ===== Mock data =====
  var DB = {
    products: [
      {id:'SKU-001',name:'Tai nghe Bluetooth X1',cat:'Điện tử',qty:240,min:50,loc:'A-01-03',price:850000},
      {id:'SKU-002',name:'Sạc nhanh 20W',cat:'Phụ kiện',qty:18,min:40,loc:'A-02-01',price:250000},
      {id:'SKU-003',name:'Ốp lưng iPhone 15',cat:'Phụ kiện',qty:520,min:100,loc:'B-01-02',price:120000},
      {id:'SKU-004',name:'Laptop Dell Vostro',cat:'Điện tử',qty:35,min:10,loc:'C-03-01',price:18500000},
      {id:'SKU-005',name:'Cáp USB-C 1m',cat:'Phụ kiện',qty:8,min:60,loc:'A-02-02',price:95000},
      {id:'SKU-006',name:'Chuột không dây M2',cat:'Điện tử',qty:130,min:30,loc:'B-02-01',price:350000}
    ],
    locations: [
      {id:'A-01-03',zone:'A',row:1,level:3,capacity:500,used:240,type:'Nhiệt độ thường'},
      {id:'A-02-01',zone:'A',row:2,level:1,capacity:300,used:18,type:'Nhiệt độ thường'},
      {id:'B-01-02',zone:'B',row:1,level:2,capacity:800,used:520,type:'Nhiệt độ thường'},
      {id:'C-03-01',zone:'C',row:3,level:1,capacity:100,used:35,type:'Hàng giá trị cao'},
      {id:'A-02-02',zone:'A',row:2,level:2,capacity:400,used:8,type:'Nhiệt độ thường'},
      {id:'B-02-01',zone:'B',row:2,level:1,capacity:300,used:130,type:'Nhiệt độ thường'}
    ],
    tasks: [
      {id:'TASK-101',type:'Kiểm kê',loc:'A-02',assignee:'Nguyễn Văn A',status:'Đang làm',priority:'Cao',due:'2026-10-13'},
      {id:'TASK-102',type:'Chuyển vị trí',loc:'B-01 → B-03',assignee:'Trần Thị B',status:'Chờ duyệt',priority:'Trung bình',due:'2026-10-14'},
      {id:'TASK-103',type:'Kiểm kê',loc:'C-03',assignee:'Lê Văn C',status:'Hoàn thành',priority:'Thấp',due:'2026-10-12'},
      {id:'TASK-104',type:'Nhập hàng',loc:'A-01',assignee:'Phạm Văn D',status:'Đang làm',priority:'Cao',due:'2026-10-13'}
    ],
    alerts: [
      {id:'AL-01',sku:'SKU-002',name:'Sạc nhanh 20W',type:'Thấp hơn ngưỡng',current:18,min:40,level:'Cao'},
      {id:'AL-02',sku:'SKU-005',name:'Cáp USB-C 1m',type:'Thấp hơn ngưỡng',current:8,min:60,level:'Nguy cấp'},
      {id:'AL-03',sku:'SKU-004',name:'Laptop Dell Vostro',type:'Lưu trữ bất thường',current:35,min:10,level:'Trung bình'}
    ],
    movements: [
      {id:'MV-501',sku:'SKU-003',from:'B-01-02',to:'B-03-01',qty:50,user:'Trần Thị B',time:'2026-10-13 09:24',status:'Hoàn thành'},
      {id:'MV-502',sku:'SKU-001',from:'A-01-03',to:'Xuất kho',qty:20,user:'Nguyễn Văn A',time:'2026-10-13 08:15',status:'Hoàn thành'},
      {id:'MV-503',sku:'SKU-006',from:'Nhà cung cấp',to:'B-02-01',qty:80,user:'Phạm Văn D',time:'2026-10-12 16:40',status:'Hoàn thành'}
    ],
    users: [
      {id:'U-01',name:'Nguyễn Văn A',email:'worker@stocksense.vn',role:'Nhân viên kho',status:'Hoạt động'},
      {id:'U-02',name:'Trần Thị B',email:'supervisor@stocksense.vn',role:'Giám sát kho',status:'Hoạt động'},
      {id:'U-03',name:'Lê Văn C',email:'planner@stocksense.vn',role:'Điều phối nhập hàng',status:'Hoạt động'},
      {id:'U-04',name:'Phạm Văn D',email:'admin@stocksense.vn',role:'Quản trị viên',status:'Hoạt động'}
    ],
    requests: [
      {id:'REQ-001',type:'Kiểm kê',by:'Nguyễn Văn A',detail:'Khu A-02 · Đã đếm 3 SKU (Sạc 20W, Cáp USB-C, Tai nghe X1)',status:'Chờ duyệt',time:'2026-10-13 09:30'},
      {id:'REQ-002',type:'Chuyển vị trí',by:'Nguyễn Văn A',detail:'SKU-003 · 50 chiếc · B-01-02 → B-03-01',status:'Chờ duyệt',time:'2026-10-13 10:15'},
      {id:'REQ-003',type:'Hoàn thành nhiệm vụ',by:'Lê Văn C',detail:'TASK-103 · Kiểm kê khu C-03',status:'Đã duyệt',time:'2026-10-12 15:00'}
    ]
  };

  var ACCOUNTS = {
    'admin@stocksense.vn':{pw:'admin123',role:'admin',name:'Phạm Văn D',roleLabel:'Quản trị viên'},
    'supervisor@stocksense.vn':{pw:'123456',role:'supervisor',name:'Trần Thị B',roleLabel:'Giám sát kho'},
    'worker@stocksense.vn':{pw:'123456',role:'worker',name:'Nguyễn Văn A',roleLabel:'Nhân viên kho'},
    'planner@stocksense.vn':{pw:'123456',role:'planner',name:'Lê Văn C',roleLabel:'Điều phối nhập hàng'}
  };

  var NAV = {
    admin:[
      {id:'dashboard',label:'Bảng điều khiển',icon:'M3 13h8V3H3v10Zm0 8h8v-6H3v6Zm10 0h8V11h-8v10Zm0-18v6h8V3h-8Z'},
      {id:'products',label:'Quản lý sản phẩm',icon:'M20.59 13.41 13.42 20.58a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82ZM7 7h.01'},
      {id:'locations',label:'Quản lý vị trí',icon:'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0Z M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z'},
      {id:'users',label:'Quản lý người dùng',icon:'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75'},
      {id:'requests',label:'Yêu cầu chờ duyệt',icon:'M9 11l3 3L22 4 M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11'},
      {id:'ai',label:'AI Assistant',icon:'M12 2a3 3 0 0 0-3 3v1H7a2 2 0 0 0-2 2v1H4a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h1v1a2 2 0 0 0 2 2h2v1a3 3 0 0 0 6 0v-1h2a2 2 0 0 0 2-2v-1h1a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2h-1V8a2 2 0 0 0-2-2h-2V5a3 3 0 0 0-3-3Z'}
    ],
    supervisor:[
      {id:'dashboard',label:'Bảng điều khiển',icon:'M3 13h8V3H3v10Zm0 8h8v-6H3v6Zm10 0h8V11h-8v10Zm0-18v6h8V3h-8Z'},
      {id:'variance',label:'Xử lý chênh lệch',icon:'M3 3v18h18 M7 14l4-4 4 4 5-5'},
      {id:'alerts',label:'Cảnh báo tồn kho',icon:'M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z M12 9v4 M12 17h.01'},
      {id:'requests',label:'Yêu cầu chờ duyệt',icon:'M9 11l3 3L22 4 M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11'},
      {id:'ai',label:'AI Assistant',icon:'M12 2a3 3 0 0 0-3 3v1H7a2 2 0 0 0-2 2v1H4a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h1v1a2 2 0 0 0 2 2h2v1a3 3 0 0 0 6 0v-1h2a2 2 0 0 0 2-2v-1h1a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2h-1V8a2 2 0 0 0-2-2h-2V5a3 3 0 0 0-3-3Z'}
    ],
    worker:[
      {id:'tasks',label:'Danh sách nhiệm vụ',icon:'M9 11l3 3L22 4 M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11'},
      {id:'stockcheck',label:'Kiểm kê tồn kho',icon:'M9 11l3 3L22 4 M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11'},
      {id:'move',label:'Chuyển vị trí hàng',icon:'M5 9l-3 3 3 3 M9 5l3-3 3 3 M19 15l3 3-3 3 M15 19l-3 3-3-3 M2 12h20 M12 2v20'},
      {id:'ai',label:'AI Assistant',icon:'M12 2a3 3 0 0 0-3 3v1H7a2 2 0 0 0-2 2v1H4a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h1v1a2 2 0 0 0 2 2h2v1a3 3 0 0 0 6 0v-1h2a2 2 0 0 0 2-2v-1h1a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2h-1V8a2 2 0 0 0-2-2h-2V5a3 3 0 0 0-3-3Z'}
    ],
    planner:[
      {id:'dashboard',label:'Bảng điều khiển',icon:'M3 13h8V3H3v10Zm0 8h8v-6H3v6Zm10 0h8V11h-8v10Zm0-18v6h8V3h-8Z'},
      {id:'replenish',label:'Kế hoạch bổ sung',icon:'M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8 M21 3v5h-5'},
      {id:'forecast',label:'Dự báo tồn kho',icon:'M23 6l-9.5 9.5-5-5L1 18 M17 6h6v6'},
      {id:'movements',label:'Lịch sử di chuyển',icon:'M12 2v4 M12 18v4 M4.93 4.93l2.83 2.83 M16.24 16.24l2.83 2.83 M2 12h4 M18 12h4 M4.93 19.07l2.83-2.83 M16.24 7.76l2.83-2.83'},
      {id:'ai',label:'AI Assistant',icon:'M12 2a3 3 0 0 0-3 3v1H7a2 2 0 0 0-2 2v1H4a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h1v1a2 2 0 0 0 2 2h2v1a3 3 0 0 0 6 0v-1h2a2 2 0 0 0 2-2v-1h1a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2h-1V8a2 2 0 0 0-2-2h-2V5a3 3 0 0 0-3-3Z'}
    ]
  };

  var TITLES = {
    dashboard:['Bảng điều khiển','Tổng quan hoạt động kho hàng'],
    products:['Quản lý sản phẩm','Danh mục SKU và tồn kho'],
    locations:['Quản lý vị trí','Kệ, khu và sức chứa'],
    users:['Quản lý người dùng','Tài khoản và phân quyền'],
    variance:['Xử lý chênh lệch kiểm kê','So sánh số liệu hệ thống vs thực tế'],
    alerts:['Cảnh báo tồn kho','Sản phẩm dưới ngưỡng hoặc bất thường'],
    tasks:['Danh sách nhiệm vụ','Nhiệm vụ kiểm kê và chuyển vị trí'],
    stockcheck:['Kiểm kê tồn kho','Đếm thực tế tại vị trí'],
    move:['Chuyển vị trí hàng hóa','Tạo lệnh di chuyển trong kho'],
    replenish:['Kế hoạch bổ sung','Đề xuất nhập hàng theo ngưỡng'],
    forecast:['Dự báo tồn kho','AI dự đoán nguy cơ hết hàng'],
    movements:['Lịch sử di chuyển','Nhật ký nhập/xuất/chuyển vị trí'],
    ai:['AI Assistant','3 tính năng AI hỗ trợ quyết định'],
    requests:['Yêu cầu chờ duyệt','Các yêu cầu từ nhân viên kho cần phê duyệt']
  };

  var currentUser = null, currentTab = 'dashboard';

  // ===== Helpers =====
  function icon(path,size){return '<svg width="'+(size||18)+'" height="'+(size||18)+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="'+path+'"/></svg>';}
  function badge(text,color){var map={Cao:'#dc2626',Thấp:'#059669','Trung bình':'#d97706','Nguy cấp':'#dc2626','Hoạt động':'#059669','Đang làm':'#2563eb','Chờ duyệt':'#d97706','Hoàn thành':'#059669','Thấp hơn ngưỡng':'#dc2626','Lưu trữ bất thường':'#d97706'};var c=map[color]||'#64748b';return '<span class="badge" style="background:'+c+'1a;color:'+c+';">'+text+'</span>';}
  function fmt(n){return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g,'.');}

  // Map tên vai trò (trong bảng) sang mã vai trò (dùng để phân quyền menu)
  var ROLE_MAP={
    'Quản trị viên':{role:'admin',roleLabel:'Quản trị viên'},
    'Giám sát kho':{role:'supervisor',roleLabel:'Giám sát kho'},
    'Nhân viên kho':{role:'worker',roleLabel:'Nhân viên kho'},
    'Điều phối nhập hàng':{role:'planner',roleLabel:'Điều phối nhập hàng'}
  };
  // Tài khoản thêm bởi admin được lưu trong localStorage, hợp nhất với tài khoản demo cố định
  function getAllAccounts(){
    var extra={};
    try{var s=localStorage.getItem('ss_extra_accounts');if(s)extra=JSON.parse(s)||{};}catch(e){}
    var out={};
    for(var k in ACCOUNTS)out[k]=ACCOUNTS[k];
    for(var e in extra)out[e]=extra[e];
    return out;
  }
  function saveExtraAccount(email,data){
    var extra={};
    try{var s=localStorage.getItem('ss_extra_accounts');if(s)extra=JSON.parse(s)||{};}catch(e){}
    extra[email.toLowerCase().trim()]=data;
    try{localStorage.setItem('ss_extra_accounts',JSON.stringify(extra));}catch(e){}
  }
  function removeExtraAccount(email){
    var extra={};
    try{var s=localStorage.getItem('ss_extra_accounts');if(s)extra=JSON.parse(s)||{};}catch(e){}
    delete extra[email.toLowerCase().trim()];
    try{localStorage.setItem('ss_extra_accounts',JSON.stringify(extra));}catch(e){}
  }

  // ===== Tồn kho động & nhận diện nguy cơ đã khắc phục =====
  function loadProducts(){
    try{var s=localStorage.getItem('ss_products');if(s){var arr=JSON.parse(s)||[];arr.forEach(function(np){var p=DB.products.find(function(x){return x.id===np.id;});if(p&&np.qty!==undefined){p.qty=np.qty;if(np.min!==undefined)p.min=np.min;}});}}catch(e){}
  }
  function saveProducts(){
    try{localStorage.setItem('ss_products',JSON.stringify(DB.products.map(function(p){return {id:p.id,qty:p.qty,min:p.min};})));}catch(e){}
  }
  function recomputeAlerts(){
    var low=DB.products.filter(function(p){return p.qty<p.min;});
    DB.alerts=low.map(function(p,i){
      var ratio=p.qty/p.min;
      var level=ratio<0.3?'Nguy cấp':(ratio<0.6?'Cao':'Trung bình');
      return {id:'AL-'+(String(i+1).padStart(2,'0')),sku:p.id,name:p.name,type:'Thấp hơn ngưỡng',current:p.qty,min:p.min,level:level};
    });
  }
  function getResolvedNotifs(){
    try{var s=localStorage.getItem('ss_resolved_notifs');return s?JSON.parse(s)||[]:[];}catch(e){return [];}
  }
  function addResolvedNotif(sku,name){
    var list=getResolvedNotifs();
    var now=new Date();
    var time=now.getFullYear()+'-'+String(now.getMonth()+1).padStart(2,'0')+'-'+String(now.getDate()).padStart(2,'0')+' '+String(now.getHours()).padStart(2,'0')+':'+String(now.getMinutes()).padStart(2,'0');
    list.unshift({sku:sku,name:name,time:time});
    try{localStorage.setItem('ss_resolved_notifs',JSON.stringify(list.slice(0,10)));}catch(e){}
  }
  function ai1Result(){
    var risky=DB.products.filter(function(p){return p.qty<p.min;});
    var btnStyle='padding:6px 12px;background:#fff;border:1px solid var(--border);border-radius:6px;font-size:12px;font-weight:600;cursor:pointer;font-family:Sora,sans-serif;';
    if(risky.length===0){
      return '<div style="padding:14px;background:#ecfdf5;border:1px solid #a7f3d0;border-radius:10px;font-size:13px;">'+
        '<div style="font-weight:700;color:#065f46;margin-bottom:6px;">Kết quả: Không còn SKU nào có nguy cơ thiếu hàng</div>'+
        '<div style="color:#065f46;line-height:1.7;">Tất cả sản phẩm đã đạt ngưỡng tồn kho an toàn. AI không phát hiện rủi ro hết hàng trong 14 ngày tới — rủi ro đã được khắc phục thành công.</div>'+
        '<div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap;"><button onclick="runAI(\'ai1\',this.closest(\'div\').previousElementSibling)" style="'+btnStyle+'">Phân tích lại</button></div></div>';
    }
    var items=risky.map(function(p){
      var ratio=p.qty/p.min;
      var score=Math.round(Math.min(98,Math.max(40,100-ratio*45)));
      var days=Math.max(1,Math.round(p.qty/8));
      var po=Math.max(20,p.min*2-p.qty);
      return '<div style="margin-bottom:6px;">· '+p.name+' ('+p.id+'): điểm '+score+'/100 — dự kiến hết hàng trong '+days+' ngày. <button onclick="resolveRisk(\''+p.id+'\')" style="padding:3px 10px;background:#059669;color:#fff;border:none;border-radius:5px;font-size:11px;font-weight:600;cursor:pointer;font-family:Sora,sans-serif;margin-left:6px;">Khắc phục (nhập '+po+')</button></div>';
    }).join('');
    var totalPo=risky.reduce(function(s,p){return s+Math.max(20,p.min*2-p.qty);},0);
    return '<div style="padding:14px;background:#ecfdf5;border:1px solid #a7f3d0;border-radius:10px;font-size:13px;">'+
      '<div style="font-weight:700;color:#065f46;margin-bottom:6px;">Kết quả: '+risky.length+' SKU có nguy cơ cao</div>'+
      '<div style="color:#065f46;line-height:1.9;">'+items+'</div>'+
      '<div style="color:#047857;margin-top:6px;"><strong>Gợi ý:</strong> Tạo PO nhập tổng '+totalPo+' đơn vị trong tuần này. Bấm "Khắc phục" để mô phỏng nhập hàng, AI sẽ phân tích lại ngay.</div>'+
      '<div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap;">'+
        '<button onclick="this.textContent=\'Đã chấp nhận\';" style="padding:6px 12px;background:#059669;color:#fff;border:none;border-radius:6px;font-size:12px;font-weight:600;cursor:pointer;font-family:Sora,sans-serif;">Chấp nhận</button>'+
        '<button onclick="document.getElementById(\'out_ai1\').innerHTML=\'\';" style="'+btnStyle+'">Từ chối</button>'+
        '<button onclick="runAI(\'ai1\',this.closest(\'div\').previousElementSibling)" style="'+btnStyle+'">Tạo lại</button>'+
      '</div></div>';
  }
  window.resolveRisk=function(sku){
    var p=DB.products.find(function(x){return x.id===sku;});
    if(!p)return;
    p.qty=Math.max(p.qty, p.min*2+50);
    saveProducts();
    recomputeAlerts();
    addResolvedNotif(sku,p.name);
    if(typeof renderContent==='function'){try{renderContent(currentTab);}catch(e){} }
    var o=document.getElementById('out_ai1');
    if(o){o.innerHTML='<div style="padding:14px;background:#f8fafc;border-radius:10px;font-size:13px;color:var(--muted);"><span class="ai-typing">Đang phân tích lại dữ liệu tồn kho</span></div>';}
    setTimeout(function(){
      var o2=document.getElementById('out_ai1');
      if(o2) o2.innerHTML=ai1Result();
    },750);
  };
  loadProducts();
  recomputeAlerts();
  // Đồng bộ tên quản trị viên: bảng "Quản lý người dùng" lấy tên từ tài khoản đăng nhập (không cứng)
  try{
    var _allAcc=getAllAccounts();
    var _adm=_allAcc['admin@stocksense.vn'];
    if(_adm){
      var _u=DB.users.find(function(x){return x.email==='admin@stocksense.vn';});
      if(_u) _u.name=_adm.name;
      DB.tasks.forEach(function(t){if(t.assignee==='Phạm Văn D')t.assignee=_adm.name;});
      DB.movements.forEach(function(m){if(m.user==='Phạm Văn D')m.user=_adm.name;});
    }
  }catch(e){}
  // ============== TRANG LOGIN ==============
  var loginForm = document.getElementById('loginForm');
  if(loginForm){
    var emailInp=document.getElementById('email'), pwInp=document.getElementById('password'), roleSel=document.getElementById('role');
    function showErr(input,errEl,msg){input.classList.add('err');errEl.querySelector('span').textContent=msg;errEl.classList.add('show');}
    function clearErr(input,errEl){input.classList.remove('err');errEl.classList.remove('show');}
    function hideGlobal(){var g=document.getElementById('globalErr');g.style.display='none';}
    function showGlobal(msg){var g=document.getElementById('globalErr');document.getElementById('globalErrText').textContent=msg;g.style.display='flex';}

    emailInp.addEventListener('input',function(){clearErr(emailInp,document.getElementById('emailErr'));hideGlobal();});
    pwInp.addEventListener('input',function(){clearErr(pwInp,document.getElementById('pwErr'));hideGlobal();});
    roleSel.addEventListener('change',function(){clearErr(roleSel,document.getElementById('roleErr'));hideGlobal();});

    document.getElementById('togglePw').addEventListener('click',function(){
      pwInp.type = pwInp.type==='password'?'text':'password';
    });

    document.getElementById('aiAssistantBtn').addEventListener('click',function(){
      showGlobal('Vui lòng đăng nhập trước để sử dụng AI Assistant.');
    });

    loginForm.addEventListener('submit',function(e){
      e.preventDefault();
      hideGlobal();
      var email=emailInp.value.trim(), pw=pwInp.value, role=roleSel.value;
      var ok=true;
      var emailRe=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if(!email){showErr(emailInp,document.getElementById('emailErr'),'Vui lòng nhập email');ok=false;}
      else if(!emailRe.test(email)){showErr(emailInp,document.getElementById('emailErr'),'Email không đúng định dạng');ok=false;}
      if(!pw){showErr(pwInp,document.getElementById('pwErr'),'Vui lòng nhập mật khẩu');ok=false;}
      else if(pw.length<6){showErr(pwInp,document.getElementById('pwErr'),'Mật khẩu phải có ít nhất 6 ký tự');ok=false;}
      if(!role){showErr(roleSel,document.getElementById('roleErr'),'Vui lòng chọn vai trò');ok=false;}
      if(!ok)return;

      var btn=document.getElementById('loginBtn'),txt=document.getElementById('loginBtnText');
      btn.disabled=true;btn.style.opacity='.7';txt.innerHTML='<span class="spin"></span> Đang kiểm tra...';
      setTimeout(function(){
        var allAcc=getAllAccounts();
        var acc=allAcc[email.toLowerCase()];
        if(!acc||acc.pw!==pw){
          showGlobal('Email hoặc mật khẩu không chính xác. Vui lòng thử lại.');
          btn.disabled=false;btn.style.opacity='1';txt.textContent='Đăng nhập';
          emailInp.classList.add('err');pwInp.classList.add('err');
          return;
        }
        if(acc.role!==role){
          showGlobal('Vai trò không khớp với tài khoản. Vui lòng chọn đúng vai trò.');
          btn.disabled=false;btn.style.opacity='1';txt.textContent='Đăng nhập';
          return;
        }
        // Lưu session và chuyển trang
        acc.email = email.toLowerCase();
        try{sessionStorage.setItem('ss_user',JSON.stringify(acc));}catch(e){}
        window.location.href='dashboard.html';
      },900);
    });
    return; // kết thúc script cho trang login
  }

  // ============== TRANG DASHBOARD ==============
  var sidebar = document.getElementById('sidebar');
  if(sidebar){
    // Kiểm tra đăng nhập
    try{
      var stored = sessionStorage.getItem('ss_user');
      if(!stored){window.location.href='index.html';return;}
      currentUser = JSON.parse(stored);
    }catch(e){window.location.href='index.html';return;}

    document.getElementById('userName').textContent=currentUser.name;
    document.getElementById('userRole').textContent=currentUser.roleLabel;
    document.getElementById('avatar').textContent=currentUser.name.charAt(0);

    window.logout=function(){
      try{sessionStorage.removeItem('ss_user');}catch(e){}
      window.location.href='index.html';
    };

    function renderNav(){
      var menu=document.getElementById('navMenu');
      var items=NAV[currentUser.role];
      menu.innerHTML=items.map(function(it){
        return '<div class="nav-item'+(it.id===currentTab?' active':'')+'" data-tab="'+it.id+'">'+icon(it.icon)+'<span>'+it.label+'</span></div>';
      }).join('');
      menu.querySelectorAll('.nav-item').forEach(function(el){
        el.addEventListener('click',function(){switchTab(el.getAttribute('data-tab'));});
      });
    }

    window.switchTab=function(tab){
      currentTab=tab;
      document.querySelectorAll('.nav-item').forEach(function(el){
        el.classList.toggle('active',el.getAttribute('data-tab')===tab);
      });
      var t=TITLES[tab]||['',''];
      document.getElementById('pageTitle').textContent=t[0];
      document.getElementById('pageSub').textContent=t[1];
      renderContent(tab);
    };

    // ===== Luồng phê duyệt: nhân viên tạo yêu cầu → giám sát/admin duyệt =====
    function addRequest(type,detail){
      var n=DB.requests.length+1, id='REQ-'+String(n).padStart(3,'0');
      while(DB.requests.some(function(r){return r.id===id;})){n++;id='REQ-'+String(n).padStart(3,'0');}
      var now=new Date();
      var time=now.getFullYear()+'-'+String(now.getMonth()+1).padStart(2,'0')+'-'+String(now.getDate()).padStart(2,'0')+' '+String(now.getHours()).padStart(2,'0')+':'+String(now.getMinutes()).padStart(2,'0');
      DB.requests.unshift({id:id,type:type,by:currentUser.name,detail:detail,status:'Chờ duyệt',time:time});
    }
    window.submitStockCheck=function(){
      var vals=[];
      for(var i=0;i<3;i++){var el=document.getElementById('cnt'+i);vals.push(el?el.value||'0':'0');}
      addRequest('Kiểm kê','Khu A-02 · Kết quả đếm thực tế (SKU-001='+vals[0]+', SKU-002='+vals[1]+', SKU-003='+vals[2]+')');
      alert('Đã gửi kết quả kiểm kê. Yêu cầu đang chờ giám sát kho duyệt.');
    };
    window.submitMove=function(){
      var inputs=document.querySelectorAll('#moveForm input');
      var sku=inputs[0]?inputs[0].value:'', from=inputs[1]?inputs[1].value:'', to=inputs[2]?inputs[2].value:'', qty=inputs[3]?inputs[3].value:'0';
      addRequest('Chuyển vị trí',sku+' · '+qty+' chiếc · '+from+' → '+to);
      alert('Lệnh chuyển vị trí đã tạo. Đang chờ giám sát kho duyệt.');
    };
    window.approveReq=function(id){
      var r=DB.requests.find(function(x){return x.id===id;});
      if(r){r.status='Đã duyệt';renderContent(currentTab);}
    };
    window.rejectReq=function(id){
      var r=DB.requests.find(function(x){return x.id===id;});
      if(r){r.status='Từ chối';renderContent(currentTab);}
    };

    function kpiCard(label,val,delta,color,path){
      return '<div style="flex:1 1 180px;background:#fff;border:1px solid var(--border);border-radius:14px;padding:18px;box-shadow:0 1px 3px rgba(0,0,0,.04);">'+
        '<div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">'+
          '<div style="width:32px;height:32px;border-radius:8px;background:var(--accent-soft);color:var(--accent);display:flex;align-items:center;justify-content:center;">'+icon(path,16)+'</div>'+
          '<span style="font-size:12px;color:var(--muted);font-weight:500;">'+label+'</span></div>'+
        '<div style="font-size:26px;font-weight:700;color:var(--text);">'+val+'</div>'+
        '<div style="font-size:12px;margin-top:4px;color:'+color+';">'+delta+'</div></div>';
    }

    function tableWrap(headers,rows,searchId,withActions){
      if(withActions===undefined)withActions=true;
      var addBtn=withActions?'<button onclick="openAddModal()" style="padding:9px 16px;background:var(--accent);color:#fff;border:none;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:6px;font-family:Sora,sans-serif;">'+
        '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Thêm mới</button>':'';
      var h='<div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;margin-bottom:16px;">'+
        '<div style="position:relative;flex:1;min-width:200px;max-width:320px;">'+
        '<svg style="position:absolute;left:10px;top:50%;transform:translateY(-50%);color:var(--muted)" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>'+
        '<input id="'+searchId+'" placeholder="Tìm kiếm..." style="width:100%;padding:9px 12px 9px 34px;border:1.5px solid var(--border);border-radius:8px;font-size:13px;outline:none;font-family:Sora,sans-serif;" onfocus="this.style.borderColor=\'var(--accent)\'" onblur="this.style.borderColor=\'var(--border)\'">'+
        '</div>'+addBtn+'</div>';
      var actionsHeader=withActions?'<th style="padding:10px 12px;font-weight:600;font-size:11px;text-transform:uppercase;">Thao tác</th>':'';
      return h+'<div style="overflow-x:auto;"><table style="width:100%;border-collapse:collapse;font-size:13px;color:var(--text);"><thead><tr style="color:var(--muted);text-align:left;border-bottom:1.5px solid var(--border);">'+
        headers.map(function(h){return '<th style="padding:10px 12px;font-weight:600;font-size:11px;text-transform:uppercase;letter-spacing:.05em;">'+h+'</th>';}).join('')+
        actionsHeader+'</tr></thead><tbody id="tblBody">'+rows+'</tbody></table></div>';
    }

    function actionBtns(id){
      return '<td style="padding:10px 12px;"><div style="display:flex;gap:6px;">'+
        '<button onclick="editItem(\''+id+'\')" style="padding:5px 10px;background:var(--accent-soft);color:var(--accent);border:none;border-radius:6px;font-size:12px;font-weight:600;cursor:pointer;font-family:Sora,sans-serif;">Sửa</button>'+
        '<button onclick="delItem(\''+id+'\')" style="padding:5px 10px;background:var(--danger-soft);color:var(--danger);border:none;border-radius:6px;font-size:12px;font-weight:600;cursor:pointer;font-family:Sora,sans-serif;">Xóa</button></div></td>';
    }

    // Cấu hình form thêm/sửa theo từng tab (chỉ Quản trị viên truy cập các tab này)
    var FORM_FIELDS={
      products:[
        {key:'id',label:'Mã SKU',type:'text'},
        {key:'name',label:'Tên sản phẩm',type:'text'},
        {key:'cat',label:'Danh mục',type:'text'},
        {key:'qty',label:'Số lượng',type:'number'},
        {key:'min',label:'Ngưỡng tối thiểu',type:'number'},
        {key:'loc',label:'Vị trí',type:'text'},
        {key:'price',label:'Giá (VNĐ)',type:'number'}
      ],
      users:[
        {key:'id',label:'Mã người dùng',type:'text'},
        {key:'name',label:'Họ tên',type:'text'},
        {key:'email',label:'Email (dùng để đăng nhập)',type:'email'},
        {key:'password',label:'Mật khẩu (để trống = mặc định 123456 / giữ nguyên)',type:'text'},
        {key:'role',label:'Vai trò',type:'select',options:['Nhân viên kho','Giám sát kho','Điều phối nhập hàng','Quản trị viên']},
        {key:'status',label:'Trạng thái',type:'select',options:['Hoạt động','Vô hiệu hóa']}
      ],
      locations:[
        {key:'id',label:'Mã vị trí (VD: A-01-01)',type:'text'},
        {key:'zone',label:'Khu (A/B/C)',type:'text'},
        {key:'row',label:'Dãy (số)',type:'number'},
        {key:'level',label:'Tầng (số)',type:'number'},
        {key:'capacity',label:'Sức chứa',type:'number'},
        {key:'used',label:'Đã dùng',type:'number'},
        {key:'type',label:'Loại vị trí',type:'select',options:['Nhiệt độ thường','Hàng giá trị cao','Lạnh','Khô']}
      ]
    };

    var editContext=null;
    window.openAddModal=function(){editContext={mode:'add',data:{}};showModal();};
    window.editItem=function(id){
      var list=DB[currentTab]||DB.products;
      var item=list.find(function(x){return x.id===id;})||{};
      editContext={mode:'edit',id:id,data:item};
      showModal();
    };
    window.delItem=function(id){
      if(confirm('Xác nhận xóa mục '+id+'?')){
        var list=DB[currentTab]||DB.products;
        if(currentTab==='users'){
          var u=list.find(function(x){return x.id===id;});
          if(u&&u.email)removeExtraAccount(u.email);
        }
        var idx=list.findIndex(function(x){return x.id===id;});
        if(idx>-1)list.splice(idx,1);
        renderContent(currentTab);
      }
    };

    function showModal(){
      var root=document.getElementById('modalRoot');
      var fields=FORM_FIELDS[currentTab];
      var body='';
      if(!fields){
        body='<p style="color:var(--muted);font-size:13px;">Mục này không hỗ trợ thêm/sửa trực tiếp.</p>';
      } else {
        body=fields.map(function(f){
          var val=editContext.data[f.key]!=null?editContext.data[f.key]:'';
          var label='<label style="font-size:12px;font-weight:600;color:var(--muted);display:block;margin-bottom:5px;">'+f.label+'</label>';
          var ctrl='';
          if(f.type==='select'){
            ctrl='<select id="f_'+f.key+'" class="inp" style="padding-left:14px;appearance:none;-webkit-appearance:none;">'+f.options.map(function(o){return '<option value="'+o+'"'+(o===val?' selected':'')+'>'+o+'</option>';}).join('')+'</select>';
          } else {
            ctrl='<input id="f_'+f.key+'" type="'+f.type+'" class="inp" style="padding-left:14px;" value="'+String(val).replace(/"/g,'&quot;')+'">';
          }
          return '<div>'+label+ctrl+'</div>';
        }).join('');
      }
      var saveBtn=fields?'<button onclick="saveItem()" style="padding:10px 18px;background:var(--accent);color:#fff;border:none;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;font-family:Sora,sans-serif;">Lưu</button>':'';
      root.innerHTML='<div class="modal-bg" onclick="if(event.target===this)closeModal()"><div style="background:#fff;border-radius:16px;padding:24px;width:100%;max-width:460px;box-shadow:0 20px 60px rgba(0,0,0,.2);max-height:85vh;overflow-y:auto;">'+
        '<h3 style="font-size:18px;font-weight:700;margin:0 0 18px;color:var(--text);">'+(editContext.mode==='add'?'Thêm mới':'Sửa')+' mục</h3>'+
        '<div style="display:flex;flex-direction:column;gap:12px;">'+body+'</div>'+
        '<div style="display:flex;gap:10px;justify-content:flex-end;margin-top:22px;">'+
        '<button onclick="closeModal()" style="padding:10px 18px;background:#fff;border:1px solid var(--border);border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;color:var(--text);font-family:Sora,sans-serif;">Hủy</button>'+
        saveBtn+'</div></div></div>';
    }
    window.closeModal=function(){document.getElementById('modalRoot').innerHTML='';};
    window.saveItem=function(){
      var fields=FORM_FIELDS[currentTab];
      if(!fields){closeModal();return;}
      var obj={};
      fields.forEach(function(f){
        var el=document.getElementById('f_'+f.key);
        if(!el)return;
        var v=el.value;
        obj[f.key]= f.type==='number' ? (+v||0) : (v||'');
      });
      var list=DB[currentTab]||DB.products;
      // Nếu là người dùng → đồng bộ tạo/cập nhật tài khoản đăng nhập
      if(currentTab==='users'){
        var email=(obj.email||'').toLowerCase().trim();
        if(email){
          var rm=ROLE_MAP[obj.role]||{role:'worker',roleLabel:obj.role||'Nhân viên kho'};
          var pw=obj.password;
          if(editContext.mode==='edit'){
            var oldItem=list.find(function(x){return x.id===editContext.id;});
            if(oldItem&&oldItem.email){
              var oldEmail=oldItem.email.toLowerCase().trim();
              if(oldEmail!==email) removeExtraAccount(oldEmail);
              if(!pw){var oldAcc=getAllAccounts()[oldEmail]; if(oldAcc)pw=oldAcc.pw;}
            }
          }
          if(!pw)pw='123456';
          saveExtraAccount(email,{pw:pw,role:rm.role,name:obj.name||'Người dùng',roleLabel:rm.roleLabel});
        }
        delete obj.password; // không hiển thị mật khẩu trong bảng
      }
      if(editContext.mode==='edit'){
        var idx=list.findIndex(function(x){return x.id===editContext.id;});
        if(idx>-1)list[idx]=obj;
      } else {
        if(!obj.id){
          var prefix=currentTab==='users'?'U-':currentTab==='locations'?'LOC-':'SKU-';
          obj.id=prefix+Math.floor(Math.random()*900+100);
        }
        list.push(obj);
      }
      closeModal();renderContent(currentTab);
    };

    function bindSearch(){
      var si=document.getElementById('searchInp');
      if(!si)return;
      si.addEventListener('input',function(){
        var q=si.value.toLowerCase();
        document.querySelectorAll('#tblBody tr').forEach(function(tr){
          tr.style.display=tr.textContent.toLowerCase().indexOf(q)>-1?'':'none';
        });
      });
    }

    function renderContent(tab){
      var ca=document.getElementById('contentArea');
      var html='';
      if(tab==='dashboard'){
        var lowStock=DB.products.filter(function(p){return p.qty<p.min;}).length;
        var totalVal=DB.products.reduce(function(s,p){return s+p.qty*p.price;},0);
        html='<div class="reveal" style="display:flex;flex-wrap:wrap;gap:14px;margin-bottom:24px;">'+
          kpiCard('Tổng SKU',DB.products.length,'+2 trong tháng','#059669','M20.59 13.41 13.42 20.58a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82ZM7 7h.01')+
          kpiCard('Cảnh báo thiếu hàng',lowStock,'cần bổ sung gấp','#dc2626','M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z M12 9v4 M12 17h.01')+
          kpiCard('Nhiệm vụ đang làm',DB.tasks.filter(function(t){return t.status==='Đang làm';}).length,'trong hôm nay','#2563eb','M9 11l3 3L22 4 M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11')+
          kpiCard('Giá trị tồn kho',fmt(Math.round(totalVal/1000000))+' triệu VNĐ','+12.4% so tuần trước','#059669','M12 1v22 M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6')+
          '</div>';
        html+='<div class="reveal" style="background:#fff;border:1px solid var(--border);border-radius:14px;padding:22px;margin-bottom:20px;"><h3 style="font-size:15px;font-weight:700;margin:0 0 18px;color:var(--text);">Tồn kho theo sản phẩm</h3>'+
          DB.products.map(function(p){
            var pct=Math.min(100,Math.round(p.qty/(p.min*4)*100));
            var color=p.qty<p.min?'#dc2626':pct<50?'#d97706':'#2563eb';
            return '<div style="margin-bottom:14px;"><div style="display:flex;justify-content:space-between;font-size:12.5px;margin-bottom:5px;color:var(--text);"><span style="font-weight:600;">'+p.name+'</span><span style="color:var(--muted);">'+p.qty+' / ngưỡng '+p.min+'</span></div>'+
            '<div style="height:8px;background:#f1f5f9;border-radius:4px;overflow:hidden;"><div style="height:100%;width:'+pct+'%;background:'+color+';border-radius:4px;transition:width .6s;"></div></div></div>';
          }).join('')+'</div>';
        html+='<div class="reveal" style="background:#fff;border:1px solid var(--border);border-radius:14px;padding:22px;"><h3 style="font-size:15px;font-weight:700;margin:0 0 14px;color:var(--text);">Nhiệm vụ gần đây</h3>'+
          DB.tasks.map(function(t){return '<div style="display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border);font-size:13px;color:var(--text);"><div><strong>'+t.id+'</strong> · '+t.type+' · '+t.loc+' <span style="color:var(--muted);font-size:12px;">('+t.assignee+')</span></div>'+badge(t.status,t.status)+'</div>';}).join('')+'</div>';
      }
      else if(tab==='products'){
        var rows=DB.products.map(function(p){return '<tr class="tbl-row" style="border-bottom:1px solid var(--border);"><td style="padding:10px 12px;font-weight:600;">'+p.id+'</td><td style="padding:10px 12px;">'+p.name+'</td><td style="padding:10px 12px;">'+p.cat+'</td><td style="padding:10px 12px;font-weight:600;color:'+(p.qty<p.min?'var(--danger)':'var(--text)')+';">'+p.qty+'</td><td style="padding:10px 12px;">'+p.min+'</td><td style="padding:10px 12px;">'+p.loc+'</td><td style="padding:10px 12px;">'+fmt(p.price)+'</td>'+actionBtns(p.id)+'</tr>';}).join('');
        html='<div class="reveal" style="background:#fff;border:1px solid var(--border);border-radius:14px;padding:22px;">'+tableWrap(['Mã SKU','Tên sản phẩm','Danh mục','Tồn','Ngưỡng','Vị trí','Giá'],rows,'searchInp')+'</div>';
      }
      else if(tab==='locations'){
        var rows=DB.locations.map(function(l){var pct=Math.round(l.used/l.capacity*100);return '<tr class="tbl-row" style="border-bottom:1px solid var(--border);"><td style="padding:10px 12px;font-weight:600;">'+l.id+'</td><td style="padding:10px 12px;">Khu '+l.zone+'</td><td style="padding:10px 12px;">Dãy '+l.row+' · Tầng '+l.level+'</td><td style="padding:10px 12px;">'+l.used+'/'+l.capacity+'</td><td style="padding:10px 12px;"><div style="width:100px;height:6px;background:#f1f5f9;border-radius:3px;overflow:hidden;"><div style="width:'+pct+'%;height:100%;background:'+(pct>80?'#dc2626':'#2563eb')+';"></div></div></td><td style="padding:10px 12px;">'+l.type+'</td>'+actionBtns(l.id)+'</tr>';}).join('');
        html='<div class="reveal" style="background:#fff;border:1px solid var(--border);border-radius:14px;padding:22px;">'+tableWrap(['Mã vị trí','Khu','Vị trí','Đã dùng/Sức chứa','Mức độ','Loại'],rows,'searchInp')+'</div>';
      }
      else if(tab==='users'){
        var rows=DB.users.map(function(u){return '<tr class="tbl-row" style="border-bottom:1px solid var(--border);"><td style="padding:10px 12px;font-weight:600;">'+u.id+'</td><td style="padding:10px 12px;">'+u.name+'</td><td style="padding:10px 12px;">'+u.email+'</td><td style="padding:10px 12px;">'+u.role+'</td><td style="padding:10px 12px;">'+badge(u.status,u.status)+'</td>'+actionBtns(u.id)+'</tr>';}).join('');
        html='<div class="reveal" style="background:#fff;border:1px solid var(--border);border-radius:14px;padding:22px;">'+tableWrap(['Mã','Họ tên','Email','Vai trò','Trạng thái'],rows,'searchInp')+'</div>';
      }
      else if(tab==='alerts'){
        html='<div class="reveal" style="display:flex;flex-direction:column;gap:14px;">'+DB.alerts.map(function(a){
          var c=a.level==='Nguy cấp'?'#dc2626':a.level==='Cao'?'#d97706':'#2563eb';
          return '<div style="background:#fff;border:1px solid var(--border);border-left:4px solid '+c+';border-radius:12px;padding:18px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;">'+
            '<div><div style="font-weight:700;font-size:14px;color:var(--text);">'+a.name+' <span style="color:var(--muted);font-weight:400;font-size:12px;">('+a.sku+')</span></div>'+
            '<div style="font-size:12.5px;color:var(--muted);margin-top:4px;">'+a.type+' · Hiện tại: <strong style="color:'+c+';">'+a.current+'</strong> · Ngưỡng: '+a.min+'</div></div>'+
            '<div style="display:flex;align-items:center;gap:10px;">'+badge('Mức '+a.level,a.level)+
            '<button onclick="this.textContent=\'Đã xử lý\';this.style.background=\'#059669\';this.style.color=\'#fff\';this.disabled=true;" style="padding:8px 14px;background:var(--accent);color:#fff;border:none;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;font-family:Sora,sans-serif;">Xử lý</button></div></div>';
        }).join('')+'</div>';
      }
      else if(tab==='variance'){
        var data=[{sku:'SKU-002',name:'Sạc nhanh 20W',sys:25,actual:18,diff:-7},{sku:'SKU-005',name:'Cáp USB-C 1m',sys:15,actual:8,diff:-7},{sku:'SKU-001',name:'Tai nghe X1',sys:240,actual:242,diff:2}];
        html='<div class="reveal" style="background:#fff;border:1px solid var(--border);border-radius:14px;padding:22px;"><h3 style="font-size:15px;font-weight:700;margin:0 0 16px;color:var(--text);">Bảng so sánh chênh lệch</h3>'+
          '<div style="overflow-x:auto;"><table style="width:100%;border-collapse:collapse;font-size:13px;color:var(--text);"><thead><tr style="color:var(--muted);text-align:left;border-bottom:1.5px solid var(--border);"><th style="padding:10px;font-size:11px;text-transform:uppercase;">Sản phẩm</th><th style="padding:10px;font-size:11px;text-transform:uppercase;">Hệ thống</th><th style="padding:10px;font-size:11px;text-transform:uppercase;">Thực tế</th><th style="padding:10px;font-size:11px;text-transform:uppercase;">Chênh lệch</th><th style="padding:10px;font-size:11px;text-transform:uppercase;">Hành động</th></tr></thead><tbody>'+
          data.map(function(d){var c=d.diff<0?'#dc2626':'#059669';return '<tr class="tbl-row" style="border-bottom:1px solid var(--border);"><td style="padding:12px 10px;font-weight:600;">'+d.name+'</td><td style="padding:12px 10px;">'+d.sys+'</td><td style="padding:12px 10px;">'+d.actual+'</td><td style="padding:12px 10px;font-weight:700;color:'+c+';">'+(d.diff>0?'+':'')+d.diff+'</td><td style="padding:12px 10px;"><button onclick="this.textContent=\'Đã duyệt\';this.style.background=\'#059669\';this.style.color=\'#fff\';" style="padding:6px 12px;background:var(--accent-soft);color:var(--accent);border:none;border-radius:6px;font-size:12px;font-weight:600;cursor:pointer;font-family:Sora,sans-serif;">Duyệt điều chỉnh</button></td></tr>';}).join('')+
          '</tbody></table></div></div>';
      }
      else if(tab==='tasks'){
        html='<div class="reveal" style="background:#fff;border:1px solid var(--border);border-radius:14px;padding:22px;">'+
          '<div style="display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap;">'+['Tất cả','Đang làm','Chờ duyệt','Hoàn thành'].map(function(f,i){return '<button class="filter-btn'+(i===0?' active':'')+'" data-f="'+f+'" style="padding:7px 14px;border-radius:20px;font-size:12.5px;font-weight:600;cursor:pointer;border:1px solid var(--border);background:#fff;color:var(--muted);font-family:Sora,sans-serif;">'+f+'</button>';}).join('')+'</div>'+
          '<div id="taskList">'+DB.tasks.map(function(t){return '<div class="task-card" data-status="'+t.status+'" style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;padding:14px;border:1px solid var(--border);border-radius:10px;margin-bottom:10px;color:var(--text);"><div><div style="font-weight:700;font-size:14px;">'+t.id+' · '+t.type+'</div><div style="font-size:12.5px;color:var(--muted);margin-top:3px;">Vị trí: '+t.loc+' · Người thực hiện: '+t.assignee+' · Hạn: '+t.due+'</div></div><div style="display:flex;align-items:center;gap:10px;">'+badge(t.priority,t.priority)+badge(t.status,t.status)+'<button onclick="var b=this.closest(\'.task-card\').querySelectorAll(\'.badge\');b[b.length-1].textContent=\'Hoàn thành\';this.remove();" style="padding:7px 12px;background:var(--accent);color:#fff;border:none;border-radius:7px;font-size:12px;font-weight:600;cursor:pointer;font-family:Sora,sans-serif;">Hoàn thành</button></div></div>';}).join('')+'</div></div>';
      }
      else if(tab==='stockcheck'){
        html='<div class="reveal" id="stockForm" style="background:#fff;border:1px solid var(--border);border-radius:14px;padding:24px;max-width:560px;"><h3 style="font-size:16px;font-weight:700;margin:0 0 18px;color:var(--text);">Phiếu kiểm kê - Khu A-02</h3>'+
          DB.products.slice(0,3).map(function(p,i){return '<div style="margin-bottom:16px;"><label style="font-size:13px;font-weight:600;display:block;margin-bottom:6px;color:var(--text);">'+p.name+' ('+p.id+') · Hệ thống: '+p.qty+'</label><input type="number" id="cnt'+i+'" placeholder="Số lượng thực tế" class="inp" style="padding-left:14px;"></div>';}).join('')+
          '<button onclick="submitStockCheck()" style="width:100%;padding:12px;background:var(--accent);color:#fff;border:none;border-radius:10px;font-weight:600;cursor:pointer;font-family:Sora,sans-serif;">Gửi kết quả kiểm kê</button></div>';
      }
      else if(tab==='move'){
        html='<div class="reveal" id="moveForm" style="background:#fff;border:1px solid var(--border);border-radius:14px;padding:24px;max-width:560px;"><h3 style="font-size:16px;font-weight:700;margin:0 0 18px;color:var(--text);">Tạo lệnh chuyển vị trí</h3>'+
          [['Sản phẩm (SKU)','SKU-003'],['Từ vị trí','B-01-02'],['Đến vị trí','B-03-01'],['Số lượng','50']].map(function(f){return '<div style="margin-bottom:14px;"><label style="font-size:13px;font-weight:600;display:block;margin-bottom:6px;color:var(--text);">'+f[0]+'</label><input class="inp" style="padding-left:14px;" value="'+f[1]+'"></div>';}).join('')+
          '<button onclick="submitMove()" style="width:100%;padding:12px;background:var(--accent);color:#fff;border:none;border-radius:10px;font-weight:600;cursor:pointer;font-family:Sora,sans-serif;">Tạo lệnh di chuyển</button></div>';
      }
      else if(tab==='replenish'){
        var need=DB.products.filter(function(p){return p.qty<p.min;});
        html='<div class="reveal" style="background:#fff;border:1px solid var(--border);border-radius:14px;padding:22px;"><h3 style="font-size:15px;font-weight:700;margin:0 0 16px;color:var(--text);">Đề xuất bổ sung ('+need.length+' SKU)</h3>'+
          '<div style="overflow-x:auto;"><table style="width:100%;border-collapse:collapse;font-size:13px;color:var(--text);"><thead><tr style="color:var(--muted);text-align:left;border-bottom:1.5px solid var(--border);"><th style="padding:10px;font-size:11px;text-transform:uppercase;">Sản phẩm</th><th style="padding:10px;font-size:11px;text-transform:uppercase;">Hiện tại</th><th style="padding:10px;font-size:11px;text-transform:uppercase;">Ngưỡng</th><th style="padding:10px;font-size:11px;text-transform:uppercase;">Đề xuất nhập</th><th style="padding:10px;font-size:11px;text-transform:uppercase;"></th></tr></thead><tbody>'+
          need.map(function(p){var sug=p.min*3-p.qty;return '<tr class="tbl-row" style="border-bottom:1px solid var(--border);"><td style="padding:12px 10px;font-weight:600;">'+p.name+'</td><td style="padding:12px 10px;color:var(--danger);font-weight:600;">'+p.qty+'</td><td style="padding:12px 10px;">'+p.min+'</td><td style="padding:12px 10px;font-weight:700;">'+sug+'</td><td style="padding:12px 10px;"><button onclick="this.textContent=\'Đã tạo PO\';this.style.background=\'#059669\';this.style.color=\'#fff\';" style="padding:6px 12px;background:var(--accent);color:#fff;border:none;border-radius:6px;font-size:12px;font-weight:600;cursor:pointer;font-family:Sora,sans-serif;">Tạo PO</button></td></tr>';}).join('')+
          '</tbody></table></div></div>';
      }
      else if(tab==='movements'){
        var rows=DB.movements.map(function(m){return '<tr class="tbl-row" style="border-bottom:1px solid var(--border);"><td style="padding:10px 12px;font-weight:600;">'+m.id+'</td><td style="padding:10px 12px;">'+m.sku+'</td><td style="padding:10px 12px;">'+m.from+' → '+m.to+'</td><td style="padding:10px 12px;">'+m.qty+'</td><td style="padding:10px 12px;">'+m.user+'</td><td style="padding:10px 12px;font-size:12px;color:var(--muted);">'+m.time+'</td><td style="padding:10px 12px;">'+badge(m.status,m.status)+'</td></tr>';}).join('');
        html='<div class="reveal" style="background:#fff;border:1px solid var(--border);border-radius:14px;padding:22px;">'+tableWrap(['Mã','SKU','Di chuyển','SL','Người thực hiện','Thời gian','Trạng thái'],rows,'searchInp',false)+'</div>';
      }
      else if(tab==='forecast'){
        html='<div class="reveal" style="background:#fff;border:1px solid var(--border);border-radius:14px;padding:22px;"><h3 style="font-size:15px;font-weight:700;margin:0 0 16px;color:var(--text);">Dự báo 30 ngày tới</h3>'+
          DB.products.map(function(p){var risk=p.qty<p.min?'Cao':p.qty<p.min*2?'Trung bình':'Thấp';var c=risk==='Cao'?'#dc2626':risk==='Trung bình'?'#d97706':'#059669';return '<div style="display:flex;align-items:center;justify-content:space-between;padding:12px 0;border-bottom:1px solid var(--border);font-size:13px;color:var(--text);"><div><strong>'+p.name+'</strong> <span style="color:var(--muted);font-size:12px;">· tiêu thụ dự kiến '+Math.round(p.qty*0.3)+'/tuần</span></div>'+badge('Nguy cơ '+risk,risk==='Cao'?'Nguy cấp':risk)+'</div>';}).join('')+'</div>';
      }
      else if(tab==='ai'){
        html='<div class="reveal" style="display:flex;flex-direction:column;gap:16px;">'+
          [
            {id:'ai1',title:'AI-1 · Stockout Risk',desc:'Chấm điểm nguy cơ thiếu hàng theo tiêu thụ và tồn hiện tại',btn:'Phân tích nguy cơ thiếu hàng'},
            {id:'ai2',title:'AI-2 · Location Anomaly',desc:'Phát hiện sản phẩm nằm ở vị trí bất thường so với lịch sử',btn:'Quét vị trí bất thường'},
            {id:'ai3',title:'AI-3 · Variance Assistant',desc:'Gợi ý nguyên nhân và cách xử lý chênh lệch kiểm kê',btn:'Phân tích chênh lệch'}
          ].map(function(a){return '<div style="background:#fff;border:1px solid var(--border);border-radius:14px;padding:20px;"><div style="display:flex;align-items:flex-start;gap:14px;flex-wrap:wrap;"><div style="width:40px;height:40px;border-radius:10px;background:linear-gradient(135deg,var(--accent),var(--accent2));display:flex;align-items:center;justify-content:center;flex-shrink:0;"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4M8 16h.01M16 16h.01"/></svg></div><div style="flex:1;min-width:200px;"><div style="font-weight:700;font-size:15px;color:var(--text);">'+a.title+'</div><div style="font-size:12.5px;color:var(--muted);margin:4px 0 12px;">'+a.desc+'</div><button onclick="runAI(\''+a.id+'\',this)" style="padding:9px 16px;background:var(--accent);color:#fff;border:none;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;font-family:Sora,sans-serif;">'+a.btn+'</button><div id="out_'+a.id+'" style="margin-top:14px;"></div></div></div></div>';}).join('')+'</div>';
      }
      else if(tab==='requests'){
        var filters=['Tất cả','Chờ duyệt','Đã duyệt','Từ chối'];
        var reqHtml=DB.requests.map(function(r){
          var c=r.status==='Chờ duyệt'?'#d97706':r.status==='Đã duyệt'?'#059669':'#dc2626';
          var actions=r.status==='Chờ duyệt'?'<div style="display:flex;gap:8px;margin-top:10px;"><button onclick="approveReq(\''+r.id+'\')" style="padding:7px 14px;background:#059669;color:#fff;border:none;border-radius:7px;font-size:12px;font-weight:600;cursor:pointer;font-family:Sora,sans-serif;">Duyệt</button><button onclick="rejectReq(\''+r.id+'\')" style="padding:7px 14px;background:var(--danger-soft);color:var(--danger);border:none;border-radius:7px;font-size:12px;font-weight:600;cursor:pointer;font-family:Sora,sans-serif;">Từ chối</button></div>':'';
          return '<div class="req-card" data-status="'+r.status+'" style="padding:16px;border:1px solid var(--border);border-left:4px solid '+c+';border-radius:10px;margin-bottom:12px;"><div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;"><div style="font-weight:700;font-size:14px;color:var(--text);">'+r.id+' · '+r.type+'</div>'+badge(r.status,r.status==='Chờ duyệt'?'Trung bình':r.status==='Đã duyệt'?'Thấp':'Cao')+'</div><div style="font-size:13px;color:var(--text);margin-top:6px;">'+r.detail+'</div><div style="font-size:12px;color:var(--muted);margin-top:4px;">Người gửi: '+r.by+' · '+r.time+'</div>'+actions+'</div>';
        }).join('');
        html='<div class="reveal" style="background:#fff;border:1px solid var(--border);border-radius:14px;padding:22px;">'+
          '<div style="display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap;">'+filters.map(function(f,i){return '<button class="filter-btn'+(i===0?' active':'')+'" data-f="'+f+'" style="padding:7px 14px;border-radius:20px;font-size:12.5px;font-weight:600;cursor:pointer;border:1px solid var(--border);background:#fff;color:var(--muted);font-family:Sora,sans-serif;">'+f+'</button>';}).join('')+'</div>'+
          '<div id="reqList">'+(reqHtml||'<p style="color:var(--muted);text-align:center;padding:20px;">Chưa có yêu cầu nào.</p>')+'</div></div>';
      }
      else {
        html='<div class="reveal" style="background:#fff;border:1px solid var(--border);border-radius:14px;padding:40px;text-align:center;color:var(--muted);">Chức năng này đang được phát triển.</div>';
      }
      ca.innerHTML=html;
      bindSearch();
      var fb=document.querySelectorAll('.filter-btn');
      fb.forEach(function(b){b.addEventListener('click',function(){
        fb.forEach(function(x){x.classList.remove('active');x.style.background='#fff';x.style.color='var(--muted)';});
        b.classList.add('active');b.style.background='var(--accent)';b.style.color='#fff';
        var f=b.getAttribute('data-f');
        document.querySelectorAll('.task-card,.req-card').forEach(function(c){
          c.style.display=(f==='Tất cả'||c.getAttribute('data-status')===f)?'':'none';
        });
      });});
      if(fb.length){fb[0].style.background='var(--accent)';fb[0].style.color='#fff';}
    }

    window.runAI=function(id,btn){
      var out=document.getElementById('out_'+id);
      btn.disabled=true;btn.innerHTML='<span class="spin"></span> AI đang xử lý...';
      out.innerHTML='<div style="padding:14px;background:#f8fafc;border-radius:10px;font-size:13px;color:var(--muted);"><span class="ai-typing">Đang phân tích dữ liệu tồn kho</span></div>';
      setTimeout(function(){
        var results={
          ai1: ai1Result(),
          ai2:'<div style="padding:14px;background:#fffbeb;border:1px solid #fde68a;border-radius:10px;font-size:13px;"><div style="font-weight:700;color:#92400e;margin-bottom:6px;">Phát hiện 1 vị trí bất thường</div><div style="color:#92400e;line-height:1.7;">· Laptop Dell Vostro (SKU-004) đang nằm tại C-03-01 — khu "Hàng giá trị cao" nhưng lịch sử 3 tháng gần nhất luôn lưu tại A-01. Có thể do nhập nhầm vị trí.<br><strong style="color:#b45309;">Độ tin cậy: 78% (AI chưa hoàn toàn chắc chắn).</strong></div><div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap;"><button onclick="this.textContent=\'Đã chuyển\';" style="padding:6px 12px;background:#059669;color:#fff;border:none;border-radius:6px;font-size:12px;font-weight:600;cursor:pointer;font-family:Sora,sans-serif;">Chấp nhận & tạo lệnh chuyển</button><button onclick="document.getElementById(\'out_ai2\').innerHTML=\'\';" style="padding:6px 12px;background:#fff;border:1px solid var(--border);border-radius:6px;font-size:12px;font-weight:600;cursor:pointer;font-family:Sora,sans-serif;">Bỏ qua</button></div></div>',
          ai3:'<div style="padding:14px;background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;font-size:13px;"><div style="font-weight:700;color:#1e40af;margin-bottom:6px;">Gợi ý xử lý chênh lệch</div><div style="color:#1e40af;line-height:1.7;">· SKU-002 lệch -7: nguyên nhân khả nghi là xuất hàng chưa quét mã. Kiểm tra lại phiếu xuất ngày 12/10.<br>· SKU-005 lệch -7: nghi ngờ thất lạc hoặc đếm sai. Đề xuất kiểm kê lại khu A-02-02.<br>· SKU-001 lệch +2: có thể nhập thừa từ nhà cung cấp. Ghi nhận điều chỉnh tồn.</div><div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap;"><button onclick="this.textContent=\'Đã áp dụng\';" style="padding:6px 12px;background:#059669;color:#fff;border:none;border-radius:6px;font-size:12px;font-weight:600;cursor:pointer;font-family:Sora,sans-serif;">Áp dụng gợi ý</button><button onclick="document.getElementById(\'out_ai3\').innerHTML=\'\';" style="padding:6px 12px;background:#fff;border:1px solid var(--border);border-radius:6px;font-size:12px;font-weight:600;cursor:pointer;font-family:Sora,sans-serif;">Xử lý thủ công</button></div></div>'
        };
        out.innerHTML=results[id];
        btn.disabled=false;
        var labels={ai1:'Phân tích nguy cơ thiếu hàng',ai2:'Quét vị trí bất thường',ai3:'Phân tích chênh lệch'};
        btn.textContent=labels[id];
      },1800);
    };

    // Khởi tạo
    currentTab = NAV[currentUser.role][0].id;
    renderNav();
    switchTab(currentTab);
  }
  // ===== Bridge: chia sẻ helper/dữ liệu cho các trang mở rộng (pages.js) =====
  window.SS = {
    DB: DB, ACCOUNTS: ACCOUNTS, NAV: NAV, TITLES: TITLES, ROLE_MAP: ROLE_MAP,
    icon: icon, badge: badge, fmt: fmt,
    getAllAccounts: getAllAccounts, saveExtraAccount: saveExtraAccount, removeExtraAccount: removeExtraAccount,
    getResolvedNotifs: getResolvedNotifs, recomputeAlerts: recomputeAlerts, ai1Result: ai1Result
  };
})();
