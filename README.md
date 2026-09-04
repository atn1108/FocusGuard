# FocusGuard

> Stop mindless scrolling before it starts.

FocusGuard là tiện ích mở rộng Chrome giúp hạn chế việc lướt **YouTube Shorts, TikTok, Instagram Reels, Facebook Reels, Reddit, X (Twitter), Twitch, Pinterest và Netflix** bằng cách tạo một khoảng dừng trước khi người dùng tiếp tục.

Thay vì chặn hoàn toàn, FocusGuard yêu cầu người dùng **chờ đếm ngược rồi đưa ra quyết định có ý thức**.

---

## Tính năng

### v3.1 (Hiện tại)

* **9 nền tảng + trang web tùy chỉnh** — Registry trung tâm (`sites.js`) cho YouTube (chỉ `/shorts/*`), TikTok, Instagram Reels, Facebook Reels, Reddit, X/Twitter, Twitch, Pinterest, Netflix (toàn trang). Thêm bất kỳ domain nào qua **Custom Sites** (trình duyệt sẽ hỏi quyền truy cập).
* **Ngân sách thời lượng hàng ngày (Budgets)** — Giới hạn phút xem mỗi ngày cho từng nền tảng (mặc định 30 phút). Hết ngân sách = **chặn cứng**.
* **Theo dõi thời gian thực** — `tracker.js` gửi heartbeat mỗi 30 giây khi tab đang hiển thị; dữ liệu lưu 100% cục bộ, tự xóa sau 30 ngày (`usage`, `usageHistory`).
* **Overlay v3** — Giao diện chặn mới: đếm ngược, chọn **lý do** (buồn chán / trốn việc / thói quen), nút **Xem tiếp 10 phút** hoặc **Quay lại**. Chế độ nghiêm ngặt / hết goal / hết budget → không có nút bypass.
* **Trang Tab mới (FocusGuard Home)** — Việc cần làm, trạng thái Pomodoro, thời lượng hôm nay so với ngân sách, streak, nút tạm dừng 5 phút. Có thể **tắt Tab mới** trong Options để quay về Tab mới mặc định của Chrome.
* **Giải pháp icons dùng chung** — `icons.js` (9 brand icons SVG) dùng chung popup/options; i18n gộp thành 1 file `i18n.js` ở root.
* **Options dạng TOC** — Sidebar 11 mục: Blocking, Budgets, Custom, Strict, Pomodoro, Goal, Lists, New Tab, Usage, Pause, Appearance.

### v2.1 (UI + i18n)

* **Giao diện hiện đại** — Font **Plus Jakarta Sans**, micro-interactions, dark mode tối ưu, shadow tokens.
* **Đa ngôn ngữ (Việt / Anh)** — Switch ngôn ngữ trong popup và Options.

### v2 (Nâng cấp)

* **Chế độ nghiêm ngặt** — Không thể bỏ qua chặn. Phải chờ 60 giây rồi chỉ được quay lại.
* **Pomodoro** — Tập trung theo chu kỳ (mặc định 25 phút tập trung / 5 phút nghỉ). Trong giờ nghỉ, FocusGuard tạm ngừng chặn.
* **Đồng bộ Pomodoro với MindSeed** — Khi timer MindSeed chạy, FocusGuard tự bật Pomodoro và chặn nội dung; kèm badge "MindSeed" trên popup.
* **Mục tiêu hàng ngày (Daily Goal)** — Giới hạn số lần bypass mỗi ngày. Hết giới hạn, không thể bypass nữa.
* **Whitelist / Blacklist** — Danh sách URL/domain không chặn hoặc luôn chặn (blacklist chặn kể cả khi nền tảng tắt).
* **Thống kê nâng cao** — Số lần chặn theo ngày, chuỗi thành công (streak).
* **Theme** — Sáng / Tối / Tự động.

### v1.5 (Cơ bản)

* **Đếm ngược 30 giây** trước khi được tiếp tục.
* **Override 10 phút** cho từng nền tảng.
* **Master toggle** và toggle riêng cho từng nền tảng.
* **Thống kê số lần chặn trong ngày**.
* Hiển thị **thời gian override còn lại** ngay trong popup.
* Chặn `ESC`, `F5`, `Ctrl + R` và `Cmd + R` khi popup đang mở.
* **CSS chặn sớm**, hạn chế flash nội dung.
* Hỗ trợ **SPA navigation** và `MutationObserver`.
* Chặn/xóa liên kết Reel và Shorts.
* Hiển thị badge `!` khi có sự kiện chặn.

---

## Nền tảng

| Nền tảng | Phạm vi | Cơ chế |
|----------|------------------------|----------------|
| YouTube | `/shorts/*` | Overlay + đếm ngược |
| TikTok | Toàn trang | Overlay + đếm ngược |
| Instagram | `/reel/*`, `/reels/*` | Overlay + đếm ngược |
| Facebook | `/reel/*`, `/reels/*` | Overlay + đếm ngược |
| Reddit | Toàn trang | Overlay + đếm ngược |
| X (Twitter) | Toàn trang | Overlay + đếm ngược |
| Twitch | Toàn trang | Overlay + đếm ngược |
| Pinterest | Toàn trang | Overlay + đếm ngược |
| Netflix | Toàn trang | Overlay + đếm ngược |
| Custom sites | Domain tự thêm | Overlay + đếm ngược |

Chế độ theo nền tảng trong Options:

* **Chặn /shorts/*** (YouTube) hoặc **chặn /reel*, /reels*** (Instagram, Facebook): chỉ chặn nội dung dạng ngắn.
* **Chặn toàn trang**: áp cho tất cả URL của nền tảng.

### Override

Khi chọn **Xem tiếp**:

* Nền tảng đó được mở trong **10 phút** (không hiện popup trong thời gian này).
* Mỗi nền tảng có bộ đếm riêng.
* Hết 10 phút, FocusGuard tự động bật lại.

### Strict Mode / Daily Goal / Budgets

* **Strict Mode**: không có nút "Xem tiếp" — chỉ "Quay lại", thời gian chờ 60 giây.
* **Daily Goal**: vượt số lần bypass/ngày → chặn cứng đến hết ngày.
* **Budgets**: dùng hết số phút/ngày → chặn cứng cho đến khi reset ngày mới.

### Pomodoro

* Đặt thời gian tập trung (mặc định 25 phút) và nghỉ (mặc định 5 phút).
* Trong giờ tập trung, FocusGuard chặn bình thường; trong giờ nghỉ, tạm ngừng chặn.
* Bộ đếm hiển thị trong popup và Trang Tab mới.

### Whitelist / Blacklist

* **Whitelist**: URL/domain trong danh sách sẽ **KHÔNG BAO GIỜ** bị chặn.
* **Blacklist**: URL/domain sẽ **LUÔN** bị chặn, dù nền tảng đang tắt (không thể bypass).

---

## Quản lý

### Popup

* Bật/tắt FocusGuard & từng nền tảng.
* Thống kê hôm nay (`usage`, 7 ngày), nút **Tạm dừng 5 phút**.
* Xem trạng thái Pomodoro, tiến độ daily goal, streak.
* Đổi theme, đổi ngôn ngữ, mở Options.

### Options (TOC 11 mục)

* **Blocking** — bật/tắt từng nền tảng, chế độ chặn (toàn trang / `/shorts` / `/reel*`).
* **Budgets** — giới hạn phút/ngày cho từng trang.
* **Custom** — thêm/xóa trang web tùy chỉnh.
* **Strict** — chế độ nghiêm ngặt.
* **Pomodoro** — thời gian tập trung/nghỉ, bắt đầu/dừng.
* **Goal** — daily goal, số lần bypass/ngày.
* **Lists** — whitelist / blacklist.
* **New Tab** — bật/tắt Trang Tab mới của FocusGuard.
* **Usage** — báo cáo sử dụng (biểu đồ 7 ngày).
* **Pause** — tạm ngừng toàn bộ chặn 5 phút.
* **Appearance** — theme + ngôn ngữ.

---

## Cấu trúc

```text
FocusGuard/
├── manifest.json          # MV3, v3.1.0
├── background.js          # budgets, usage, pomodoro, badges, custom scripts
├── sites.js               # registry 9 nền tảng
├── icons.js               # brand icons SVG dùng chung
├── i18n.js                # bản dịch vi/en dùng chung
├── content/
│   ├── confirm.js         # overlay v3 (showConfirm)
│   ├── blocker.js         # luồng chặn (đếm ngược/budget/override)
│   ├── index.js           # khởi động + lắng nghe sự kiện
│   ├── router.js
│   ├── observer.js        # MutationObserver + SPA
│   ├── tracker.js         # usage heartbeat 30s
│   ├── mindseed-bridge.js # đồng bộ Pomodoro MindSeed
│   └── early-block.css
├── popup/                 # popup.html/js/css
├── options/               # options.html/js/css (TOC)
├── newtab/                # Trang Tab mới (tasks, pomodoro, usage)
├── icons/                 # 16/32/48/128
├── .sentrux/              # rules.toml (kiến trúc)
├── PRIVACY.md
└── README.md
```

---

## Quyền truy cập

```text
storage
alarms
scripting
```

**Host permissions** (khai báo trong `manifest.json`): youtube, tiktok, instagram, facebook, reddit, x.com, twitter.com, twitch.tv, pinterest.com, netflix.com.

**Optional host permissions** (`http://*/*`, `https://*/*`): chỉ yêu cầu khi bạn thêm **Custom sites** — FocusGuard hỏi quyền khi cần, không chiếm trước.

> Không yêu cầu quyền `tabs`. Việc đóng tab (Strict Mode / "Quay lại") dùng `chrome.tabs.remove(sender.tab.id)` từ sender của content script.

---

## Cài đặt

1. Mở `chrome://extensions`.
2. Bật **Developer mode**.
3. Chọn **Load unpacked**.
4. Chọn thư mục `FocusGuard`.

> Yêu cầu trình duyệt hỗ trợ Manifest V3.

---

## Roadmap

### v1.5 → v2 → v2.1

* [X] Các tính năng cơ bản, strict mode, pomodoro, daily goal, lists, theme, streak, i18n, UI hiện đại.

### v3.1 (Đã phát hành)

* [X] Registry 9 nền tảng (`sites.js`) + custom sites (optional host permissions)
* [X] Budgets hàng ngày + chặn cứng khi hết ngân sách
* [X] Usage tracking (heartbeat 30s, `usage`/`usageHistory`, tự xóa sau 30 ngày)
* [X] Overlay v3 (đếm ngược, lý do, bypass 10 phút, strict/goal/budget không bypass)
* [X] Trang Tab mới FocusGuard Home + toggle tắt/mở
* [X] Icons dùng chung (`icons.js`), i18n 1 file root, Options TOC 11 mục
* [X] Chống lỗi `Extension context invalidated` khi reload trong lúc phát triển
* [X] Governance kiến trúc bằng sentrux (`sentrux check .` — 11 rules, quality 7651)

### v3.2 (Kế hoạch)

* [ ] Báo cáo hàng tuần từ `microJournal` (lý do đã chọn khi bị chặn)
* [ ] Gamification: điểm, cấp độ, thành tựu
* [ ] Biểu đồ usage chi tiết hơn trong Options

---

## Chất lượng & kiến trúc

Dự án dùng **sentrux** làm cảm biến kiến trúc: định nghĩa layer & boundary trong `.sentrux/rules.toml`, chạy `sentrux check .` trước khi phát hành. Hiện tại: acyclicity 10000, redundancy 12.7%, 0 vi phạm boundary.

```bash
sentrux check .
# ✓ All architectural rules pass
```

---

## Triết lý

FocusGuard không cấm bạn xem.

Nó chỉ tạo ra **một khoảng dừng để bạn lựa chọn có ý thức**.

> **Pause. Think. Choose.**