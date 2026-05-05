# 📱 TEL SmartHome Assistant

Hệ thống điều khiển và giám sát nhà thông minh tích hợp trợ lý ảo giọng nói Tiếng Việt. Dự án được tối ưu hóa cho cả PC và Smartphone với giao diện hiện đại, trải nghiệm người dùng mượt mà.

## ✨ Tính năng nổi bật

-   **📱 Giao diện Mobile-First**: Thiết kế Premium, tối ưu hóa cho thao tác chạm, có thanh điều hướng (Bottom Navbar) tiện lợi.
-   **🎙️ Trợ lý ảo Tiếng Việt**: Điều khiển thiết bị và hỏi thông tin cảm biến qua giọng nói (Sử dụng Google Speech Recognition & gTTS).
-   **📊 Giám sát thời gian thực**: Hiển thị thông số nhiệt độ, độ ẩm, ánh sáng qua biểu đồ và đồng hồ đo trực quan (Socket.io).
-   **🤖 Chế độ Tự động (Auto)**: Tự động điều khiển đèn và quạt dựa trên thông số cảm biến môi trường.
-   **🔐 Quản lý người dùng**: Hệ thống phân quyền Admin/User, bảo mật mật khẩu bằng Bcrypt.
-   **📜 Nhật ký hoạt động**: Lưu trữ chi tiết lịch sử điều khiển và trạng thái hệ thống.

## 🛠️ Công nghệ sử dụng

### 1. Frontend (React.js)
-   **UI Framework**: Tailwind CSS (Premium Glassmorphism Design).
-   **Icons**: Lucide React.
-   **Charts**: Recharts & Chart.js.
-   **Real-time**: Socket.io Client.

### 2. Backend (Node.js & Express)
-   **Database**: MySQL (Lưu trữ lịch sử cảm biến, nhật ký, người dùng).
-   **Communication**: MQTT (Giao tiếp với phần cứng ESP32).
-   **Real-time Server**: Socket.io.

### 3. Voice Service (Python Flask)
-   **Speech-to-Text**: Google Speech API (Xử lý lệnh tiếng Việt).
-   **Text-to-Speech**: gTTS (Phản hồi giọng nói).
-   **Audio Processing**: FFmpeg (Chuyển đổi định dạng âm thanh).

## ⚙️ Hướng dẫn cài đặt

### Yêu cầu hệ thống
-   Node.js v16+
-   Python 3.9+
-   MySQL Server
-   FFmpeg (Cần thiết cho xử lý âm thanh)

### Các bước thực hiện

1.  **Cấu hình Database**:
    -   Tạo database tên `btliot`.
    -   Import các bảng: `sensordata`, `activity_logs`, `users`, `device_status`.

2.  **Chạy Backend (Server)**:
    ```bash
    cd server
    npm install
    # Tạo file .env dựa trên .env.example và điền thông tin DB, MQTT
    npm start
    ```

3.  **Chạy Voice Service**:
    ```bash
    cd audio-service
    pip install -r requirements.txt
    python main.py
    ```

4.  **Chạy Frontend (Client)**:
    ```bash
    cd client
    npm install
    npm start
    ```

## 🎙️ Lệnh giọng nói mẫu

-   "Bật đèn phòng khách" / "Tắt quạt"
-   "Nhiệt độ hiện tại là bao nhiêu?"
-   "Mở rèm cửa" / "Đóng rèm"
-   "Chuyển sang chế độ tự động"
-   "Hỏi thông số thời tiết"

## 🌐 Truy cập từ thiết bị khác (Smartphone)

Để sử dụng Microphone trên điện thoại trong mạng nội bộ (không có HTTPS), bạn cần cấu hình Chrome Flag trên điện thoại:

1.  Mở Chrome trên điện thoại, truy cập: `chrome://flags/#unsafely-treat-insecure-origin-as-secure`
2.  Chuyển sang **Enabled**.
3.  Nhập địa chỉ IP máy chủ vào ô trống (Ví dụ: `http://192.168.1.10:3000`).
4.  Nhấn **Relaunch**.

---
*Dự án được thực hiện bởi nhóm sinh viên PTIT (Vi Minh Hiếu & Nguyễn Văn Hoàng).*
