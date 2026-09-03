# Privacy Policy

**Effective date:** September 2026

FocusGuard ("the extension") is committed to keeping your browsing data private. This policy explains what information the extension collects, how it is used, and what it never does.

## TL;DR

- **No data leaves your device.** FocusGuard does not upload, transmit, or share any data to any server.
- **Everything is stored locally** on your machine using Chrome's `storage.local`.
- **No analytics, no trackers, no advertising, no third-party SDKs** are included.

## Data We Collect

FocusGuard stores the following information **locally** on your device:

- **Settings** you configure (enabled platforms, strict mode, Pomodoro durations, daily goal, whitelist/blacklist entries, theme preference).
- **Usage statistics** such as the number of times a page was blocked, per platform and per day.
- **Active timers** (Pomodoro phase and end time, temporary override/allow windows) needed to deliver the extension's core function.

All of this data is written only to `chrome.storage.local`, which lives in your browser's own profile and is not accessible to us.

## Permissions & Why We Use Them

| Permission | Purpose |
| ---------- | ------- |
| `storage` | Persist your settings and usage statistics locally. |
| `alarms` | Drive the Pomodoro timer in the background. |
| `tabs` | Close a tab when you choose "Quay lại" or when strict mode / daily-goal limit is reached. |

**Host permissions** are limited to the social platforms the extension operates on (`youtube.com`, `tiktok.com`, `instagram.com`, `facebook.com`). The extension only ever reads the URL and DOM it needs to decide whether to show the FocusGuard confirmation, and it never modifies your accounts or posts.

## Data We Do NOT Collect

- No personal information (name, email, phone number, address).
- No browsing history outside the supported platforms.
- No account credentials, login data, or cookies.
- No keystrokes, form input, or text you type.
- No device identifiers, IP addresses, or location data.

## Retention & Deletion

- Usage statistics older than **30 days** are automatically pruned and permanently removed from local storage.
- You can clear all FocusGuard data at any time by removing the extension, or by clearing the extension's storage from Chrome's settings.

## Third-Party Sharing

None. FocusGuard has no third-party analytics, crash reporting, or advertising libraries. There is no remote telemetry.

## MindSeed Integration

FocusGuard can optionally sync its Pomodoro timer with the **MindSeed** web app you choose to open. This communication happens entirely through in-page `window.postMessage` events between your browser tabs — it does **not** send data over the network or to any server. You can ignore this feature entirely; it is off by default.

## Contact

If you have questions about this policy, open an issue at the FocusGuard repository.

---

*This policy applies to Chrome Web Store versions of FocusGuard. By installing and using the extension, you acknowledge that the described data handling is local-only.*
