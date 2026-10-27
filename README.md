# Thiệp Cưới Online Studio (Professional Online Wedding Invitation Web App)

Nền tảng tạo và quản lý thiệp cưới trực tuyến sang trọng, hiện đại, hỗ trợ song ngữ **Tiếng Việt** và **ភាសាខ្មែរ (Khmer)**.

---

## 🌟 Tính Năng Nổi Bật (Key Features)

### 1. Ngôn ngữ & Thiết kế Hoàng gia (Language & Design)
- **Giao diện đa ngôn ngữ**: Hỗ trợ toàn diện Tiếng Việt và Tiếng Khmer, chuyển đổi 1 chạm mọi lúc.
- **Tông màu quý phái**: Đỏ hoàng gia (#8A0F1A), Vàng kim (#D4AF37, #F5D77F), Trắng và Kem ngọc bích.
- **Hiệu ứng & Hoạt ảnh**:
  - Mở phong bì cưới với con dấu sáp (wax seal), cánh hoa và pháo hoa giấy chúc phúc (confetti).
  - Trình phát nhạc nền du dương (Canon in D / Nhạc lễ truyền thống Khmer / Nhạc tùy chỉnh).
  - Đồng hồ đếm ngược thời gian thực đến ngày hôn lễ (Ngày, Giờ, Phút, Giây).
  - Tối ưu hiển thị 100% trên điện thoại di động (iOS, Android), máy tính bảng và máy tính.

### 2. Bảng Điều Khiển Quản Trị Viên (Admin Dashboard)
- Đăng nhập bảo mật (Session token & hash mật khẩu an toàn).
- Thống kê tổng quan: Số lượng thiệp, số thiệp đã xuất bản, tổng lượt phản hồi RSVP, số khách tham dự.
- Tạo, chỉnh sửa, nhân bản (duplicate), xuất bản/chuyển nháp, và xóa thiệp cưới.
- Quản lý kho ảnh cưới, ảnh bìa, avatar cặp đôi và album ảnh gia đình (hỗ trợ tải lên từ máy tính hoặc link trực tiếp).
- Tùy chọn nhiều giao diện thiệp: *Hoàng Gia Đỏ Kim*, *Vàng Hoàng Kim*, *Kem Hoa Tinh Khôi*, *Khmer Traditional*.

### 3. Thông Tin Cặp Đôi & Gia Đình Chi Tiết
- Họ và tên chú rể & cô dâu, thân phụ & thân mẫu, quê quán, số điện thoại, đại diện gia đình, lời nhắn thân tình.
- Lịch trình riêng biệt: Lễ Vu Quy (Nhà Gái), Lễ Thành Hôn (Nhà Trai) và Tiệc Cưới (Nhà Hàng).
- Tích hợp nút chỉ đường Google Maps một chạm.
- Lịch Dương và lịch Âm (Âm lịch / Chữ Khmer truyền thống).
- Hộp mừng cưới online (Lì xì trực tuyến): Số tài khoản ngân hàng chú rể & cô dâu, mã QR chuyển khoản, nút sao chép STK nhanh.

### 4. Hệ Thống Khách Mời & Phản Hồi Tham Dự (RSVP)
- Biểu mẫu RSVP tương tác: Tên khách, số điện thoại, trạng thái (Tham gia / Không tham gia / Chưa chắc chắn), số người đi cùng, khách bên nhà trai hay nhà gái, lời chúc phúc.
- Cơ chế chống trùng lặp thông minh: Tự động nhận diện và cập nhật thông tin nếu khách gửi lại.
- Tạo đường dẫn cá nhân hóa cho từng vị khách quý (`/w/slug?guest=code`) hiển thị lời chào trân trọng riêng biệt ở đầu thiệp.
- Xem danh sách phản hồi RSVP, lọc trạng thái, tìm kiếm và **xuất file Excel/CSV** (hỗ trợ tiếng Việt và Khmer không bị lỗi font nhờ UTF-8 BOM).

### 5. Mã QR & Chia Sẻ Đa Nền Tảng
- Tự động sinh mã QR độ nét cao cho từng thiệp cưới và link khách mời riêng.
- Tải ảnh mã QR dạng PNG để in lên thiệp cưới giấy hoặc chia sẻ lên Zalo, Facebook, Messenger.
- Tùy chọn bảo vệ thiệp bằng mật khẩu riêng tư.

---

## 🚀 Hướng Dẫn Cài Đặt & Triển Khai (Deployment Guide)

### 1. Chạy trên máy nội bộ (Local Development)
```bash
# 1. Cài đặt các thư viện
npm install

# 2. Khởi động máy chủ dev (Port 3000)
npm run dev
```

### 2. Tài khoản quản trị mặc định (Default Admin)
- **Email:** `admin@wedding.com`
- **Mật khẩu:** `Wedding@2026`
*(Có thể tùy biến thông qua biến môi trường `ADMIN_EMAIL` và `ADMIN_PASSWORD`)*

### 3. Build & Triển khai lên máy chủ thật (Production)
```bash
# 1. Build mã nguồn frontend
npm run build

# 2. Khởi động ứng dụng
NODE_ENV=production npm start
```

### 4. Triển khai lên Docker / Cloud Run / VPS
Ứng dụng sử dụng Express làm backend phục vụ API và các file tĩnh của Vite (`dist/`), dữ liệu lưu trữ bền vững tại thư mục `data/wedding_db.json` và ảnh tải lên tại `public/uploads/`.
- Khi triển khai lên Docker hoặc Cloud, mount volume cho thư mục `/data` và `/public/uploads` để giữ nguyên dữ liệu và ảnh tải lên.

---

## 📂 Cấu Trúc Dự Án (Project Structure)
- `server.ts`: Backend Express RESTful API, xác thực admin, lưu trữ dữ liệu, upload ảnh, xuất CSV.
- `src/types/wedding.ts`: Định nghĩa kiểu dữ liệu TypeScript (Invitation, RSVP, Guest, Language).
- `src/i18n/translations.ts`: Bộ từ điển song ngữ Tiếng Việt & Tiếng Khmer.
- `src/utils/audioPlayer.ts`: Trình phát âm thanh Web Audio API & nhạc nền.
- `src/components/AdminLogin.tsx`: Giao diện đăng nhập quản trị viên.
- `src/components/AdminDashboard.tsx`: Bảng điều khiển quản lý toàn bộ thiệp cưới & số liệu.
- `src/components/InvitationEditor.tsx`: Biểu mẫu tạo và chỉnh sửa chi tiết thiệp cưới.
- `src/components/PublicInvitation.tsx`: Trang thiệp cưới công khai với hiệu ứng mở thiệp, RSVP, bản đồ, album ảnh.
- `src/components/QRCodeModal.tsx`: Hộp thoại tạo và tải mã QR.
- `src/components/GuestLinkModal.tsx`: Quản lý link mời riêng cho từng khách mời.
- `src/components/RsvpListModal.tsx`: Quản lý và xuất danh sách RSVP sang Excel/CSV.
- `src/App.tsx`: Điều hướng ứng dụng.
