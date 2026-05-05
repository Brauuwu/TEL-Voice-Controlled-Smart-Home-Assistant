# 📱 TEL SmartHome Assistant

Hệ thống điều khiển và giám sát nhà thông minh tích hợp trợ lý ảo giọng nói Tiếng Việt. Dự án được tối ưu hóa cho cả PC và Smartphone với giao diện hiện đại, trải nghiệm người dùng mượt mà.

## ✨ Tính năng nổi bật

-   **📱 Giao diện Mobile-First**: Thiết kế Premium, tối ưu hóa cho thao tác chạm, có thanh điều hướng (Bottom Navbar) tiện lợi.
-   **🎙️ Trợ lý ảo Tiếng Việt**: Điều khiển thiết bị và hỏi thông tin cảm biến qua giọng nói.
-   **📊 Giám sát thời gian thực**: Hiển thị thông số nhiệt độ, độ ẩm, ánh sáng qua biểu đồ và đồng hồ đo trực quan.
-   **🤖 Chế độ Tự động (Auto)**: Tự động điều khiển đèn và quạt dựa trên thông số cảm biến môi trường.
-   **🔐 Quản lý người dùng**: Hệ thống phân quyền Admin/User, bảo mật mật khẩu bằng Bcrypt.

## 🛠️ Công nghệ sử dụng

-   **Frontend**: React.js, Tailwind CSS, Lucide React, Recharts, Socket.io Client.
-   **Backend**: Node.js, Express, MySQL, MQTT (HiveMQ), Socket.io.
-   **Voice Service**: Python Flask, Google Speech API, gTTS, FFmpeg.

## ⚙️ Hướng dẫn cài đặt

### Yêu cầu hệ thống
-   Node.js v16+ & Python 3.9+
-   MySQL Server & FFmpeg

### Các bước thực hiện

1.  **Cấu hình Database**: Tạo database `btliot` và import các bảng cần thiết.
2.  **Chạy Backend (Server)**:
    ```bash
    cd server
    npm install
    npm start # Chạy trên cổng 8688
    ```
3.  **Chạy Voice Service**:
    ```bash
    cd audio-service
    pip install -r requirements.txt
    python main.py # Chạy trên cổng 5000
    ```
4.  **Chạy Frontend (Client) với HTTPS**:
    ```bash
    cd client
    npm install
    # Chạy lệnh sau để bật HTTPS (bắt buộc để dùng Microphone trên điện thoại)
    $env:HTTPS="true"; npm start
    ```

## 🌐 Truy cập từ Smartphone (HTTPS Mode)

Để sử dụng Microphone khi truy cập từ thiết bị khác trong mạng LAN, hệ thống đã được cấu hình chạy ở chế độ **Secure Context (HTTPS)**.

### Các bước truy cập:
1.  Xác định IP máy chủ của bạn (Ví dụ: `192.168.1.10`).
2.  Trên điện thoại, truy cập địa chỉ: `https://192.168.1.10:3000`
3.  **Bỏ qua cảnh báo bảo mật**: Nhấn **"Nâng cao" (Advanced)** -> **"Tiếp tục truy cập" (Proceed anyway)**.
4.  **Cho phép Nội dung không an toàn (Mixed Content)**: 
    -   Vì Client chạy `https` nhưng gọi API xuống Backend `http`.
    -   Trên Chrome điện thoại: Nhấn vào biểu tượng **Cài đặt trang web** (gần thanh địa chỉ) -> **Nội dung không an toàn** -> Chọn **Cho phép**.
5.  Bây giờ bạn có thể nhấn vào biểu tượng Micro và ra lệnh bằng giọng nói bình thường.

## 🎙️ Lệnh giọng nói mẫu
-   "Bật đèn phòng khách" / "Tắt quạt"
-   "Nhiệt độ hiện tại là bao nhiêu?"
-   "Hỏi thông số thời tiết"
-   "Chuyển sang chế độ tự động"

---
*Dự án được thực hiện bởi nhóm sinh viên PTIT (Vi Minh Hiếu & Nguyễn Văn Hoàng).*
