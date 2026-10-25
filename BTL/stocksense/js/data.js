/* data.js — CHỨC NĂNG: Dữ liệu mẫu (DB) + tài khoản + menu theo vai trò (nạp đầu tiên) */
(function(){
  'use strict';
  window.SS = window.SS || {};

  // 1. Dữ liệu mẫu: sản phẩm, vị trí, nhiệm vụ, cảnh báo, di chuyển, người dùng, yêu cầu
  var DB = {
    products: [
      {id:'SKU-001', name:'Tai nghe Bluetooth 5.0', qty:240, min:50, price:590000},
      {id:'SKU-002', name:'Sạc nhanh 20W',        qty:18,  min:40, price:250000},
      {id:'SKU-003', name:'Ốp lưng iPhone 15',    qty:520, min:100,price:120000},
      {id:'SKU-004', name:'Laptop Dell Vostro',   qty:35,  min:10, price:15900000},
      {id:'SKU-005', name:'Cáp USB-C 1m',         qty:8,   min:60, price:85000},
      {id:'SKU-006', name:'Chuột không dây Logitech',qty:130,min:30,price:350000}
    ],
    locations: [
      {id:'A-01', name:'Khu A - Kệ 1', capacity:200, filled:180},
      {id:'A-02', name:'Khu A - Kệ 2', capacity:200, filled:90},
      {id:'B-01', name:'Khu B - Kệ 1', capacity:300, filled:220}
    ],
    tasks: [
      {id:'TASK-101', type:'Kiểm kê', loc:'A-02', assignee:'Nguyễn Văn A', status:'Đang làm', priority:'Thấp', due:'2026-10-28'},
      {id:'TASK-102', type:'Nhập hàng', loc:'B-01', assignee:'Trần Thị B', status:'Chờ duyệt', priority:'Cao', due:'2026-10-26'},
      {id:'TASK-103', type:'Kiểm kê', loc:'A-01', assignee:'Lê Văn C', status:'Hoàn thành', priority:'Trung bình', due:'2026-10-20'},
      {id:'TASK-104', type:'Nhập hàng', loc:'A-01', assignee:'Phạm Văn D', status:'Đang làm', priority:'Cao', due:'2026-10-13'}
    ],
    alerts: [],
    movements: [
      {id:'MV-501', sku:'SKU-001', type:'Xuất', qty:20, user:'Nguyễn Văn A', time:'2026-10-20 09:15'},
      {id:'MV-502', sku:'SKU-003', type:'Nhập', qty:100, user:'Trần Thị B', time:'2026-10-21 14:30'},
      {id:'MV-503', sku:'SKU-006', type:'Nhập', qty:80, user:'Phạm Văn D', time:'2026-10-12 16:40'}
    ],
    users: [
      {id:'U-01', name:'Nguyễn Văn A', email:'worker@stocksense.vn', role:'Nhân viên kho', status:'Hoạt động'},
      {id:'U-02', name:'Trần Thị B', email:'supervisor@stocksense.vn', role:'Giám sát kho', status:'Hoạt động'},
      {id:'U-03', name:'Lê Văn C', email:'planner@stocksense.vn', role:'Điều phối nhập hàng', status:'Hoạt động'},
      {id:'U-04', name:'Phạm Văn D', email:'admin@stocksense.vn', role:'Quản trị viên', status:'Hoạt động'}
    ],
    requests: [
      {id:'RQ-01', type:'Nhập hàng', detail:'SKU-002 thêm 100 cái', status:'Chờ duyệt', by:'Trần Thị B'},
      {id:'RQ-02', type:'Xuất hàng', detail:'SKU-004 xuất 5 máy', status:'Đã duyệt', by:'Lê Văn C'}
    ]
  };

  // 2. Tài khoản demo cố định
  var ACCOUNTS = {
    'admin@stocksense.vn':      {pw:'admin123', role:'admin',      name:'Phạm Văn D',  roleLabel:'Quản trị viên'},
    'supervisor@stocksense.vn': {pw:'123456',   role:'supervisor', name:'Trần Thị B',  roleLabel:'Giám sát kho'},
    'worker@stocksense.vn':     {pw:'123456',   role:'worker',     name:'Nguyễn Văn A',roleLabel:'Nhân viên kho'},
    'planner@stocksense.vn':    {pw:'123456',   role:'planner',    name:'Lê Văn C',    roleLabel:'Điều phối nhập hàng'}
  };

  // 3. Menu theo vai trò (mỗi vai trò thấy menu khác nhau)
  var NAV = {
    admin: [
      {id:'dashboard', label:'Bảng điều khiển', icon:'M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z'},
      {id:'products', label:'Quản lý sản phẩm', icon:'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4'},
      {id:'locations', label:'Quản lý vị trí', icon:'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z M12 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6z'},
      {id:'users', label:'Quản lý người dùng', icon:'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75'},
      {id:'requests', label:'Yêu cầu chờ duyệt', icon:'M9 11l3 3L22 4 M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11'},
      {id:'ai', label:'AI Assistant', icon:'M12 2a7 7 0 0 1 7 7c0 2.5-1.5 4.5-3 6v3H8v-3c-1.5-1.5-3-3.5-3-6a7 7 0 0 1 7-7z M9 21h6'}
    ],
    supervisor: [
      {id:'dashboard', label:'Bảng điều khiển', icon:'M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z'},
      {id:'variance', label:'Xử lý chênh lệch', icon:'M3 6h18 M7 12h10 M10 18h4'},
      {id:'alerts', label:'Cảnh báo tồn kho', icon:'M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z M12 9v4 M12 17h.01'},
      {id:'requests', label:'Yêu cầu chờ duyệt', icon:'M9 11l3 3L22 4 M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11'},
      {id:'ai', label:'AI Assistant', icon:'M12 2a7 7 0 0 1 7 7c0 2.5-1.5 4.5-3 6v3H8v-3c-1.5-1.5-3-3.5-3-6a7 7 0 0 1 7-7z M9 21h6'}
    ],
    worker: [
      {id:'tasks', label:'Nhiệm vụ của tôi', icon:'M9 11l3 3L22 4 M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11'},
      {id:'inventory', label:'Kiểm kê tồn kho', icon:'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4'},
      {id:'move', label:'Chuyển vị trí hàng', icon:'M17 1l4 4-4 4 M3 11V9a4 4 0 0 1 4-4h14 M7 23l-4-4 4-4 M21 13v2a4 4 0 0 1-4 4H3'},
      {id:'ai', label:'AI Assistant', icon:'M12 2a7 7 0 0 1 7 7c0 2.5-1.5 4.5-3 6v3H8v-3c-1.5-1.5-3-3.5-3-6a7 7 0 0 1 7-7z M9 21h6'}
    ],
    planner: [
      {id:'dashboard', label:'Bảng điều khiển', icon:'M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z'},
      {id:'restock', label:'Kế hoạch bổ sung', icon:'M12 5v14 M5 12h14'},
      {id:'forecast', label:'Dự báo tồn kho', icon:'M3 3v18h18 M7 14l4-4 4 4 5-5'},
      {id:'movements', label:'Lịch sử di chuyển', icon:'M17 1l4 4-4 4 M3 11V9a4 4 0 0 1 4-4h14 M7 23l-4-4 4-4 M21 13v2a4 4 0 0 1-4 4H3'},
      {id:'ai', label:'AI Assistant', icon:'M12 2a7 7 0 0 1 7 7c0 2.5-1.5 4.5-3 6v3H8v-3c-1.5-1.5-3-3.5-3-6a7 7 0 0 1 7-7z M9 21h6'}
    ]
  };

  var TITLES = {dashboard:'Bảng điều khiển', products:'Quản lý sản phẩm', locations:'Quản lý vị trí', users:'Quản lý người dùng', requests:'Yêu cầu chờ duyệt', ai:'AI Assistant', tasks:'Nhiệm vụ của tôi', inventory:'Kiểm kê tồn kho', move:'Chuyển vị trí hàng', variance:'Xử lý chênh lệch', alerts:'Cảnh báo tồn kho', restock:'Kế hoạch bổ sung', forecast:'Dự báo tồn kho', movements:'Lịch sử di chuyển'};
  var ROLE_MAP = {admin:'Quản trị viên', supervisor:'Giám sát kho', worker:'Nhân viên kho', planner:'Điều phối nhập hàng'};

  window.SS.DB = DB;
  window.SS.ACCOUNTS = ACCOUNTS;
  window.SS.NAV = NAV;
  window.SS.TITLES = TITLES;
  window.SS.ROLE_MAP = ROLE_MAP;
})();
