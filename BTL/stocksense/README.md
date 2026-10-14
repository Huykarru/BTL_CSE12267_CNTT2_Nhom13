# StockSense – Điều hành tồn kho thông minh (Inventory OS)

> **Học phần:** PHÁT TRIỂN ỨNG DỤNG WEB CƠ BẢN – CSE122
> **Lĩnh vực:** Quản lý kho / Inventory & Supply Chain
> **Ngôn ngữ & Nền tảng:** HTML5, CSS3 (Enterprise SaaS 2026), Vanilla JavaScript ES6+, LocalStorage Database
> **Ngôn ngữ hiển thị:** 100% Tiếng Việt

---

## 1. Giới thiệu & Bài toán thực tế

**StockSense** là nền tảng quản lý tồn kho và hỗ trợ ra quyết định cung ứng dành cho các chuỗi siêu thị và trung tâm bán lẻ quy mô lớn (như VinMart, Co.opmart, AEON Mall, Mega Market). Hệ thống giải quyết triệt để 4 vấn đề nhức nhối:

1. **Hết hàng đột xuất do dự báo sai:** Không biết sản phẩm nào sắp cạn, khách đến mua không có → mất doanh thu.
2. **Nhập hàng thủ công thiếu căn cứ:** Đặt hàng theo cảm tính, không biết nhập bao nhiêu và khi nào là hợp lý.
3. **Không theo dõi được luồng hàng hóa:** Mất dấu vết từ kho trung chuyển → chi nhánh → lên kệ, dễ phát sinh chênh lệch.
4. **Quản lý thiếu tầm nhìn bao quát:** Không phân biệt được hàng bán chạy / hàng ế vốn, không biết khu vực nào đang cạn kiệt vào giờ cao điểm.

---

## 2. Tài khoản & Phân vai trò

Hệ thống hỗ trợ 4 vai trò với menu và quyền riêng biệt, chuyển đổi bằng cách đăng xuất và đăng nhập lại:

| Vai trò | Email | Mật khẩu | Menu chính |
|---|---|---|---|
| **Quản trị viên (Admin)** | `admin@stocksense.vn` | `admin123` | Dashboard, Sản phẩm, Vị trí, Người dùng, Yêu cầu, AI Assistant |
| **Giám sát kho (Supervisor)** | `supervisor@stocksense.vn` | `123456` | Dashboard, Xử lý chênh lệch, Cảnh báo tồn kho, Yêu cầu, AI Assistant |
| **Nhân viên kho (Worker)** | `worker@stocksense.vn` | `123456` | Nhiệm vụ, Kiểm kê tồn kho, Chuyển vị trí hàng, AI Assistant |
| **Điều phối nhập hàng (Planner)** | `planner@stocksense.vn` | `123456` | Dashboard, Kế hoạch bổ sung, Dự báo tồn kho, Lịch sử di chuyển, AI Assistant |

> Tài khoản tự đăng ký qua `register.html` cũng đăng nhập được ngay và được lưu trữ bền vững qua `localStorage`.

---

## 3. Các trang & tính năng chính

1. **`index.html`** – Trang đăng nhập
   - Kiểm tra email, mật khẩu, vai trò; hiển thị lỗi trực quan; liên kết "Quên mật khẩu?" và "Đăng ký ngay".

2. **`register.html`** – Đăng ký tài khoản
   - Form họ tên, email, mật khẩu + xác nhận, chọn vai trò; thanh đo độ mạnh mật khẩu; chặn trùng email.

3. **`forgot-password.html`** – Quên mật khẩu
   - Luồng 2 bước: nhập email → đặt mật khẩu mới → xác nhận hoàn tất, có thanh tiến trình.

4. **`dashboard.html`** – Bảng điều khiển chính
   - KPI thời gian thực: Tổng SKU, **Cảnh báo thiếu hàng** (tự động động), Nhiệm vụ đang làm, Giá trị tồn kho.
   - Menu bên trái đổi theo vai trò; thanh trên có chuông thông báo (badge số chưa đọc), cài đặt, avatar, đăng xuất.
   - Quản lý sản phẩm, vị trí, người dùng, yêu cầu chờ duyệt (duyệt/từ chối), kiểm kê, chuyển vị trí.

5. **`profile.html`** – Hồ sơ cá nhân
   - Đổi họ tên, điện thoại, bộ phận; **tên và chữ avatar cập nhật đồng bộ ngay ở góc phải màn hình**.
   - Đổi mật khẩu (kiểm tra mật khẩu cũ); thống kê nhiệm vụ / hoàn thành / di chuyển.

6. **`settings.html`** – Cài đặt hệ thống
   - Bảo mật (2FA, thời gian phiên), Thông báo (email/push/âm thanh), Giao diện & khu vực (ngôn ngữ, tiền tệ), Khu vực nguy hiểm (xóa tài khoản).

7. **`notifications.html`** – Trung tâm thông báo
   - Gộp cảnh báo tồn kho, nhiệm vụ, yêu cầu chờ duyệt, di chuyển hàng; tab lọc (Tất cả / Chưa đọc / Cảnh báo / Nhiệm vụ / Hệ thống); đánh dấu đã đọc; badge đồng bộ với icon chuông.

8. **AI Assistant** (trong `dashboard.html`) – 3 tính năng AI
   - **AI-1 · Stockout Risk:** Phân tích động nguy cơ thiếu hàng theo tồn kho thực tế. Mỗi SKU nguy cơ có nút **"Khắc phục (nhập X)"** — bấm vào mô phỏng nhập hàng, AI phân tích lại ngay. Khi hết rủi ro, khung kết quả chuyển xanh báo **"Không còn SKU nào có nguy cơ thiếu hàng"**.
   - **AI-2 · Location Anomaly:** Quét vị trí lưu trữ bất thường so với lịch sử.
   - **AI-3 · Variance Assistant:** Gợi ý nguyên nhân và xử lý chênh lệch kiểm kê.

9. **`403.html` / `404.html`** – Trang lỗi thương hiệu, có nút quay lại Dashboard.

---

## 4. Cấu trúc thư mục mã nguồn

```
stocksense/
├── index.html             # Trang đăng nhập (điểm vào hệ thống)
├── register.html          # Đăng ký tài khoản mới
├── forgot-password.html   # Quên mật khẩu (luồng 2 bước)
├── dashboard.html         # Bảng điều khiển chính: sidebar + topbar + nội dung động theo tab
├── profile.html           # Hồ sơ cá nhân (đổi tên đồng bộ, đổi mật khẩu)
├── settings.html          # Cài đặt hệ thống (bảo mật, thông báo, giao diện)
├── notifications.html     # Trung tâm thông báo (tab lọc, đánh dấu đã đọc)
├── 403.html               # Trang lỗi 403 - Không có quyền truy cập
├── 404.html               # Trang lỗi 404 - Không tìm thấy trang
├── README.md              # Tài liệu dự án
├── css/
│   └── style.css          # Biến thiết kế + các class component dùng chung
└── js/
    ├── script.js          # Logic chính: DB mock, đăng nhập, dashboard, AI Assistant, bridge SS
    └── pages.js           # Logic các trang mở rộng: register/forgot/profile/settings/notifications/403/404
```

> `script.js` phơi bridge `window.SS` để `pages.js` dùng chung dữ liệu và helper; dữ liệu tồn kho & tài khoản được lưu bền vững qua `localStorage`.

## 5. Cơ chế dữ liệu & AI động

Toàn bộ dữ liệu mô phỏng được lưu bền vững qua `localStorage`, không cần cài đặt backend:

| Khoá `localStorage` | Nội dung |
|---|---|
| `ss_user` | Phiên đăng nhập hiện tại |
| `ss_extra_accounts` | Tài khoản tự đăng ký / đã sửa |
| `ss_products` | Số lượng tồn kho thực tế (tăng sau khi "Khắc phục") |
| `ss_resolved_notifs` | Lịch sử các rủi ro đã được khắc phục |
| `ss_settings` | Cài đặt người dùng |
| `ss_read_notifs` | Trạng thái đã đọc của thông báo |

**Luồng AI-1 động:** Sản phẩm có `qty < min` → AI đánh điểm nguy cơ → bấm **Khắc phục** → tồn kho được bổ sung vượt ngưỡng → cảnh báo tự biến mất → KPI "Cảnh báo thiếu hàng" giảm về 0 → trang Thông báo thêm mục hệ thống xanh **"Đã khắc phục nguy cơ: <tên SKU>"**.

---

## 6. Công nghệ sử dụng

- **HTML5** cấu trúc trang, **CSS3** với biến thiết kế (`--accent`, `--bg`, `--border`...), bo góc, đổ bóng, responsive.
- **Vanilla JavaScript ES6+** (IIFE, module hóa `js/script.js` + `js/pages.js`), không dùng framework.
- **LocalStorage** làm cơ sở dữ liệu mô phỏng; icon SVG inline; font **Sora**.
- Hiệu ứng: reveal khi load, spinner khi xử lý, toast thông báo góc dưới.

---

## 7. Hướng dẫn chạy & Kiểm thử

1. **Chạy trực tiếp:**
   - Mở tệp `index.html` hoặc bất kỳ tệp HTML nào trực tiếp bằng trình duyệt (Google Chrome, Microsoft Edge, Firefox).
   - Không yêu cầu cài đặt máy chủ Node.js hay cơ sở dữ liệu bên ngoài; toàn bộ dữ liệu mẫu được tích hợp sẵn và tự động khởi tạo qua `localStorage`.

2. **Khôi phục dữ liệu mẫu (Reset Seed Data):**
   - Nếu muốn chỉnh sửa dữ liệu, xóa bớt dữ liệu và muốn đưa về trạng thái chuẩn ban đầu, hãy vào **Cài đặt** (`settings.html`) hoặc xóa các khoá `ss_products`, `ss_extra_accounts`, `ss_resolved_notifs`, `ss_settings`, `ss_read_notifs` trong DevTools → Application → Local Storage, rồi tải lại trang.

3. **Chuyển đổi vai trò:**
   - Đăng xuất và đăng nhập lại với 1 trong 4 tài khoản demo ở mục 2; menu và quyền tự đổi theo vai trò.

4. **Kiểm tra luồng AI động:**
   - Đăng nhập admin → **AI Assistant** → "Phân tích nguy cơ thiếu hàng" → bấm **"Khắc phục"** từng SKU → quan sát KPI "Cảnh báo thiếu hàng" giảm dần (2 → 1 → 0) và khung AI báo xanh "Không còn nguy cơ". Vào trang **Thông báo** để thấy mục "Đã khắc phục nguy cơ".

5. **Kiểm tra đồng bộ hồ sơ:**
   - Vào **Hồ sơ cá nhân** → đổi họ tên → lưu → tên và chữ avatar ở góc phải màn hình cập nhật ngay lập tức.

---

## THÀNH VIÊN VÀ PHÂN CÔNG VAI TRÒ

| Thành viên | Họ và tên | Mã sinh viên | Lớp | Phân công màn hình |
|---|---|---|---|---|
| SV1 | `Nguyễn Quang Huy` | `2551060630` | `67CNTT2` | Làm tất | 
Chi tiết mục tiêu, nhiệm vụ, CRUD/trạng thái, tính năng AI và công việc dự kiến của từng màn hình xem tại **Bảng kiểm kê màn hình StockSense**.
**Link video:** https://youtu.be/y_aBBF9NrR8?si=g8WHXPFWCAdgggz9
