# FocusGuard

> Stop mindless scrolling before it starts.

FocusGuard la extension giam viec luot **YouTube Shorts**, **TikTok**, **Instagram Reels** va **Facebook Reels** bang cach tao mot khoang dung truoc khi nguoi dung tiep tuc xem.

---

# Muc tieu

Thay vi chan hoan toan, FocusGuard bu nguoi dung **dua ra quyet dinh co y thuc** truoc khi tiep tuc luot video ngan.

> Neu sau 30 giay ban van muon xem, hay xem.
> Neu khong du kien nhan de doi 30 giay thi co le ban cung khong that su muon xem.

---

# Tinh nang

**Chinh:**
* Phat hien khi truy cap `/shorts`, `/reel`, `/reels` hoac cac trang TikTok.
* Hien popup xac nhan voi hieu ung frosted-glass.
* Nut **Xem tiep 10 phut** bi khoa 30 giay.
* Het 30 giay moi duoc tiep tuc.
* Neu chon **Quay lai** -> dong tab.
* Neu chon **Xem tiep** -> khong hoi lai trong 10 phut.
* CSS som an noi dung truoc khi JavaScript chay, ngan hien thi "flash" noi dung.

**Quan ly:**
* Bao gom popup (master toggle + 4 toggle nen tang rieng le).
* Trang options voi dieu khien chi tiet hon.
* Nut **Cho phep 5 phut** trong options: tat ca chan tam ngung 5 phut.
* Thong ke so lan chan trong ngay, hien thi trong popup.

**Ky thuat:**
* Phat hien SPA navigation qua `history.pushState` / `replaceState` / `popstate`.
* `MutationObserver` quan sat DOM, rescan sau 500ms debounce.
* Chan click lien ket reel/reels, chuyen huong ve trang chu.
* Xoa cac the `<a>` chua `/reel` khoi DOM.
* Badge mau do "!" tren icon extension khi co su kien chan.

---

# Nen tang ho tro

| Nen tang | Kieu chan |
|---|---|
| YouTube (`/shorts/*`) | Popup xac nhan |
| TikTok (toan trang) | Popup xac nhan |
| Instagram (`/reel/*`, `/reels/*`) | Redirect truc tiep ve trang chu |
| Facebook (`/reel/*`, `/reels/*`) | Redirect truc tiep ve trang chu |

---

# Override 10 phut

Sau khi xac nhan "Xem tiep":

* Khong hien popup nua tren nen tang do.
* Khong chan.
* Het 10 phut tu dong bat lai.
* Moi nen tang co bo dem rieng (luu trong `chrome.storage.local` voi key `override`).

---

# Chan phim tat

Popup dang mo co thu chan:
* ESC
* F5
* Ctrl + R
* Cmd + R (macOS)

Nguoi dung phai:
* Quay lai
* Hoac cho du 30 giay.

---

# Cau truc project

```
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

# Quyen

```
storage
tabs
```

Host:

```
*://*.youtube.com/*
*://*.tiktok.com/*
*://*.instagram.com/*
*://*.facebook.com/*
```

---

# Roadmap

## v1.5

* YouTube Shorts
* TikTok
* Instagram Reels
* Facebook Reels
* Popup xac nhan voi countdown 30 giay
* Override 10 phut moi nen tang
* Bao gom popup va trang options
* Thong ke so lan chan/ngay
* CSS an som noi dung
* SPA navigation detection (History API)
* DOM mutation observer
* Chan click va xoa lien ket reel

## v2

* Strict Mode
* Pomodoro
* Daily Goal
* Whitelist / Blacklist
* Password mo khoa
* Dong bo Chrome
* Thong ke chi tiet hon
* Theme

---

# Triet ly

FocusGuard khong co gang cam nguoi dung.

No chi tao ra mot khoang dung ngan de giup nguoi dung suy nghi truoc khi tiep tuc luot.

Neu sau 30 giay ban van muon xem, FocusGuard se ngan can.
