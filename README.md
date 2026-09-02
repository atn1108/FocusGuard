# FocusGuard

> Stop mindless scrolling before it starts.

FocusGuard là tiện ích mở rộng Chrome giúp hạn chế việc lướt **YouTube Shorts, TikTok, Instagram Reels và Facebook Reels** bằng cách tạo một khoảng dừng trước khi người dùng tiếp tục.

Thay vì chặn hoàn toàn, FocusGuard yêu cầu người dùng **chờ 30 giây và đưa ra quyết định có ý thức**.

---

## Tính năng

### v1.5 (Cơ bản)

* **Đếm ngược 30 giây** trước khi được tiếp tục.
* **Override 10 phút** cho từng nền tảng.
* **Master toggle** và toggle riêng cho từng nền tảng.
* **Thống kê số lần chặn trong ngày**.
* Hiển thị **thời gian override còn lại** ngay trong popup.
* Chặn `ESC`, `F5`, `Ctrl + R` và `Cmd + R` khi popup đang mở.
* Popup giao diện **frosted glass**.
* **CSS chặn sớm**, hạn chế flash nội dung.
* Hỗ trợ **SPA navigation** và `MutationObserver`.
* Chặn/xóa liên kết Reel và Shorts.
* Hiển thị badge `!` khi có sự kiện chặn.

### v2 (Nâng cấp)

* **Chế độ nghiêm ngặt** — Không thể bỏ qua chặn. Phải chờ 60 giây rồi chỉ được quay lại.
* **Pomodoro** — Tập trung theo chu kỳ (mặc định 25 phút tập trung, 5 phút nghỉ). Trong giờ nghỉ, FocusGuard tạm ngừng chặn.
* **Đồng bộ Pomodoro với MindSeed** — Khi timer MindSeed chạy, FocusGuard tự bật Pomodoro và chặn nội dung; kèm badge "MindSeed" trên popup.
* **Mục tiêu hàng ngày** — Giới hạn số lần bypass mỗi ngày. Hết giới hạn, không thể bypass nữa.
* **Whitelist / Blacklist** — Danh sách URL/domain không chặn hoặc luôn chặn.
* **Thống kê nâng cao** — Theo dõi số lần chặn theo ngày, chuỗi thành công (streak).
* **Theme** — Hỗ trợ giao diện Sáng / Tối / Tự động.

---

## Nền tảng

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

### Strict Mode

Khi bật **Chế độ nghiêm ngặt**:

* Không có nút "Xem tiếp" — chỉ có "Quay lại".
* Thời gian chờ tăng lên **60 giây**.
* Phù hợp khi bạn muốn chặn tuyệt đối.

### Pomodoro

* Đặt thời gian tập trung (mặc định 25 phút) và nghỉ (mặc định 5 phút).
* Trong giờ tập trung, FocusGuard chặn bình thường.
* Trong giờ nghỉ, FocusGuard tạm ngừng chặn.
* Hiển thị bộ đếm Pomodoro trong popup.

### Tích hợp MindSeed

FocusGuard có thể đồng bộ Pomodoro với web app **MindSeed**:

* Khi bạn **bắt đầu** timer tập trung trên MindSeed, FocusGuard tự bật Pomodoro và chặn các nền tảng (YouTube Shorts, TikTok, Instagram Reels, Facebook Reels).
* Khi bạn **tạm dừng / dừng / hoàn thành** phiên trên MindSeed, FocusGuard tạm ngừng chặn.
* Khi **tiếp tục** từ giữa chừng, FocusGuard giữ đúng thời gian còn lại.
* Trên popup hiển thị **badge "MindSeed"** khi Pomodoro đang được điều khiển bởi MindSeed.
* Bạn có thể đọc thêm và cài FocusGuard từ phần "Pair with FocusGuard" trong trang Hồ sơ của MindSeed.

### Daily Goal

* Đặt số lần bypass tối đa mỗi ngày (mặc định 3).
* Khi đạt giới hạn, không thể bypass nữa trong ngày.
* Dữ liệu tự động reset mỗi ngày.

### Whitelist / Blacklist

* **Whitelist**: URL/domain trong danh sách sẽ **KHÔNG BAO GIỜ** bị chặn.
* **Blacklist**: URL/domain trong danh sách sẽ **LUÔN** bị chặn, dù nền tảng đang tắt.

---

## Quản lý

### Popup

* Bật/tắt FocusGuard.
* Bật/tắt từng nền tảng.
* Xem thống kê trong ngày.
* Xem thời gian override.
* Bật/tắt chế độ nghiêm ngặt.
* Xem trạng thái Pomodoro.
* Xem tiến độ daily goal.
* Đổi giao diện (Sáng/Tối/Tự động).
* Mở trang Options.

### Options

* Quản lý các nền tảng.
* Cài đặt Strict Mode.
* Cài đặt Pomodoro (thời gian tập trung/nghỉ).
* Cài đặt Daily Goal (giới hạn bypass).
* Quản lý Whitelist / Blacklist.
* Chọn giao diện.
* **Cho phép 5 phút** để tạm ngừng toàn bộ chặn.

---

## Cấu trúc

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
│   ├── mindseed-bridge.js
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

## Permissions

```text
storage
tabs
alarms
```

### Host permissions

```text
*://*.youtube.com/*
*://*.tiktok.com/*
*://*.instagram.com/*
*://*.facebook.com/*
http://localhost/*
http://127.0.0.1/*
*://*.netlify.app/*
```

---

## Cài đặt

1. Mở `chrome://extensions`.
2. Bật **Developer mode**.
3. Chọn **Load unpacked**.
4. Chọn thư mục `FocusGuard`.

> Yêu cầu trình duyệt hỗ trợ Manifest V3.

---

## Roadmap

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

* [X] Strict Mode
* [X] Pomodoro
* [X] Đồng bộ Pomodoro với MindSeed
* [X] Daily Goal
* [X] Whitelist / Blacklist
* [X] Thống kê nâng cao
* [X] Theme

---

## Triết lý

FocusGuard không cấm bạn xem.

Nó chỉ tạo ra **30 giây để bạn dừng lại và lựa chọn**.

> **Pause. Think. Choose.**