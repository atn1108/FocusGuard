const translations = {
    vi: {
        // Popup
        pomodoro: "Pomodoro",
        focusSession: "Đang tập trung",
        breakTime: "Nghỉ giải lao",
        dailyGoal: "Mục tiêu hôm nay",
        bypassCount: "lượt bypass",
        blockContent: "Chặn nội dung",
        youtubeShorts: "YouTube Shorts",
        tiktok: "TikTok",
        instagramReels: "Instagram Reels",
        facebookReels: "Facebook Reels",
        security: "Bảo mật",
        strictMode: "Chế độ nghiêm ngặt",
        stats: "Thống kê hôm nay",
        streak: "Chuỗi",
        days: "ngày",
        advancedSettings: "Cài đặt nâng cao",

        // Options
        settingsTitle: "Cài đặt",
        settingsDesc: "Cài đặt chặn nội dung gây mất tập trung",
        blockByPlatform: "Chặn theo nền tảng",
        blockAll: "Chặn toàn trang",
        blockShorts: "Chặn /shorts/*",
        blockReels: "Chặn /reel*, /reels*",
        strictModeDesc: "Khi bật, không thể bỏ qua chặn. Phải chờ 60 giây rồi chỉ được quay lại.",
        enableStrictMode: "Bật chế độ nghiêm ngặt",
        pomodoroTitle: "Pomodoro",
        pomodoroDesc: "Tập trung theo chu kỳ. Trong giờ nghỉ, FocusGuard tạm ngừng chặn.",
        enablePomodoro: "Bật Pomodoro",
        focusTime: "Thời gian tập trung (phút)",
        breakTimeLabel: "Nghỉ giải lao (phút)",
        start: "Bắt đầu",
        stop: "Dừng",
        dailyGoalTitle: "Mục tiêu hàng ngày",
        dailyGoalDesc: "Giới hạn số lần bạn được bỏ qua chặn mỗi ngày.",
        enableDailyGoal: "Bật mục tiêu",
        maxBypass: "Số lần bypass tối đa / ngày",
        whitelist: "Whitelist",
        blacklist: "Blacklist",
        whitelistDesc: "Whitelist: không bao giờ chặn. Blacklist: luôn chặn (dù nền tảng tắt).",
        blockAllowList: "Danh sách chặn / cho phép",
        pause: "Tạm ngưng",
        pauseDesc: "Tạm ngừng tất cả chặn trong 5 phút.",
        pause5min: "Tạm dừng 5 phút",
        appearance: "Giao diện",
        auto: "Tự động",
        light: "Sáng",
        dark: "Tối",
        saved: "Đã lưu",
        savedAdd: "Đã thêm",
        savedDelete: "Đã xóa",
        savedExists: "Đã tồn tại",
        pomodoroStarted: "Pomodoro đã bắt đầu",
        pomodoroStopped: "Pomodoro đã dừng",
        allow5min: "Đã mở 5 phút",
        placeholderWhitelist: "youtube.com/watch?v=...",
        placeholderBlacklist: "tiktok.com/fyp...",
    },
    en: {
        // Popup
        pomodoro: "Pomodoro",
        focusSession: "Focusing",
        breakTime: "Break time",
        dailyGoal: "Daily goal",
        bypassCount: "bypasses",
        blockContent: "Block content",
        youtubeShorts: "YouTube Shorts",
        tiktok: "TikTok",
        instagramReels: "Instagram Reels",
        facebookReels: "Facebook Reels",
        security: "Security",
        strictMode: "Strict mode",
        stats: "Today's stats",
        streak: "Streak",
        days: "days",
        advancedSettings: "Advanced settings",

        // Options
        settingsTitle: "Settings",
        settingsDesc: "Configure distraction blocking settings",
        blockByPlatform: "Block by platform",
        blockAll: "Block entire site",
        blockShorts: "Block /shorts/*",
        blockReels: "Block /reel*, /reels*",
        strictModeDesc: "When enabled, you cannot bypass blocks. Must wait 60 seconds before going back.",
        enableStrictMode: "Enable strict mode",
        pomodoroTitle: "Pomodoro",
        pomodoroDesc: "Focus in cycles. During breaks, FocusGuard pauses blocking.",
        enablePomodoro: "Enable Pomodoro",
        focusTime: "Focus time (minutes)",
        breakTimeLabel: "Break time (minutes)",
        start: "Start",
        stop: "Stop",
        dailyGoalTitle: "Daily goal",
        dailyGoalDesc: "Limit the number of bypasses you can use each day.",
        enableDailyGoal: "Enable daily goal",
        maxBypass: "Max bypasses / day",
        whitelist: "Whitelist",
        blacklist: "Blacklist",
        whitelistDesc: "Whitelist: never block. Blacklist: always block (even when platform is off).",
        blockAllowList: "Block / Allow list",
        pause: "Pause",
        pauseDesc: "Pause all blocking for 5 minutes.",
        pause5min: "Pause for 5 min",
        appearance: "Appearance",
        auto: "Auto",
        light: "Light",
        dark: "Dark",
        saved: "Saved",
        savedAdd: "Added",
        savedDelete: "Deleted",
        savedExists: "Already exists",
        pomodoroStarted: "Pomodoro started",
        pomodoroStopped: "Pomodoro stopped",
        allow5min: "Unblocked for 5 min",
        placeholderWhitelist: "youtube.com/watch?v=...",
        placeholderBlacklist: "tiktok.com/fyp...",
    }
};

let currentLang = "vi";

function t(key) {
    return (translations[currentLang] && translations[currentLang][key]) || key;
}

function setLanguage(lang) {
    currentLang = lang;
    document.documentElement.setAttribute("lang", lang);
    document.documentElement.setAttribute("dir", "ltr");
}

function getLanguage() {
    return currentLang;
}

function initLanguage(callback) {
    chrome.storage.local.get(["language"], data => {
        currentLang = data.language || "vi";
        document.documentElement.setAttribute("lang", currentLang);
        if (callback) callback(currentLang);
    });
}

function saveLanguage(lang) {
    currentLang = lang;
    chrome.storage.local.set({ language: lang });
    document.documentElement.setAttribute("lang", lang);
}
