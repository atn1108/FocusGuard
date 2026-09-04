🛡️ FocusGuard

«Stop mindless scrolling before it starts.»

FocusGuard là tiện ích mở rộng Chrome giúp hạn chế việc lướt nội dung ngắn và các nền tảng gây xao nhãng bằng cách tạo ra một khoảng dừng trước khi người dùng tiếp tục.

Không chặn hoàn toàn — FocusGuard giúp bạn dừng lại và lựa chọn có ý thức.

---

✨ Tính năng

- 🛡️ Chặn nội dung với countdown và overlay.
- ⏱️ Override 10 phút cho từng nền tảng.
- 💰 Daily Budgets — giới hạn thời lượng sử dụng mỗi ngày.
- 🚫 Strict Mode — không thể bypass.
- 🎯 Daily Goal — giới hạn số lần bypass mỗi ngày.
- 🍅 Pomodoro — Focus / Break.
- 📊 Usage Tracking — theo dõi thời gian sử dụng và streak.
- 🔗 Whitelist / Blacklist.
- 🌐 Custom Sites — thêm website tùy chỉnh.
- 🏠 FocusGuard Home — Tab mới với task, Pomodoro và usage.
- 🌙 Theme — Sáng / Tối / Tự động.
- 🌍 Đa ngôn ngữ — Tiếng Việt / English.
- 🔗 MindSeed Integration — đồng bộ Pomodoro với MindSeed.

---

🌐 Nền tảng hỗ trợ

Nền tảng| Phạm vi mặc định
YouTube| Shorts
TikTok| Toàn trang
Instagram| Reels
Facebook| Reels
Reddit| Toàn trang
X (Twitter)| Toàn trang
Twitch| Toàn trang
Pinterest| Toàn trang
Netflix| Toàn trang
Custom Sites| Domain do người dùng thêm

Có thể thay đổi phạm vi chặn của từng nền tảng trong Options.

---

⚙️ Chế độ hoạt động

Override

Cho phép tiếp tục sử dụng nền tảng trong 10 phút.

Strict Mode

Không có nút bypass. Người dùng phải chờ 60 giây rồi quay lại.

Daily Goal

Giới hạn số lần bypass trong ngày.

Daily Budget

Giới hạn số phút sử dụng mỗi nền tảng mỗi ngày. Hết ngân sách → chặn cứng đến ngày tiếp theo.

Pomodoro

Thiết lập thời gian Focus / Break. Trong thời gian nghỉ, FocusGuard tạm ngừng chặn.

---

📊 Usage

FocusGuard theo dõi thời gian sử dụng ngay trên thiết bị.

- Heartbeat mỗi 30 giây khi tab đang hiển thị.
- Lưu dữ liệu cục bộ.
- Dữ liệu usage tự động xóa sau 30 ngày.
- Hiển thị thống kê hôm nay, 7 ngày và streak.

---

🔧 Quản lý

Popup

- Bật/tắt FocusGuard.
- Quản lý từng nền tảng.
- Xem usage, streak và Daily Goal.
- Xem Pomodoro.
- Tạm dừng chặn 5 phút.
- Đổi theme và ngôn ngữ.

Options

Cấu hình:

- Blocking
- Budgets
- Custom Sites
- Strict Mode
- Pomodoro
- Daily Goal
- Whitelist / Blacklist
- New Tab
- Usage
- Pause
- Appearance

---

📁 Cấu trúc

FocusGuard/
├── manifest.json
├── background.js
├── sites.js
├── icons.js
├── i18n.js
├── content/
│   ├── confirm.js
│   ├── blocker.js
│   ├── index.js
│   ├── router.js
│   ├── observer.js
│   ├── tracker.js
│   ├── mindseed-bridge.js
│   └── early-block.css
├── popup/
├── options/
├── newtab/
├── icons/
├── PRIVACY.md
└── README.md
---

🔐 Quyền

storage
alarms
scripting

FocusGuard chỉ yêu cầu quyền truy cập các website được hỗ trợ.

Custom Sites sử dụng optional host permissions và chỉ yêu cầu quyền khi người dùng thêm website.

Dữ liệu usage được lưu cục bộ trên thiết bị.

---

🚀 Cài đặt

1. Mở "chrome://extensions".
2. Bật Developer mode.
3. Chọn Load unpacked.
4. Chọn thư mục "FocusGuard".

«Yêu cầu trình duyệt Chromium hỗ trợ Manifest V3.»

---

🗺️ Roadmap

v3.1 — Đã phát hành

- [x] 9 nền tảng + Custom Sites
- [x] Daily Budgets
- [x] Usage Tracking
- [x] Overlay v3
- [x] FocusGuard Home
- [x] Pomodoro
- [x] Strict Mode
- [x] Daily Goal
- [x] Whitelist / Blacklist
- [x] MindSeed Integration
- [x] Tiếng Việt / English
- [x] Light / Dark / System theme

v3.2

- [ ] Báo cáo hàng tuần
- [ ] Gamification
- [ ] Thống kê usage chi tiết hơn

---

🧠 Philosophy

FocusGuard không cấm bạn sử dụng Internet.

Nó chỉ tạo ra một khoảng dừng để bạn lựa chọn có ý thức.

«Pause. Think. Choose.»