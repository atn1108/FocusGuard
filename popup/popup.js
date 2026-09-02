const ids = [
    "enabled",
    "youtube",
    "tiktok",
    "instagram",
    "facebook"
];

const statKeys = {
    youtube: "stat-youtube",
    tiktok: "stat-tiktok",
    instagram: "stat-instagram",
    facebook: "stat-facebook"
};

const overrideIds = {
    youtube: "cd-youtube",
    tiktok: "cd-tiktok",
    instagram: "cd-instagram",
    facebook: "cd-facebook"
};

function applyEnabledState(enabled) {
    document.body.classList.toggle("disabled", !enabled);
}

function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
}

function load() {
    chrome.storage.local.get(
        [...ids, "strictMode", "theme", "pomodoro", "dailyGoal"],
        data => {
            ids.forEach(id => {
                const el = document.getElementById(id);
                if (el) {
                    el.checked = data[id] !== false;
                }
            });

            applyEnabledState(data.enabled !== false);

            const strictEl = document.getElementById("strictMode");
            if (strictEl) strictEl.checked = data.strictMode === true;

            applyTheme(data.theme || "auto");

            updatePomodoroDisplay(data.pomodoro);
            updateDailyGoalDisplay(data.dailyGoal);
        }
    );
}

function save(id) {
    const value = document.getElementById(id).checked;
    chrome.storage.local.set({ [id]: value }, () => {
        if (id === "enabled") {
            applyEnabledState(value);
        }
    });
}

function loadStats() {
    chrome.storage.local.get(["stats"], data => {
        const stats = data.stats || {};
        Object.keys(statKeys).forEach(key => {
            const el = document.getElementById(statKeys[key]);
            if (el) {
                el.textContent = stats[key] || 0;
            }
        });
    });
}

function loadStreak() {
    chrome.runtime.sendMessage({ type: "GET_STREAK" }, result => {
        const el = document.getElementById("streak-count");
        if (el && result) {
            el.textContent = result.streak || 0;
        }
    });
}

function formatRemaining(ms) {
    const totalSec = Math.max(0, Math.floor(ms / 1000));
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m}p ${s}s`;
}

function updateCountdowns() {
    chrome.storage.local.get(["override"], data => {
        const override = data.override || {};
        const now = Date.now();
        Object.keys(overrideIds).forEach(platform => {
            const el = document.getElementById(overrideIds[platform]);
            const until = override[platform];
            if (until && now < until) {
                el.textContent = formatRemaining(until - now);
                el.classList.add("active");
            } else {
                el.textContent = "";
                el.classList.remove("active");
            }
        });
    });
}

function updatePomodoroDisplay(pomo) {
    const section = document.getElementById("pomodoro-section");
    if (!section) return;

    pomo = pomo || {};
    if (!pomo.enabled || !pomo.endsAt) {
        section.style.display = "none";
        return;
    }

    section.style.display = "block";

    const now = Date.now();
    const remaining = Math.max(0, pomo.endsAt - now);
    const totalDuration = pomo.isBreak
        ? (pomo.breakMinutes || 5) * 60 * 1000
        : (pomo.focusMinutes || 25) * 60 * 1000;

    const totalSec = Math.ceil(remaining / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;

    const phase = document.getElementById("pomo-phase");
    const timer = document.getElementById("pomo-timer");
    const progress = document.getElementById("pomo-progress");
    const source = document.getElementById("pomo-source");

    if (phase) {
        phase.textContent = pomo.isBreak ? "Nghỉ giải lao" : "Đang tập trung";
    }
    if (timer) {
        timer.textContent = `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
    }
    if (progress) {
        const pct = Math.max(0, Math.min(100, (remaining / totalDuration) * 100));
        progress.style.width = pct + "%";
        progress.style.background = pomo.isBreak ? "#16a34a" : "#2563eb";
    }
    if (source) {
        source.style.display = pomo.fromMindSeed ? "" : "none";
    }
}

function updateDailyGoalDisplay(goal) {
    const section = document.getElementById("daily-goal-section");
    if (!section) return;

    goal = goal || {};
    if (!goal.enabled) {
        section.style.display = "none";
        return;
    }

    const today = new Date().toDateString();
    if (goal.date !== today) {
        goal.currentOverrides = 0;
    }

    section.style.display = "block";

    const current = goal.currentOverrides || 0;
    const max = goal.maxOverrides || 3;

    const currentEl = document.getElementById("goal-current");
    const maxEl = document.getElementById("goal-max");
    const fill = document.getElementById("goal-bar-fill");

    if (currentEl) currentEl.textContent = current;
    if (maxEl) maxEl.textContent = max;
    if (fill) {
        const pct = Math.min(100, (current / max) * 100);
        fill.style.width = pct + "%";
        if (pct >= 100) {
            fill.style.background = "#dc2626";
        } else if (pct >= 70) {
            fill.style.background = "#ea580c";
        } else {
            fill.style.background = "#2563eb";
        }
    }
}


ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
        el.addEventListener("change", () => save(id));
    }
});

const strictEl = document.getElementById("strictMode");
if (strictEl) {
    strictEl.addEventListener("change", () => {
        chrome.storage.local.set({ strictMode: strictEl.checked });
    });
}

const themeSwitch = document.getElementById("theme-switch");
if (themeSwitch) {
    themeSwitch.addEventListener("click", () => {
        chrome.storage.local.get(["theme"], data => {
            const current = data.theme || "auto";
            const themes = ["auto", "light", "dark"];
            const idx = themes.indexOf(current);
            const next = themes[(idx + 1) % themes.length];
            chrome.storage.local.set({ theme: next }, () => {
                applyTheme(next);
            });
        });
    });
}

const openOptions = document.getElementById("open-options");
if (openOptions) {
    openOptions.addEventListener("click", e => {
        e.preventDefault();
        chrome.runtime.openOptionsPage();
    });
}

load();
loadStats();
loadStreak();
updateCountdowns();
setInterval(updateCountdowns, 1000);

setInterval(() => {
    chrome.storage.local.get(["pomodoro"], data => {
        updatePomodoroDisplay(data.pomodoro);
    });
}, 1000);

chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "local") {
        if (changes.dailyGoal) {
            updateDailyGoalDisplay(changes.dailyGoal.newValue);
        }
        if (changes.pomodoro) {
            updatePomodoroDisplay(changes.pomodoro.newValue);
        }
    }
});
