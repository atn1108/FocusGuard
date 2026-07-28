# 🛡️ FocusGuard

> Stop mindless scrolling before it starts.

FocusGuard là extension giúp giảm việc lướt **YouTube Shorts**, **TikTok**, **Instagram Reels** và **Facebook Reels** bằng cách tạo một khoảng dừng trước khi người dùng tiếp tục xem.

---

# Mục tiêu

Thay vì chặn hoàn toàn, FocusGuard buộc người dùng **đưa ra quyết định có ý thức** trước khi tiếp tục lướt video ngắn.

Ý tưởng cốt lõi:

> Nếu sau 30 giây bạn vẫn muốn xem, hãy xem.
> Nếu không đủ kiên nhẫn để đợi 30 giây thì có lẽ bạn cũng không thực sự muốn xem.

---

# Tính năng

* Phát hiện khi truy cập `/shorts`, `/reels` hoặc `/watch` (YouTube Shorts, TikTok, Instagram Reels, Facebook Reels).
* Hiện popup xác nhận.
* Nút **Xem tiếp 10 phút** bị khóa 30 giây.
* Hết 30 giây mới được tiếp tục.
* Nếu chọn **Quay lại** → đóng tab.
* Nếu chọn **Xem tiếp** → không hỏi lại trong 10 phút.

---

# Override 10 phút

Sau khi xác nhận:

* Không hiện popup nữa.
* Không chặn.
* Hết 10 phút tự động bật lại.

Mỗi nền tảng có bộ đếm riêng.

Ví dụ:

```
YouTube:
10 phút

TikTok:
10 phút

Instagram:
10 phút

Facebook:
10 phút
```

---

# Chống lách

Popup đang mở sẽ chặn:

* ESC
* F5
* Ctrl + R
* Ctrl + Shift + R
* Ctrl + F5
* Cmd + R (macOS)

Người dùng phải:

* Quay lại
* Hoặc chờ đủ 30 giây.

---

# Cấu trúc project

```
FocusGuard/

├── manifest.json

├── background/
│   └── background.js

├── popup/
│   ├── popup.html
│   ├── popup.js
│   └── popup.css

├── options/
│   ├── options.html
│   ├── options.js
│   └── options.css

├── content/
│   ├── blocker.js
│   ├── confirm.js
│   ├── observer.js
│   ├── router.js
│   ├── index.js
│   └── early-block.css

├── icons/
│   ├── 16.png
│   ├── 32.png
│   ├── 48.png
│   └── 128.png

└── README.md
```

---

# Quyền

```
storage
tabs
scripting
activeTab
```

Host:

```
*.youtube.com
*.tiktok.com
*.instagram.com
*.facebook.com
```

---

# Roadmap

## v1.5

* ✅ YouTube Shorts
* ✅ TikTok
* ✅ Instagram Reels
* ✅ Facebook Reels
* ✅ Popup xác nhận
* ✅ Countdown 30 giây
* ✅ Override 10 phút
* ✅ Chặn phím tắt
* ✅ Đóng tab

---

## v2

* Strict Mode
* Pomodoro
* Daily Goal
* Whitelist
* Blacklist
* Password mở khóa
* Đồng bộ Chrome
* Thống kê
* Theme

---

# Triết lý

FocusGuard không cố gắng cấm người dùng.

Nó chỉ tạo ra một khoảng dừng ngắn để giúp người dùng suy nghĩ trước khi tiếp tục lướt.

Nếu sau 30 giây bạn vẫn muốn xem, FocusGuard sẽ không ngăn cản.
