
# 🛡️ FocusGuard

> Stop mindless scrolling before it starts.

FocusGuard là Chrome Extension giúp hạn chế việc lướt **YouTube Shorts, TikTok, Instagram Reels và Facebook Reels** bằng cách tạo một khoảng dừng trước khi người dùng tiếp tục.

Thay vì chặn hoàn toàn, FocusGuard yêu cầu người dùng **chờ 30 giây và đưa ra quyết định có ý thức**.

---

## ✨ Tính năng

* ⏱️ **Countdown 30 giây** trước khi được tiếp tục.
* 🔓 **Override 10 phút** cho từng nền tảng.
* ⚙️ **Master toggle** và toggle riêng cho từng nền tảng.
* 📊 **Thống kê số lần chặn trong ngày**.
* ⏳ Hiển thị **thời gian override còn lại** ngay trong popup.
* 🚫 Chặn `ESC`, `F5`, `Ctrl + R` và `Cmd + R` khi popup đang mở.
* 🧊 Popup giao diện **frosted glass**.
* 🛡️ CSS chặn sớm, hạn chế flash nội dung.
* 🔄 Hỗ trợ **SPA navigation** và `MutationObserver`.
* 🔗 Chặn/xóa liên kết Reel và Shorts.
* 🔴 Hiển thị badge `!` khi có sự kiện chặn.

---

## 🌐 Nền tảng

| Nền tảng | Phạm vi                  | Cơ chế         |
| ---------- | ------------------------- | ---------------- |
| YouTube    | `/shorts/*`             | Popup + 30 giây |
| TikTok     | Toàn trang               | Popup + 30 giây |
| Instagram  | `/reel/*`, `/reels/*` | Chuyển hướng  |
| Facebook   | `/reel/*`, `/reels/*` | Chuyển hướng  |

### Override

Khi chọn **Xem tiếp**:

* Nền tảng đó được mở trong **10 phút**.
* Không hiển thị popup trong thời gian override.
* Mỗi nền tảng có bộ đếm riêng.
* Hết 10 phút, FocusGuard tự động bật lại.

---

## ⚙️ Quản lý

### Popup

* Bật/tắt FocusGuard.
* Bật/tắt từng nền tảng.
* Xem thống kê trong ngày.
* Xem thời gian override.
* Mở trang Options.

### Options

* Quản lý các nền tảng.
* **Cho phép 5 phút** để tạm ngừng toàn bộ chặn.

---

## 📁 Cấu trúc

```text
FocusGuard/
├── manifest.json
├── background.js
├── content/
│   ├── confirm.js
│   ├── blocker.js
│   ├── index.js
│   ├── router.js
│   ├── observer.js
│   └── early-block.css
├── popup/
│   ├── popup.html
│   ├── popup.js
│   └── popup.css
├── options/
│   ├── options.html
│   ├── options.js
│   └── options.css
├── icons/
│   ├── 16.png
│   ├── 32.png
│   ├── 48.png
│   └── 128.png
└── README.md
```

---

## 🔐 Permissions

```text
storage
tabs
```

### Host permissions

```text
*://*.youtube.com/*
*://*.tiktok.com/*
*://*.instagram.com/*
*://*.facebook.com/*
```

---

## 🚀 Cài đặt

1. Mở `chrome://extensions`.
2. Bật **Developer mode**.
3. Chọn **Load unpacked**.
4. Chọn thư mục `FocusGuard`.

> Yêu cầu trình duyệt Chromium hỗ trợ Manifest V3.

---

## 🗺️ Roadmap

### v1.5

* [X] YouTube Shorts
* [X] TikTok
* [X] Instagram Reels
* [X] Facebook Reels
* [X] Countdown 30 giây
* [X] Override 10 phút
* [X] Popup & Options
* [X] Thống kê
* [X] SPA navigation
* [X] MutationObserver
* [X] Early blocking
* [X] Link blocking
* [X] Extension badge

### v2

* [ ] Strict Mode
* [ ] Pomodoro
* [ ] Daily Goal
* [ ] Whitelist / Blacklist
* [ ] Password Unlock
* [ ] Chrome Sync
* [ ] Thống kê nâng cao
* [ ] Theme

---

## 🧠 Philosophy

FocusGuard không cấm bạn xem.

Nó chỉ tạo ra **30 giây để bạn dừng lại và lựa chọn**.

> **Pause. Think. Choose.**
